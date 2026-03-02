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
  // Normalize grouping key so equivalent instants (e.g. different TZ offsets) group together
  const workoutGroups = new Map<string, { date: string; rows: IntermediateRow[] }>()
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
    // Normalize to UTC ISO string for grouping so identical instants share a key
    const normalizedDate = new Date(date).toISOString()
    const key = `${normalizedDate}|${row.workoutName ?? ''}`
    const existing = workoutGroups.get(key)
    if (existing) {
      existing.rows.push(row)
    } else {
      workoutGroups.set(key, { date, rows: [row] })
    }
  }

  const workouts: WorkoutLog[] = []

  for (const [, group] of workoutGroups) {
    const { date: dateStr, rows: groupRows } = group
    const workoutName = groupRows[0].workoutName
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
      const sets: SetLog[] = []
      for (const row of exRows) {
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

        // Sanitize: reject sets with invalid field values
        const sanitized = sanitizeSet(set, row.sourceRow, warnings)
        if (sanitized) sets.push(sanitized)
      }

      // Drop exercises with no valid sets
      if (sets.length === 0) {
        warnings.push({
          type: 'parse',
          message: `Exercise "${exerciseName}" dropped: no valid sets after sanitization`,
          sourceRow: exRows[0].sourceRow,
        })
        continue
      }

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

    // Drop workouts with no valid exercises
    if (exercises.length === 0) {
      warnings.push({
        type: 'parse',
        message: `Workout on ${dateStr} dropped: no valid exercises after sanitization`,
      })
      continue
    }

    const workout: WorkoutLog = {
      date: dateStr,
      exercises,
    }

    if (workoutName) workout.name = workoutName
    if (firstRow.workoutNotes) workout.notes = firstRow.workoutNotes

    // Parse workout duration
    const duration = parseWorkoutDuration(firstRow, warnings)
    if (duration !== undefined) workout.durationSeconds = duration

    workouts.push(workout)
  }

  // Sort workouts by date
  workouts.sort((a, b) => a.date.localeCompare(b.date))

  return { workouts, warnings }
}

function parseWorkoutDuration(row: IntermediateRow, warnings: ConversionWarning[]): number | undefined {
  if (!row.rawDuration) return undefined

  const raw = String(row.rawDuration)

  // Handle Hevy's "startTime|endTime" format
  if (raw.includes('|')) {
    const [start, end] = raw.split('|')
    const startDate = new Date(start)
    const endDate = new Date(end)
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const diff = Math.round((endDate.getTime() - startDate.getTime()) / 1000)
      if (diff < 0) {
        warnings.push({
          type: 'parse',
          message: 'Workout start time is after end time',
          sourceRow: row.sourceRow,
        })
        return undefined
      }
      if (diff === 0) {
        warnings.push({
          type: 'parse',
          message: 'Workout has zero duration (start equals end)',
          sourceRow: row.sourceRow,
        })
        return undefined
      }
      return diff
    }
    return undefined
  }

  return parseDuration(raw)
}

/**
 * Sanitize a set: reject sets with invalid field values or no meaningful data.
 * Returns the set if valid, null if it should be filtered out.
 */
function sanitizeSet(set: SetLog, sourceRow: number, warnings: ConversionWarning[]): SetLog | null {
  // Reject sets with no meaningful fields (empty set)
  const hasMeaningfulField = set.reps !== undefined
    || set.weight !== undefined
    || set.distance !== undefined
    || set.durationSeconds !== undefined
  if (!hasMeaningfulField) {
    warnings.push({
      type: 'parse',
      message: 'Empty set filtered out (no reps, weight, distance, or duration)',
      sourceRow,
    })
    return null
  }

  // Strip individual fields that are out of range rather than rejecting the whole set.
  // The transformer pre-filters weight/distance/duration > 0 before calling sanitizeSet,
  // so the <= 0 branches here are defense-in-depth for future call sites.
  if (set.weight !== undefined && (!Number.isFinite(set.weight) || set.weight <= 0)) {
    warnings.push({
      type: 'parse',
      message: `Invalid weight ${set.weight} stripped from set`,
      sourceRow,
    })
    delete set.weight
    delete set.unit
  }
  if (set.reps !== undefined && (!Number.isFinite(set.reps) || set.reps < 0 || !Number.isInteger(set.reps))) {
    warnings.push({
      type: 'parse',
      message: `Invalid reps ${set.reps} stripped from set`,
      sourceRow,
    })
    delete set.reps
  }
  if (set.distance !== undefined && (!Number.isFinite(set.distance) || set.distance <= 0)) {
    warnings.push({
      type: 'parse',
      message: `Invalid distance ${set.distance} stripped from set`,
      sourceRow,
    })
    delete set.distance
    delete set.distanceUnit
  }
  if (set.durationSeconds !== undefined && (!Number.isFinite(set.durationSeconds) || set.durationSeconds <= 0)) {
    warnings.push({
      type: 'parse',
      message: `Invalid duration ${set.durationSeconds} stripped from set`,
      sourceRow,
    })
    delete set.durationSeconds
  }
  if (set.rpe !== undefined && (!Number.isFinite(set.rpe) || set.rpe < 0 || set.rpe > 10)) {
    warnings.push({
      type: 'parse',
      message: `RPE ${set.rpe} outside valid range 0-10, stripped from set`,
      sourceRow,
    })
    delete set.rpe
  }

  // After stripping invalid fields, re-check if the set still has meaningful data
  const stillMeaningful = set.reps !== undefined
    || set.weight !== undefined
    || set.distance !== undefined
    || set.durationSeconds !== undefined
  if (!stillMeaningful) {
    warnings.push({
      type: 'parse',
      message: 'Set filtered out: no valid fields remaining after sanitization',
      sourceRow,
    })
    return null
  }

  return set
}
