import type { WorkoutLog } from './types.js'

export function serializeWorkoutLog(workout: WorkoutLog): string {
  return JSON.stringify(workout)
}

export function serializeWorkoutLogPretty(workout: WorkoutLog): string {
  return JSON.stringify(workout, null, 2)
}
