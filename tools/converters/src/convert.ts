import { validateWorkoutLog } from '@openweight/sdk'
import { parseCSV } from './parsers/csv.js'
import { strongParser } from './parsers/strong.js'
import { hevyParser } from './parsers/hevy.js'
import { isJefit, parseJefit } from './parsers/jefit.js'
import { mapColumnsWithAI } from './mapping/column-mapper.js'
import { transformRows } from './transform/transformer.js'
import { hasExerciseMapping } from './mapping/exercise-names.js'
import { buildReport } from './report.js'
import { FormatDetectionError, ConvertError } from './errors.js'
import type {
  ConvertOptions,
  ConvertResult,
  SourceFormat,
  SourceParser,
  ColumnMapping,
  ConversionWarning,
} from './types.js'
import type { AIColumnMapping, AIExerciseMapping } from './ai/provider.js'

import mappingsJson from './mapping/exercise-mappings.json' with { type: 'json' }

const PARSERS: SourceParser[] = [strongParser, hevyParser]

/**
 * Detect the source format of a CSV string by examining its headers.
 */
export function detectFormat(csv: string): SourceFormat {
  // Check for JEFIT section markers before CSV parsing
  if (isJefit(csv)) return 'jefit'

  const { headers } = parseCSV(csv)
  for (const parser of PARSERS) {
    if (parser.detect(headers)) return parser.format
  }
  throw new FormatDetectionError()
}

/**
 * Convert a CSV string from a fitness app into openweight WorkoutLog objects.
 */
export async function convert(options: ConvertOptions): Promise<ConvertResult> {
  const { csv, format: formatOption } = options
  const warnings: ConversionWarning[] = []

  // Detect format early — JEFIT needs a completely different parse path
  const format = formatOption ?? detectFormat(csv)

  if (format === 'jefit') {
    return convertJefit(csv, format, options)
  }

  // Parse CSV
  const { headers, rows } = parseCSV(csv)

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
  let columnMappings: ColumnMapping[] = parser.mapColumns(headers)
  let aiColumnMappings: AIColumnMapping[] | undefined
  let aiExerciseSuggestions: AIExerciseMapping[] | undefined

  // Tier 3: AI column mapping if provider is available
  if (options.ai) {
    const unmapped = columnMappings.filter((m) => m.tier === 'unmapped')
    if (unmapped.length > 0) {
      try {
        // Re-run with AI — we need the parser's exact/alias maps
        // The parser.mapColumns already ran Tier 1+2, so we pass through to AI
        const sampleRows = rows.slice(0, 5)
        const result = await mapColumnsWithAI(
          headers,
          getExactMap(parser),
          getAliasMap(parser),
          options.ai,
          sampleRows
        )
        columnMappings = result.mappings
        if (result.aiMappings.length > 0) {
          aiColumnMappings = result.aiMappings
        }
      } catch (err) {
        warnings.push({
          type: 'parse',
          message: `AI column mapping failed, falling back to Tier 1+2: ${err instanceof Error ? err.message : String(err)}`,
        })
      }
    }
  }

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

  // AI exercise name normalization
  if (options.ai && unmappedExercises.length > 0) {
    try {
      const knownCanonicalNames = Object.values(mappingsJson as Record<string, string>)
      const uniqueCanonicals = [...new Set(knownCanonicalNames)]

      const suggestions = await options.ai.normalizeExerciseNames({
        unknownNames: unmappedExercises,
        knownCanonicalNames: uniqueCanonicals,
      })

      if (suggestions.length > 0) {
        aiExerciseSuggestions = suggestions
      }
    } catch (err) {
      warnings.push({
        type: 'parse',
        message: `AI exercise normalization failed: ${err instanceof Error ? err.message : String(err)}`,
      })
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

  // Attach AI results to report
  if (aiColumnMappings) report.aiColumnMappings = aiColumnMappings
  if (aiExerciseSuggestions) report.aiExerciseSuggestions = aiExerciseSuggestions

  return { workouts, report }
}

/**
 * JEFIT-specific conversion path.
 * JEFIT is a multi-section composite file, not a flat CSV,
 * so it bypasses the flat CSV parse → detect → mapColumns pipeline
 * and rejoins at the transform step.
 */
async function convertJefit(
  csv: string,
  format: SourceFormat,
  options: ConvertOptions
): Promise<ConvertResult> {
  const {
    rows: intermediateRows,
    totalLogRows,
    skippedLogRows,
    warnings,
    columnMappings,
  } = parseJefit(csv, options)

  // Track unmapped exercise names
  const exerciseNames = new Set<string>()
  for (const row of intermediateRows) {
    exerciseNames.add(row.exerciseName)
  }
  const unmappedExercises: string[] = []
  for (const name of exerciseNames) {
    if (!hasExerciseMapping(name, options.exerciseMappings)) {
      unmappedExercises.push(name)
    }
  }

  // AI exercise name normalization
  let aiExerciseSuggestions: AIExerciseMapping[] | undefined
  if (options.ai && unmappedExercises.length > 0) {
    try {
      const knownCanonicalNames = Object.values(mappingsJson as Record<string, string>)
      const uniqueCanonicals = [...new Set(knownCanonicalNames)]

      const suggestions = await options.ai.normalizeExerciseNames({
        unknownNames: unmappedExercises,
        knownCanonicalNames: uniqueCanonicals,
      })

      if (suggestions.length > 0) {
        aiExerciseSuggestions = suggestions
      }
    } catch (err) {
      warnings.push({
        type: 'parse',
        message: `AI exercise normalization failed: ${err instanceof Error ? err.message : String(err)}`,
      })
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
    totalRows: totalLogRows,
    convertedRows: totalLogRows - skippedLogRows,
    skippedRows: skippedLogRows,
    workouts,
    columnMappings,
    unmappedExercises,
    warnings,
  })

  if (aiExerciseSuggestions) report.aiExerciseSuggestions = aiExerciseSuggestions

  return { workouts, report }
}

// Helper to extract exact maps from parsers (they use mapColumns internally)
// We inspect the parser's known columns by looking at its format
// These maps mirror the parser-internal column maps exactly.
// They are duplicated here so mapColumnsWithAI can re-run Tier 1+2.
function getExactMap(parser: SourceParser): Record<string, string> {
  if (parser.format === 'strong') {
    return {
      'Date': 'rawDate',
      'Workout Name': 'workoutName',
      'Duration': 'rawDuration',
      'Exercise Name': 'exerciseName',
      'Set Order': 'setIndex',
      'Weight': 'weight',
      'Reps': 'reps',
      'Distance': 'distance',
      'Seconds': 'durationSeconds',
      'Notes': 'exerciseNotes',
      'Workout Notes': 'workoutNotes',
      'RPE': 'rpe',
    }
  }
  if (parser.format === 'hevy') {
    return {
      'title': 'workoutName',
      'start_time': 'rawDate',
      'end_time': 'endTime',
      'description': 'workoutNotes',
      'exercise_title': 'exerciseName',
      'superset_id': 'supersetId',
      'exercise_notes': 'exerciseNotes',
      'reps': 'reps',
      'weight_kg': 'weightKg',
      'weight_lbs': 'weightLbs',
      'duration_seconds': 'durationSeconds',
      'distance_km': 'distanceKm',
      'distance_miles': 'distanceMiles',
      'rpe': 'rpe',
      'set_index': 'setIndex',
      'set_type': 'rawSetType',
    }
  }
  // JEFIT uses its own parse path — no flat column mapping
  return {}
}

function getAliasMap(parser: SourceParser): Record<string, string> {
  if (parser.format === 'strong') {
    return {
      'workout_name': 'workoutName',
      'exercise_name': 'exerciseName',
      'set_order': 'setIndex',
      'workout_notes': 'workoutNotes',
      'exercise_notes': 'exerciseNotes',
    }
  }
  if (parser.format === 'hevy') {
    return {
      'workout_title': 'workoutName',
      'exercise_name': 'exerciseName',
      'set_order': 'setIndex',
      'notes': 'workoutNotes',
      'weight': 'weightKg',
      'distance': 'distanceKm',
    }
  }
  return {}
}
