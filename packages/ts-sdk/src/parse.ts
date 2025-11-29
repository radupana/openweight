import { validateWorkoutLog } from './validate.js'
import type { WorkoutLog } from './types.js'

export class ParseError extends Error {
  constructor(
    message: string,
    public readonly errors: { path: string; message: string }[] = []
  ) {
    super(message)
    this.name = 'ParseError'
  }
}

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
