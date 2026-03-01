import type {
  WorkoutLog,
  ExerciseLog,
  SetLog,
} from '@openweight/sdk'
import { parseDate } from './date.js'
import { parseDuration } from './duration.js'
import { normalizeSetType } from './set-type.js'
import type { IntermediateRow, ConversionWarning } from '../types.js'

interface TransformResult {
  workouts: WorkoutLog[]
  warnings: ConversionWarning[]
}

/**
 * Transform intermediate rows into WorkoutLog objects.
 * Groups by workout (date + name), then by exercise, builds sets.
 */
export function transformRows(rows: IntermediateRow[]): TransformResult {
  const warnings: ConversionWarning[] = []

  // Group rows by workout identity (date + name)
  const workoutGroups = new Map<string, IntermediateRow[]>()
  for (const row of rows) {
    const date = parseDate(row.rawDate)
    if (!date) {
      warnings.push({
        type: 'skipped_row',
        message: `Could not parse date: "${row.rawDate}"`,
        sourceRow: row.sourceRow,
      })
      continue
    }
    const key = `${date}|${row.workoutName ?? ''}`
    const group = workoutGroups.get(key)
    if (group) {
      group.push(row)
    } else {
      workoutGroups.set(key, [row])
    }
  }

  const workouts: WorkoutLog[] = []

  for (const [key, groupRows] of workoutGroups) {
    const [dateStr, workoutName] = key.split('|')
    const firstRow = groupRows[0]

    // Build exercises
    const exerciseMap = new Map<string, { rows: IntermediateRow[]; order: number }>()
    let exerciseOrder = 0
    for (const row of groupRows) {
      const existing = exerciseMap.get(row.exerciseName)
      if (existing) {
        existing.rows.push(row)
      } else {
        exerciseMap.set(row.exerciseName, { rows: [row], order: exerciseOrder++ })
      }
    }

    const exercises: ExerciseLog[] = []
    for (const [exerciseName, { rows: exRows, order }] of exerciseMap) {
      const sets: SetLog[] = exRows.map((row) => {
        const set: SetLog = {}
        if (row.reps !== undefined && row.reps > 0) set.reps = row.reps
        if (row.weight !== undefined && row.weight > 0) {
          set.weight = row.weight
          if (row.weightUnit) set.unit = row.weightUnit
        }
        if (row.durationSeconds !== undefined && row.durationSeconds > 0) set.durationSeconds = row.durationSeconds
        if (row.distance !== undefined && row.distance > 0) {
          set.distance = row.distance
          if (row.distanceUnit) set.distanceUnit = row.distanceUnit
        }
        if (row.rpe !== undefined && row.rpe > 0) set.rpe = row.rpe

        const setType = normalizeSetType(row.rawSetType)
        if (setType.type) set.type = setType.type
        if (setType.toFailure) set.toFailure = true

        return set
      })

      const exerciseLog: ExerciseLog = {
        exercise: { name: exerciseName },
        sets,
        order: order + 1,
      }

      // Add notes from the first row with notes
      const noteRow = exRows.find((r) => r.exerciseNotes)
      if (noteRow?.exerciseNotes) {
        exerciseLog.notes = noteRow.exerciseNotes
      }

      // Add superset ID if present
      const supersetRow = exRows.find((r) => r.supersetId)
      if (supersetRow?.supersetId) {
        const supersetNum = Number(supersetRow.supersetId)
        if (!isNaN(supersetNum)) {
          exerciseLog.supersetId = supersetNum
        }
      }

      exercises.push(exerciseLog)
    }

    const workout: WorkoutLog = {
      date: dateStr,
      exercises,
    }

    if (workoutName) workout.name = workoutName
    if (firstRow.workoutNotes) workout.notes = firstRow.workoutNotes

    // Parse workout duration
    const duration = parseWorkoutDuration(firstRow)
    if (duration !== undefined) workout.durationSeconds = duration

    workouts.push(workout)
  }

  // Sort workouts by date
  workouts.sort((a, b) => a.date.localeCompare(b.date))

  return { workouts, warnings }
}

function parseWorkoutDuration(row: IntermediateRow): number | undefined {
  if (!row.rawDuration) return undefined

  const raw = String(row.rawDuration)

  // Handle Hevy's "startTime|endTime" format
  if (raw.includes('|')) {
    const [start, end] = raw.split('|')
    const startDate = new Date(start)
    const endDate = new Date(end)
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const diff = Math.round((endDate.getTime() - startDate.getTime()) / 1000)
      return diff > 0 ? diff : undefined
    }
    return undefined
  }

  return parseDuration(raw)
}
