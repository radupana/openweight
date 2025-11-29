import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { workoutLogSchema } from './schema.js'
import type { WorkoutLog } from './types.js'

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

const validateSchema = ajv.compile(workoutLogSchema)

export function validateWorkoutLog(data: unknown): ValidationResult {
  const valid = validateSchema(data)

  if (valid) {
    return { valid: true, errors: [] }
  }

  const errors: ValidationError[] = (validateSchema.errors ?? []).map((err) => ({
    path: err.instancePath || '/',
    message: err.message ?? 'Unknown validation error',
  }))

  return { valid: false, errors }
}

export function isValidWorkoutLog(data: unknown): data is WorkoutLog {
  return validateSchema(data)
}
