import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import {
  workoutLogSchema,
  workoutTemplateSchema,
  programSchema,
  personalRecordsSchema,
} from './schema.js'
import type { WorkoutLog, WorkoutTemplate, Program, PersonalRecords } from './types.js'

export interface ValidationError {
  path: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

// Add workout template schema first (referenced by program)
ajv.addSchema(workoutTemplateSchema)

const validateWorkoutLogSchema = ajv.compile(workoutLogSchema)
const validateWorkoutTemplateSchema = ajv.compile(workoutTemplateSchema)
const validateProgramSchema = ajv.compile(programSchema)
const validatePersonalRecordsSchema = ajv.compile(personalRecordsSchema)

function formatErrors(errors: typeof validateWorkoutLogSchema.errors): ValidationError[] {
  return (errors ?? []).map((err) => ({
    path: err.instancePath || '/',
    message: err.message ?? 'Unknown validation error',
  }))
}

// ============================================
// Workout Log Validation
// ============================================

export function validateWorkoutLog(data: unknown): ValidationResult {
  const valid = validateWorkoutLogSchema(data)

  if (valid) {
    return { valid: true, errors: [] }
  }

  return { valid: false, errors: formatErrors(validateWorkoutLogSchema.errors) }
}

export function isValidWorkoutLog(data: unknown): data is WorkoutLog {
  return validateWorkoutLogSchema(data)
}

// ============================================
// Workout Template Validation
// ============================================

export function validateWorkoutTemplate(data: unknown): ValidationResult {
  const valid = validateWorkoutTemplateSchema(data)

  if (valid) {
    return { valid: true, errors: [] }
  }

  return { valid: false, errors: formatErrors(validateWorkoutTemplateSchema.errors) }
}

export function isValidWorkoutTemplate(data: unknown): data is WorkoutTemplate {
  return validateWorkoutTemplateSchema(data)
}

// ============================================
// Program Validation
// ============================================

export function validateProgram(data: unknown): ValidationResult {
  const valid = validateProgramSchema(data)

  if (valid) {
    return { valid: true, errors: [] }
  }

  return { valid: false, errors: formatErrors(validateProgramSchema.errors) }
}

export function isValidProgram(data: unknown): data is Program {
  return validateProgramSchema(data)
}

// ============================================
// Personal Records Validation
// ============================================

export function validatePersonalRecords(data: unknown): ValidationResult {
  const valid = validatePersonalRecordsSchema(data)

  if (valid) {
    return { valid: true, errors: [] }
  }

  return { valid: false, errors: formatErrors(validatePersonalRecordsSchema.errors) }
}

export function isValidPersonalRecords(data: unknown): data is PersonalRecords {
  return validatePersonalRecordsSchema(data)
}
