import { Command } from 'commander'
import { readFileSync, writeFileSync } from 'node:fs'
import { convert, detectFormat } from '@openweight/converters'
import type { SourceFormat, ConversionReport } from '@openweight/converters'
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
  .action(async (file: string, options: {
    format?: string
    weightUnit?: string
    output?: string
    pretty: boolean
    report: boolean
  }) => {
    try {
      const csv = readFileSync(file, 'utf-8')

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

      const result = convert({ csv, format, weightUnit })

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
        writeFileSync(options.output, output + '\n')
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

  if (report.warnings.length > 0) {
    console.error(`\nWarnings (${report.warnings.length}):`)
    for (const w of report.warnings) {
      console.error(`  ${w.message}`)
    }
  }
}
