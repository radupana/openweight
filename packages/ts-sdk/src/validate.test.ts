import { describe, it, expect } from 'vitest'
import { validateWorkoutLog, isValidWorkoutLog } from './validate.js'

const validWorkout = {
  date: '2024-01-15T09:00:00Z',
  exercises: [
    {
      exercise: { name: 'Squat' },
      sets: [{ reps: 5, weight: 100, unit: 'kg' }],
    },
  ],
}

const minimalWorkout = {
  date: '2024-01-15T09:00:00Z',
  exercises: [
    {
      exercise: { name: 'Push-up' },
      sets: [{ reps: 10 }],
    },
  ],
}

describe('validateWorkoutLog', () => {
  it('returns valid for a correct workout', () => {
    const result = validateWorkoutLog(validWorkout)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('returns valid for a minimal workout', () => {
    const result = validateWorkoutLog(minimalWorkout)
    expect(result.valid).toBe(true)
  })

  it('returns invalid when date is missing', () => {
    const result = validateWorkoutLog({
      exercises: [{ exercise: { name: 'Squat' }, sets: [{ reps: 5 }] }],
    })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message?.includes('date'))).toBe(true)
  })

  it('returns invalid when exercises is missing', () => {
    const result = validateWorkoutLog({ date: '2024-01-15T09:00:00Z' })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message?.includes('exercises'))).toBe(true)
  })

  it('returns invalid when exercises is empty', () => {
    const result = validateWorkoutLog({
      date: '2024-01-15T09:00:00Z',
      exercises: [],
    })
    expect(result.valid).toBe(false)
  })

  it('returns invalid when weight is provided without unit', () => {
    const result = validateWorkoutLog({
      date: '2024-01-15T09:00:00Z',
      exercises: [
        {
          exercise: { name: 'Squat' },
          sets: [{ reps: 5, weight: 100 }],
        },
      ],
    })
    expect(result.valid).toBe(false)
  })

  it('returns invalid when distance is provided without distanceUnit', () => {
    const result = validateWorkoutLog({
      date: '2024-01-15T09:00:00Z',
      exercises: [
        {
          exercise: { name: 'Farmer Walk' },
          sets: [{ distance: 40 }],
        },
      ],
    })
    expect(result.valid).toBe(false)
  })

  it('returns invalid for invalid unit enum', () => {
    const result = validateWorkoutLog({
      date: '2024-01-15T09:00:00Z',
      exercises: [
        {
          exercise: { name: 'Squat' },
          sets: [{ reps: 5, weight: 100, unit: 'stones' }],
        },
      ],
    })
    expect(result.valid).toBe(false)
  })

  it('allows additional properties', () => {
    const result = validateWorkoutLog({
      ...validWorkout,
      'app:customField': 'value',
    })
    expect(result.valid).toBe(true)
  })
})

describe('isValidWorkoutLog', () => {
  it('returns true for valid workout', () => {
    expect(isValidWorkoutLog(validWorkout)).toBe(true)
  })

  it('returns false for invalid workout', () => {
    expect(isValidWorkoutLog({})).toBe(false)
  })

  it('returns false for non-object', () => {
    expect(isValidWorkoutLog('string')).toBe(false)
    expect(isValidWorkoutLog(null)).toBe(false)
    expect(isValidWorkoutLog(123)).toBe(false)
  })
})
