import { Command } from 'commander'
import { readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { resolvePath } from '../resolve-path.js'
import { convert, detectFormat, createAIProvider, MappingCache } from '@openweight/converters'
import type { SourceFormat, ConversionReport, AIColumnMapping, AIExerciseMapping } from '@openweight/converters'
import type { WeightUnit } from '@openweight/sdk'

export const convertCommand = new Command('convert')
  .description('Convert a CSV export from a fitness app into openweight JSON')
  .argument('<file>', 'CSV file to convert')
  .option(
    '-f, --format <format>',
    'Source format: strong, hevy. Auto-detected if not specified.'
  )
  .option(
    '-u, --weight-unit <unit>',
    'Weight unit for formats without a unit column (e.g. Strong): kg or lb'
  )
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .option('--pretty', 'Pretty-print JSON output', false)
  .option('--report', 'Print conversion report to stderr', false)
  .option('--ai-assist', 'Use AI to map unknown columns and normalize exercise names', false)
  .option('--auto-approve', 'Skip confirmation prompts for AI suggestions', false)
  .option('--ai-model <model>', 'AI model to use (default: gpt-4o-mini)')
  .action(async (file: string, options: {
    format?: string
    weightUnit?: string
    output?: string
    pretty: boolean
    report: boolean
    aiAssist: boolean
    autoApprove: boolean
    aiModel?: string
  }) => {
    try {
      const csv = readFileSync(resolvePath(file), 'utf-8')

      // Validate format option
      let format: SourceFormat | undefined
      if (options.format) {
        if (options.format !== 'strong' && options.format !== 'hevy') {
          console.error(`Error: Unknown format "${options.format}". Supported: strong, hevy`)
          process.exit(1)
        }
        format = options.format
      }

      // Validate weight unit
      let weightUnit: WeightUnit | undefined
      if (options.weightUnit) {
        if (options.weightUnit !== 'kg' && options.weightUnit !== 'lb') {
          console.error(`Error: Invalid weight unit "${options.weightUnit}". Use: kg or lb`)
          process.exit(1)
        }
        weightUnit = options.weightUnit
      }

      // Auto-detect format if not specified
      if (!format) {
        try {
          format = detectFormat(csv)
        } catch {
          console.error(
            'Error: Could not auto-detect CSV format. Use --format to specify one of: strong, hevy'
          )
          process.exit(1)
        }
      }

      // Strong requires weight unit
      if (format === 'strong' && !weightUnit) {
        console.error(
          'Error: Strong CSV exports do not include weight units. Use --weight-unit to specify: kg or lb'
        )
        process.exit(1)
      }

      // Set up AI provider if requested
      let ai
      let cache: MappingCache | undefined
      if (options.aiAssist) {
        try {
          ai = await createAIProvider({ model: options.aiModel })
          cache = new MappingCache()
          console.error('AI-assisted conversion enabled')
        } catch (err) {
          console.error(`Error: ${err instanceof Error ? err.message : String(err)}`)
          process.exit(1)
        }
      }

      let result = await convert({ csv, format, weightUnit, ai })

      // Handle AI suggestions with interactive confirmation
      if (options.aiAssist && cache) {
        let needsRerun = false
        const confirmedExerciseMappings: Record<string, string> = {}

        // Column mapping suggestions
        if (result.report.aiColumnMappings?.length) {
          console.error('\nAI column mapping suggestions:')
          for (const m of result.report.aiColumnMappings) {
            console.error(`  "${m.sourceColumn}" → ${m.targetField} (confidence: ${(m.confidence * 100).toFixed(0)}%, ${m.reasoning})`)
          }

          if (!options.autoApprove) {
            const accepted = await promptConfirm('Accept these column mappings?')
            if (accepted) {
              // Save to cache
              const cacheEntry: Record<string, string> = {}
              for (const m of result.report.aiColumnMappings) {
                cacheEntry[m.sourceColumn] = m.targetField
              }
              cache.setColumnMappings(
                result.report.columnMappings.map((m) => m.sourceColumn),
                cacheEntry
              )
              cache.save()
              console.error('Column mappings saved to cache.')
            }
          } else {
            // Auto-approve: save to cache
            const cacheEntry: Record<string, string> = {}
            for (const m of result.report.aiColumnMappings) {
              cacheEntry[m.sourceColumn] = m.targetField
            }
            cache.setColumnMappings(
              result.report.columnMappings.map((m) => m.sourceColumn),
              cacheEntry
            )
            cache.save()
          }
        }

        // Exercise name suggestions
        if (result.report.aiExerciseSuggestions?.length) {
          console.error('\nAI exercise name suggestions:')
          for (const s of result.report.aiExerciseSuggestions) {
            console.error(`  "${s.originalName}" → "${s.canonicalName}" (confidence: ${(s.confidence * 100).toFixed(0)}%, ${s.reasoning})`)
          }

          let accepted = options.autoApprove
          if (!options.autoApprove) {
            accepted = await promptConfirm('Accept these exercise name mappings?')
          }

          if (accepted) {
            for (const s of result.report.aiExerciseSuggestions) {
              confirmedExerciseMappings[s.originalName] = s.canonicalName
              cache.setExerciseMapping(s.originalName, s.canonicalName)
            }
            cache.save()
            needsRerun = true
            console.error('Exercise mappings saved to cache.')
          }
        }

        // Re-run with confirmed exercise mappings applied
        if (needsRerun) {
          console.error('Re-running conversion with confirmed mappings...')
          result = await convert({
            csv,
            format,
            weightUnit,
            ai,
            exerciseMappings: confirmedExerciseMappings,
          })
        }
      }

      // Always print AI-related warnings to stderr when --ai-assist is on
      if (options.aiAssist) {
        const aiWarnings = result.report.warnings.filter(
          (w) => w.message.includes('AI ')
        )
        for (const w of aiWarnings) {
          console.error(`Warning: ${w.message}`)
        }
      }

      if (result.workouts.length === 0) {
        console.error('Error: No valid workouts produced from conversion')
        if (result.report.warnings.length > 0) {
          console.error('\nWarnings:')
          for (const w of result.report.warnings) {
            console.error(`  ${w.message}`)
          }
        }
        process.exit(1)
      }

      // Output JSON
      const output = result.workouts.length === 1
        ? JSON.stringify(result.workouts[0], null, options.pretty ? 2 : undefined)
        : JSON.stringify(result.workouts, null, options.pretty ? 2 : undefined)

      if (options.output) {
        writeFileSync(resolvePath(options.output), output + '\n')
        console.error(`Wrote ${result.workouts.length} workout(s) to ${options.output}`)
      } else {
        process.stdout.write(output + '\n')
      }

      // Print report
      if (options.report) {
        printReport(result.report)
      }

      process.exit(0)
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : String(err)}`)
      process.exit(1)
    }
  })

function printReport(report: ConversionReport): void {
  console.error('\n--- Conversion Report ---')
  console.error(`Source:     ${report.source}`)
  console.error(`Rows:       ${report.convertedRows}/${report.totalRows} converted, ${report.skippedRows} skipped`)
  console.error(`Workouts:   ${report.workoutCount}`)
  console.error(`Exercises:  ${report.exerciseCount}`)

  if (report.unmappedExercises.length > 0) {
    console.error(`\nUnmapped exercises (kept as-is):`)
    for (const name of report.unmappedExercises) {
      console.error(`  - ${name}`)
    }
  }

  if (report.aiColumnMappings?.length) {
    console.error(`\nAI column mappings (${report.aiColumnMappings.length}):`)
    for (const m of report.aiColumnMappings) {
      console.error(`  "${m.sourceColumn}" → ${m.targetField}`)
    }
  }

  if (report.aiExerciseSuggestions?.length) {
    console.error(`\nAI exercise suggestions (${report.aiExerciseSuggestions.length}):`)
    for (const s of report.aiExerciseSuggestions) {
      console.error(`  "${s.originalName}" → "${s.canonicalName}"`)
    }
  }

  if (report.warnings.length > 0) {
    console.error(`\nWarnings (${report.warnings.length}):`)
    for (const w of report.warnings) {
      console.error(`  ${w.message}`)
    }
  }
}

function promptConfirm(message: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stderr })
  return new Promise((resolve) => {
    rl.question(`${message} [Y/n] `, (answer) => {
      rl.close()
      resolve(answer.trim().toLowerCase() !== 'n')
    })
  })
}
