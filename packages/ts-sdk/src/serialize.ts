import type { WorkoutLog, WorkoutTemplate, Program, LifterProfile } from './types.js'

// ============================================
// Workout Log Serialization
// ============================================

export function serializeWorkoutLog(workout: WorkoutLog): string {
  return JSON.stringify(workout)
}

export function serializeWorkoutLogPretty(workout: WorkoutLog): string {
  return JSON.stringify(workout, null, 2)
}

// ============================================
// Workout Template Serialization
// ============================================

export function serializeWorkoutTemplate(template: WorkoutTemplate): string {
  return JSON.stringify(template)
}

export function serializeWorkoutTemplatePretty(template: WorkoutTemplate): string {
  return JSON.stringify(template, null, 2)
}

// ============================================
// Program Serialization
// ============================================

export function serializeProgram(program: Program): string {
  return JSON.stringify(program)
}

export function serializeProgramPretty(program: Program): string {
  return JSON.stringify(program, null, 2)
}

// ============================================
// Lifter Profile Serialization
// ============================================

export function serializeLifterProfile(profile: LifterProfile): string {
  return JSON.stringify(profile)
}

export function serializeLifterProfilePretty(profile: LifterProfile): string {
  return JSON.stringify(profile, null, 2)
}
