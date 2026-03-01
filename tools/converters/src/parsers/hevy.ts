import { mapColumns } from '../mapping/column-mapper.js'
import { normalizeExerciseName } from '../mapping/exercise-names.js'
import { parseNumber, parseWeightUnit, parseDistanceUnit } from '../transform/units.js'
import type {
  SourceParser,
  ColumnMapping,
  IntermediateRow,
  ConvertOptions,
} from '../types.js'

/**
 * Hevy CSV columns (as of 2024 export):
 * title, start_time, end_time, description, exercise_title,
 * superset_id, exercise_notes, reps, weight_kg, weight_lbs,
 * duration_seconds, distance_km, distance_miles, rpe, set_index, set_type
 *
 * Hevy exports weight in both kg and lbs columns.
 */
const EXACT_COLUMNS: Record<string, string> = {
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

const ALIAS_COLUMNS: Record<string, string> = {
  'workout_title': 'workoutName',
  'exercise_name': 'exerciseName',
  'set_order': 'setIndex',
  'notes': 'workoutNotes',
  'weight': 'weightKg',
  'distance': 'distanceKm',
}

/** Hevy signature headers */
const REQUIRED_HEADERS = ['title', 'start_time', 'exercise_title', 'set_index']

export const hevyParser: SourceParser = {
  format: 'hevy',

  detect(headers: string[]): boolean {
    const headerSet = new Set(headers.map((h) => h.trim()))
    return REQUIRED_HEADERS.every((h) => headerSet.has(h))
  },

  mapColumns(headers: string[]): ColumnMapping[] {
    return mapColumns(headers, EXACT_COLUMNS, ALIAS_COLUMNS)
  },

  parseRow(
    row: Record<string, string>,
    rowIndex: number,
    options: ConvertOptions
  ): IntermediateRow | null {
    const date = row['start_time']?.trim()
    const exerciseName = row['exercise_title']?.trim()

    if (!date || !exerciseName) return null

    // Hevy provides both kg and lbs — prefer kg
    const weightKg = parseNumber(row['weight_kg'])
    const weightLbs = parseNumber(row['weight_lbs'])
    let weight: number | undefined
    let weightUnit: 'kg' | 'lb' | undefined

    if (weightKg !== undefined && weightKg > 0) {
      weight = weightKg
      weightUnit = 'kg'
    } else if (weightLbs !== undefined && weightLbs > 0) {
      weight = weightLbs
      weightUnit = 'lb'
    }

    // Hevy provides distance in both km and miles
    const distanceKm = parseNumber(row['distance_km'])
    const distanceMiles = parseNumber(row['distance_miles'])
    let distance: number | undefined
    let distanceUnit: 'km' | 'mi' | undefined

    if (distanceKm !== undefined && distanceKm > 0) {
      distance = distanceKm
      distanceUnit = 'km'
    } else if (distanceMiles !== undefined && distanceMiles > 0) {
      distance = distanceMiles
      distanceUnit = 'mi'
    }

    // Compute workout duration from start_time/end_time if available
    let rawDuration: string | undefined
    const endTime = row['end_time']?.trim()
    if (date && endTime) {
      rawDuration = `${date}|${endTime}` // handled by transformer
    }

    return {
      rawDate: date,
      workoutName: row['title']?.trim() || undefined,
      rawDuration,
      exerciseName: normalizeExerciseName(
        exerciseName,
        options.exerciseMappings
      ),
      setIndex: Number(row['set_index'] || 1),
      weight,
      weightUnit,
      reps: parseNumber(row['reps']),
      distance,
      distanceUnit,
      durationSeconds: parseNumber(row['duration_seconds']),
      rpe: parseNumber(row['rpe']),
      rawSetType: row['set_type']?.trim() || undefined,
      supersetId: row['superset_id']?.trim() || undefined,
      exerciseNotes: row['exercise_notes']?.trim() || undefined,
      workoutNotes: row['description']?.trim() || undefined,
      sourceRow: rowIndex + 2,
    }
  },
}
