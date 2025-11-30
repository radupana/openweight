import type { WorkoutLog, WorkoutTemplate, Program, PersonalRecords } from './types.js'

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
// Personal Records Serialization
// ============================================

export function serializePersonalRecords(records: PersonalRecords): string {
  return JSON.stringify(records)
}

export function serializePersonalRecordsPretty(records: PersonalRecords): string {
  return JSON.stringify(records, null, 2)
}
