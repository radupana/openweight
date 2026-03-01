import { validateWorkoutLog } from '@openweight/sdk'
import { parseCSV } from './parsers/csv.js'
import { strongParser } from './parsers/strong.js'
import { hevyParser } from './parsers/hevy.js'
import { transformRows } from './transform/transformer.js'
import { hasExerciseMapping } from './mapping/exercise-names.js'
import { buildReport } from './report.js'
import { FormatDetectionError, ConvertError } from './errors.js'
import type {
  ConvertOptions,
  ConvertResult,
  SourceFormat,
  SourceParser,
  ConversionWarning,
} from './types.js'

const PARSERS: SourceParser[] = [strongParser, hevyParser]

/**
 * Detect the source format of a CSV string by examining its headers.
 */
export function detectFormat(csv: string): SourceFormat {
  const { headers } = parseCSV(csv)
  for (const parser of PARSERS) {
    if (parser.detect(headers)) return parser.format
  }
  throw new FormatDetectionError()
}

/**
 * Convert a CSV string from a fitness app into openweight WorkoutLog objects.
 */
export function convert(options: ConvertOptions): ConvertResult {
  const { csv, format: formatOption } = options
  const warnings: ConversionWarning[] = []

  // Parse CSV
  const { headers, rows } = parseCSV(csv)

  // Detect or verify format
  const format = formatOption ?? detectFormat(csv)
  const parser = PARSERS.find((p) => p.format === format)
  if (!parser) {
    throw new ConvertError(`Unsupported format: ${format}`, 'UNSUPPORTED_FORMAT')
  }

  if (!parser.detect(headers)) {
    throw new ConvertError(
      `CSV headers do not match expected ${format} format`,
      'FORMAT_MISMATCH'
    )
  }

  // Map columns
  const columnMappings = parser.mapColumns(headers)
  const unmappedColumns = columnMappings.filter((m) => m.tier === 'unmapped')
  for (const col of unmappedColumns) {
    warnings.push({
      type: 'unmapped_column',
      message: `Column "${col.sourceColumn}" was not mapped to any field`,
    })
  }

  // Parse rows into intermediate format
  const intermediateRows = []
  let skippedRows = 0
  const exerciseNames = new Set<string>()

  for (let i = 0; i < rows.length; i++) {
    const result = parser.parseRow(rows[i], i, options)
    if (result) {
      intermediateRows.push(result)
      exerciseNames.add(result.exerciseName)
    } else {
      skippedRows++
      warnings.push({
        type: 'skipped_row',
        message: `Row ${i + 2} was skipped (missing required fields)`,
        sourceRow: i + 2,
      })
    }
  }

  // Track unmapped exercise names
  const unmappedExercises: string[] = []
  for (const name of exerciseNames) {
    if (!hasExerciseMapping(name, options.exerciseMappings)) {
      unmappedExercises.push(name)
    }
  }

  // Transform into WorkoutLog objects
  const { workouts: rawWorkouts, warnings: transformWarnings } =
    transformRows(intermediateRows)
  warnings.push(...transformWarnings)

  // Validate each workout
  const workouts = []
  for (const workout of rawWorkouts) {
    const result = validateWorkoutLog(workout)
    if (result.valid) {
      workouts.push(workout)
    } else {
      warnings.push({
        type: 'validation',
        message: `Workout on ${workout.date} failed validation`,
        details: result.errors.map((e) => `${e.path}: ${e.message}`).join('; '),
      })
    }
  }

  const report = buildReport({
    source: format,
    totalRows: rows.length,
    convertedRows: intermediateRows.length,
    skippedRows,
    workouts,
    columnMappings,
    unmappedExercises,
    warnings,
  })

  return { workouts, report }
}
