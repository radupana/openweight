import { describe, it, expect } from 'vitest'
import { normalizeExerciseName, hasExerciseMapping } from '../mapping/exercise-names.js'

describe('normalizeExerciseName', () => {
  it('maps known exercise names to canonical form', () => {
    expect(normalizeExerciseName('Barbell Bench Press')).toBe('Bench Press')
    expect(normalizeExerciseName('Barbell Squat')).toBe('Squat')
    expect(normalizeExerciseName('Barbell Deadlift')).toBe('Deadlift')
    expect(normalizeExerciseName('Pull Up')).toBe('Pull-up')
  })

  it('is case-insensitive', () => {
    expect(normalizeExerciseName('barbell bench press')).toBe('Bench Press')
    expect(normalizeExerciseName('BARBELL SQUAT')).toBe('Squat')
  })

  it('returns original name for unknown exercises', () => {
    expect(normalizeExerciseName('My Custom Exercise')).toBe('My Custom Exercise')
  })

  it('respects custom mappings over built-in', () => {
    const custom = { 'Barbell Bench Press': 'Flat Bench' }
    expect(normalizeExerciseName('Barbell Bench Press', custom)).toBe('Flat Bench')
  })

  it('handles empty input', () => {
    expect(normalizeExerciseName('')).toBe('')
  })
})

describe('hasExerciseMapping', () => {
  it('returns true for known exercises', () => {
    expect(hasExerciseMapping('Barbell Bench Press')).toBe(true)
  })

  it('returns false for unknown exercises', () => {
    expect(hasExerciseMapping('My Custom Exercise')).toBe(false)
  })
})
