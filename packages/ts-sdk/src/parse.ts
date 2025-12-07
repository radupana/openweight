import {
  validateWorkoutLog,
  validateWorkoutTemplate,
  validateProgram,
  validateLifterProfile,
} from './validate.js'
import type { WorkoutLog, WorkoutTemplate, Program, LifterProfile } from './types.js'

export class ParseError extends Error {
  constructor(
    message: string,
    public readonly errors: { path: string; message: string }[] = []
  ) {
    super(message)
    this.name = 'ParseError'
  }
}

// ============================================
// Workout Log Parsing
// ============================================

export function parseWorkoutLog(json: string): WorkoutLog {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    throw new ParseError('Invalid JSON')
  }

  const result = validateWorkoutLog(data)
  if (!result.valid) {
    throw new ParseError('Schema validation failed', result.errors)
  }

  return data as WorkoutLog
}

// ============================================
// Workout Template Parsing
// ============================================

export function parseWorkoutTemplate(json: string): WorkoutTemplate {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    throw new ParseError('Invalid JSON')
  }

  const result = validateWorkoutTemplate(data)
  if (!result.valid) {
    throw new ParseError('Schema validation failed', result.errors)
  }

  return data as WorkoutTemplate
}

// ============================================
// Program Parsing
// ============================================

export function parseProgram(json: string): Program {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    throw new ParseError('Invalid JSON')
  }

  const result = validateProgram(data)
  if (!result.valid) {
    throw new ParseError('Schema validation failed', result.errors)
  }

  return data as Program
}

// ============================================
// Lifter Profile Parsing
// ============================================

export function parseLifterProfile(json: string): LifterProfile {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    throw new ParseError('Invalid JSON')
  }

  const result = validateLifterProfile(data)
  if (!result.valid) {
    throw new ParseError('Schema validation failed', result.errors)
  }

  return data as LifterProfile
}
