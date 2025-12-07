import { describe, it, expect } from 'vitest'
import {
  validateWorkoutLog,
  isValidWorkoutLog,
  validateWorkoutTemplate,
  isValidWorkoutTemplate,
  validateProgram,
  isValidProgram,
  validateLifterProfile,
  isValidLifterProfile,
} from './validate.js'

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

// ============================================
// Workout Template Validation Tests
// ============================================

const validTemplate = {
  name: 'Push Day',
  exercises: [
    {
      exercise: { name: 'Bench Press' },
      sets: [{ targetReps: 5 }],
    },
  ],
}

describe('validateWorkoutTemplate', () => {
  it('returns valid for a correct template', () => {
    const result = validateWorkoutTemplate(validTemplate)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('returns invalid when name is missing', () => {
    const result = validateWorkoutTemplate({
      exercises: [{ exercise: { name: 'Squat' }, sets: [{ targetReps: 5 }] }],
    })
    expect(result.valid).toBe(false)
  })

  it('returns invalid when exercises is missing', () => {
    const result = validateWorkoutTemplate({ name: 'Test' })
    expect(result.valid).toBe(false)
  })

  it('returns invalid when targetWeight is provided without unit', () => {
    const result = validateWorkoutTemplate({
      name: 'Test',
      exercises: [
        {
          exercise: { name: 'Squat' },
          sets: [{ targetWeight: 100 }],
        },
      ],
    })
    expect(result.valid).toBe(false)
  })

  it('returns invalid when percentage is provided without percentageOf', () => {
    const result = validateWorkoutTemplate({
      name: 'Test',
      exercises: [
        {
          exercise: { name: 'Squat' },
          sets: [{ percentage: 85 }],
        },
      ],
    })
    expect(result.valid).toBe(false)
  })

  it('returns valid for percentage with percentageOf', () => {
    const result = validateWorkoutTemplate({
      name: 'Test',
      exercises: [
        {
          exercise: { name: 'Squat' },
          sets: [{ percentage: 85, percentageOf: '1RM' }],
        },
      ],
    })
    expect(result.valid).toBe(true)
  })

  it('validates day field range', () => {
    const validDayResult = validateWorkoutTemplate({
      ...validTemplate,
      day: 1,
    })
    expect(validDayResult.valid).toBe(true)

    const invalidDayResult = validateWorkoutTemplate({
      ...validTemplate,
      day: 8,
    })
    expect(invalidDayResult.valid).toBe(false)
  })
})

describe('isValidWorkoutTemplate', () => {
  it('returns true for valid template', () => {
    expect(isValidWorkoutTemplate(validTemplate)).toBe(true)
  })

  it('returns false for invalid template', () => {
    expect(isValidWorkoutTemplate({})).toBe(false)
  })
})

// ============================================
// Program Validation Tests
// ============================================

const validProgram = {
  name: 'Simple Program',
  weeks: [
    {
      workouts: [
        {
          name: 'Day 1',
          exercises: [
            {
              exercise: { name: 'Squat' },
              sets: [{ targetReps: 5 }],
            },
          ],
        },
      ],
    },
  ],
}

describe('validateProgram', () => {
  it('returns valid for a correct program', () => {
    const result = validateProgram(validProgram)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('returns invalid when name is missing', () => {
    const result = validateProgram({
      weeks: [
        {
          workouts: [
            {
              name: 'Day 1',
              exercises: [{ exercise: { name: 'Squat' }, sets: [{ targetReps: 5 }] }],
            },
          ],
        },
      ],
    })
    expect(result.valid).toBe(false)
  })

  it('returns invalid when weeks is missing', () => {
    const result = validateProgram({ name: 'Test Program' })
    expect(result.valid).toBe(false)
  })

  it('returns invalid when weeks is empty', () => {
    const result = validateProgram({ name: 'Test Program', weeks: [] })
    expect(result.valid).toBe(false)
  })

  it('returns invalid when week.workouts is empty', () => {
    const result = validateProgram({
      name: 'Test Program',
      weeks: [{ workouts: [] }],
    })
    expect(result.valid).toBe(false)
  })

  it('validates nested workout templates', () => {
    const result = validateProgram({
      name: 'Test Program',
      weeks: [
        {
          workouts: [
            {
              name: 'Day 1',
              exercises: [
                {
                  exercise: { name: 'Squat' },
                  sets: [{ targetWeight: 100 }], // Missing unit
                },
              ],
            },
          ],
        },
      ],
    })
    expect(result.valid).toBe(false)
  })

  it('allows optional fields', () => {
    const result = validateProgram({
      ...validProgram,
      description: 'A great program',
      author: 'John Doe',
      tags: ['strength', 'beginner'],
    })
    expect(result.valid).toBe(true)
  })
})

describe('isValidProgram', () => {
  it('returns true for valid program', () => {
    expect(isValidProgram(validProgram)).toBe(true)
  })

  it('returns false for invalid program', () => {
    expect(isValidProgram({})).toBe(false)
  })
})

// ============================================
// Lifter Profile Validation Tests
// ============================================

const validLifterProfile = {
  exportedAt: '2024-01-15T10:00:00Z',
  records: [
    {
      exercise: { name: 'Squat' },
      repMaxes: [{ reps: 1, weight: 180, unit: 'kg', date: '2024-01-15' }],
    },
  ],
}

describe('validateLifterProfile', () => {
  it('returns valid for a correct lifter profile', () => {
    const result = validateLifterProfile(validLifterProfile)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('returns invalid when exportedAt is missing', () => {
    const result = validateLifterProfile({
      records: [],
    })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message?.includes('exportedAt'))).toBe(true)
  })

  it('returns valid when records is missing (optional)', () => {
    const result = validateLifterProfile({
      exportedAt: '2024-01-15T10:00:00Z',
    })
    expect(result.valid).toBe(true)
  })

  it('returns valid with empty records array', () => {
    const result = validateLifterProfile({
      exportedAt: '2024-01-15T10:00:00Z',
      records: [],
    })
    expect(result.valid).toBe(true)
  })

  it('returns invalid when repMax is missing required fields', () => {
    const result = validateLifterProfile({
      exportedAt: '2024-01-15T10:00:00Z',
      records: [
        {
          exercise: { name: 'Squat' },
          repMaxes: [{ reps: 1, weight: 180 }],
        },
      ],
    })
    expect(result.valid).toBe(false)
  })

  it('returns invalid when estimated1RM is missing required fields', () => {
    const result = validateLifterProfile({
      exportedAt: '2024-01-15T10:00:00Z',
      records: [
        {
          exercise: { name: 'Squat' },
          estimated1RM: { value: 185, unit: 'kg' },
        },
      ],
    })
    expect(result.valid).toBe(false)
  })

  it('returns valid for full estimated1RM', () => {
    const result = validateLifterProfile({
      exportedAt: '2024-01-15T10:00:00Z',
      records: [
        {
          exercise: { name: 'Squat' },
          estimated1RM: {
            value: 185,
            unit: 'kg',
            formula: 'brzycki',
            basedOnReps: 5,
            basedOnWeight: 160,
          },
        },
      ],
    })
    expect(result.valid).toBe(true)
  })

  it('returns invalid for invalid formula enum', () => {
    const result = validateLifterProfile({
      exportedAt: '2024-01-15T10:00:00Z',
      records: [
        {
          exercise: { name: 'Squat' },
          estimated1RM: {
            value: 185,
            unit: 'kg',
            formula: 'invalid',
            basedOnReps: 5,
            basedOnWeight: 160,
          },
        },
      ],
    })
    expect(result.valid).toBe(false)
  })

  it('returns invalid for invalid sex enum', () => {
    const result = validateLifterProfile({
      exportedAt: '2024-01-15T10:00:00Z',
      sex: 'other',
    })
    expect(result.valid).toBe(false)
  })

  it('returns valid for all sex values', () => {
    for (const sex of ['male', 'female']) {
      const result = validateLifterProfile({
        exportedAt: '2024-01-15T10:00:00Z',
        sex,
      })
      expect(result.valid).toBe(true)
    }
  })

  it('returns valid for height and bodyweight', () => {
    const result = validateLifterProfile({
      exportedAt: '2024-01-15T10:00:00Z',
      height: { value: 180, unit: 'cm' },
      bodyweight: { value: 82.5, unit: 'kg' },
    })
    expect(result.valid).toBe(true)
  })

  it('returns invalid for invalid height unit', () => {
    const result = validateLifterProfile({
      exportedAt: '2024-01-15T10:00:00Z',
      height: { value: 180, unit: 'meters' },
    })
    expect(result.valid).toBe(false)
  })

  it('returns valid for volumePR', () => {
    const result = validateLifterProfile({
      exportedAt: '2024-01-15T10:00:00Z',
      records: [
        {
          exercise: { name: 'Squat' },
          volumePR: { value: 8500, unit: 'kg', date: '2024-01-15' },
        },
      ],
    })
    expect(result.valid).toBe(true)
  })

  it('returns valid for durationPR', () => {
    const result = validateLifterProfile({
      exportedAt: '2024-01-15T10:00:00Z',
      records: [
        {
          exercise: { name: 'Plank' },
          durationPR: { seconds: 180, date: '2024-01-15' },
        },
      ],
    })
    expect(result.valid).toBe(true)
  })

  it('returns valid for normalized scores', () => {
    const result = validateLifterProfile({
      exportedAt: '2024-01-15T10:00:00Z',
      normalizedScores: {
        squat: { wilks: 145.2, dots: 148.5 },
        total: { wilks: 406.2, dots: 414.6, ipfGl: 420 },
      },
    })
    expect(result.valid).toBe(true)
  })

  it('allows additional properties', () => {
    const result = validateLifterProfile({
      ...validLifterProfile,
      'app:customField': 'value',
    })
    expect(result.valid).toBe(true)
  })
})

describe('isValidLifterProfile', () => {
  it('returns true for valid lifter profile', () => {
    expect(isValidLifterProfile(validLifterProfile)).toBe(true)
  })

  it('returns false for invalid lifter profile', () => {
    expect(isValidLifterProfile({})).toBe(false)
  })

  it('returns false for non-object', () => {
    expect(isValidLifterProfile('string')).toBe(false)
    expect(isValidLifterProfile(null)).toBe(false)
  })
})
