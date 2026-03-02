import { mapColumns } from '../mapping/column-mapper.js'
import { normalizeExerciseName } from '../mapping/exercise-names.js'
import { parseNumber } from '../transform/units.js'
import type {
  SourceParser,
  ColumnMapping,
  IntermediateRow,
  ConvertOptions,
} from '../types.js'

/**
 * Strong CSV columns (as of 2024 export):
 * Date, Workout Name, Duration, Exercise Name, Set Order,
 * Weight, Reps, Distance, Seconds, Notes, Workout Notes, RPE
 */
const EXACT_COLUMNS: Record<string, string> = {
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
  'Set Type': 'rawSetType',
}

const ALIAS_COLUMNS: Record<string, string> = {
  'workout_name': 'workoutName',
  'exercise_name': 'exerciseName',
  'set_order': 'setIndex',
  'workout_notes': 'workoutNotes',
  'exercise_notes': 'exerciseNotes',
}

/** Strong signature headers */
const REQUIRED_HEADERS = ['Date', 'Exercise Name', 'Set Order', 'Weight', 'Reps']

export const strongParser: SourceParser = {
  format: 'strong',

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
    const date = row['Date']?.trim()
    const exerciseName = row['Exercise Name']?.trim()

    if (!date || !exerciseName) return null

    const distance = parseNumber(row['Distance'])

    return {
      rawDate: date,
      workoutName: row['Workout Name']?.trim() || undefined,
      rawDuration: row['Duration']?.trim() || undefined,
      exerciseName: normalizeExerciseName(
        exerciseName,
        options.exerciseMappings
      ),
      setIndex: Number(row['Set Order'] || 1),
      weight: parseNumber(row['Weight']),
      weightUnit: options.weightUnit,
      reps: parseNumber(row['Reps']),
      distance,
      distanceUnit: distance ? 'm' : undefined,
      durationSeconds: parseNumber(row['Seconds']),
      rpe: parseNumber(row['RPE']),
      rawSetType: row['Set Type']?.trim() || undefined,
      exerciseNotes: row['Notes']?.trim() || undefined,
      workoutNotes: row['Workout Notes']?.trim() || undefined,
      sourceRow: rowIndex + 2, // 1-indexed, +1 for header
    }
  },
}
