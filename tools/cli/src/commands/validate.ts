import { Command } from 'commander'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  validateWorkoutLog,
  validateWorkoutTemplate,
  validateProgram,
  validateLifterProfile,
  type ValidationResult,
} from '@openweight/sdk'

const SCHEMA_VALIDATORS: Record<string, (data: unknown) => ValidationResult> = {
  'workout-log': validateWorkoutLog,
  'workout-template': validateWorkoutTemplate,
  'program': validateProgram,
  'lifter-profile': validateLifterProfile,
}

const SCHEMA_NAMES = Object.keys(SCHEMA_VALIDATORS)

export const validateCommand = new Command('validate')
  .description('Validate a JSON file against an openweight schema')
  .argument('<file>', 'JSON file to validate (use - for stdin)')
  .option(
    '-s, --schema <type>',
    `Schema type: ${SCHEMA_NAMES.join(', ')}. Auto-detected if not specified.`
  )
  .action(async (file: string, options: { schema?: string }) => {
    try {
      // Read input
      const input = file === '-'
        ? readStdin()
        : readFileSync(resolve(file), 'utf-8')

      // Parse JSON
      let data: unknown
      try {
        data = JSON.parse(input)
      } catch {
        console.error('Error: Invalid JSON')
        process.exit(1)
      }

      // Determine schema
      const schemaType = options.schema ?? detectSchema(data)
      if (!schemaType) {
        console.error(
          'Error: Could not auto-detect schema type. Use --schema to specify one of:',
          SCHEMA_NAMES.join(', ')
        )
        process.exit(1)
      }

      const validator = SCHEMA_VALIDATORS[schemaType]
      if (!validator) {
        console.error(`Error: Unknown schema "${schemaType}". Valid schemas: ${SCHEMA_NAMES.join(', ')}`)
        process.exit(1)
      }

      // Validate
      const result = validator(data)

      if (result.valid) {
        console.log(`Valid ${schemaType}`)
        process.exit(0)
      } else {
        console.error(`Invalid ${schemaType}:`)
        for (const error of result.errors) {
          console.error(`  ${error.path}: ${error.message}`)
        }
        process.exit(1)
      }
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : String(err)}`)
      process.exit(1)
    }
  })

function detectSchema(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const obj = data as Record<string, unknown>

  // LifterProfile has exportedAt
  if ('exportedAt' in obj) return 'lifter-profile'

  // Program has weeks
  if ('weeks' in obj) return 'program'

  // WorkoutLog has date + exercises
  if ('date' in obj && 'exercises' in obj) {
    // Check if exercises have sets with targets → template
    const exercises = obj.exercises as Array<Record<string, unknown>>
    if (exercises?.[0]?.sets) {
      const firstSet = (exercises[0].sets as unknown[])[0] as Record<string, unknown> | undefined
      if (firstSet && ('targetReps' in firstSet || 'targetWeight' in firstSet)) {
        return 'workout-template'
      }
    }
    return 'workout-log'
  }

  // WorkoutTemplate has name + exercises (no date)
  if ('name' in obj && 'exercises' in obj && !('date' in obj)) {
    return 'workout-template'
  }

  return null
}

function readStdin(): string {
  return readFileSync(0, 'utf-8')
}
