import { describe, it, expect } from 'vitest'
import {
  parseWorkoutLog,
  parseWorkoutTemplate,
  parseProgram,
  parsePersonalRecords,
  ParseError,
} from './parse.js'

const validJson = JSON.stringify({
  date: '2024-01-15T09:00:00Z',
  exercises: [
    {
      exercise: { name: 'Squat' },
      sets: [{ reps: 5, weight: 100, unit: 'kg' }],
    },
  ],
})

describe('parseWorkoutLog', () => {
  it('parses valid JSON', () => {
    const result = parseWorkoutLog(validJson)
    expect(result.date).toBe('2024-01-15T09:00:00Z')
    expect(result.exercises).toHaveLength(1)
    expect(result.exercises[0].exercise.name).toBe('Squat')
  })

  it('throws ParseError for invalid JSON syntax', () => {
    expect(() => parseWorkoutLog('not json')).toThrow(ParseError)
    expect(() => parseWorkoutLog('not json')).toThrow('Invalid JSON')
  })

  it('throws ParseError for schema validation failures', () => {
    const invalidJson = JSON.stringify({ date: '2024-01-15T09:00:00Z' })
    expect(() => parseWorkoutLog(invalidJson)).toThrow(ParseError)
  })

  it('includes validation errors in ParseError', () => {
    const invalidJson = JSON.stringify({ date: '2024-01-15T09:00:00Z' })
    try {
      parseWorkoutLog(invalidJson)
      expect.fail('Should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(ParseError)
      const parseError = e as ParseError
      expect(parseError.errors.length).toBeGreaterThan(0)
    }
  })

  it('preserves additional properties', () => {
    const json = JSON.stringify({
      date: '2024-01-15T09:00:00Z',
      exercises: [{ exercise: { name: 'Squat' }, sets: [{ reps: 5 }] }],
      'app:customField': 'value',
    })
    const result = parseWorkoutLog(json)
    expect(result['app:customField']).toBe('value')
  })
})

// ============================================
// Workout Template Parsing Tests
// ============================================

const validTemplateJson = JSON.stringify({
  name: 'Push Day',
  exercises: [
    {
      exercise: { name: 'Bench Press' },
      sets: [{ targetReps: 5 }],
    },
  ],
})

describe('parseWorkoutTemplate', () => {
  it('parses valid template JSON', () => {
    const result = parseWorkoutTemplate(validTemplateJson)
    expect(result.name).toBe('Push Day')
    expect(result.exercises).toHaveLength(1)
    expect(result.exercises[0].exercise.name).toBe('Bench Press')
  })

  it('throws ParseError for invalid JSON syntax', () => {
    expect(() => parseWorkoutTemplate('not json')).toThrow(ParseError)
  })

  it('throws ParseError for schema validation failures', () => {
    const invalidJson = JSON.stringify({ name: 'Test' })
    expect(() => parseWorkoutTemplate(invalidJson)).toThrow(ParseError)
  })
})

// ============================================
// Program Parsing Tests
// ============================================

const validProgramJson = JSON.stringify({
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
})

describe('parseProgram', () => {
  it('parses valid program JSON', () => {
    const result = parseProgram(validProgramJson)
    expect(result.name).toBe('Simple Program')
    expect(result.weeks).toHaveLength(1)
    expect(result.weeks[0].workouts).toHaveLength(1)
    expect(result.weeks[0].workouts[0].name).toBe('Day 1')
  })

  it('throws ParseError for invalid JSON syntax', () => {
    expect(() => parseProgram('not json')).toThrow(ParseError)
  })

  it('throws ParseError for schema validation failures', () => {
    const invalidJson = JSON.stringify({ name: 'Test' })
    expect(() => parseProgram(invalidJson)).toThrow(ParseError)
  })
})

// ============================================
// Personal Records Parsing Tests
// ============================================

const validPersonalRecordsJson = JSON.stringify({
  exportedAt: '2024-01-15T10:00:00Z',
  records: [
    {
      exercise: { name: 'Squat' },
      repMaxes: [{ reps: 1, weight: 180, unit: 'kg', date: '2024-01-15' }],
    },
  ],
})

describe('parsePersonalRecords', () => {
  it('parses valid personal records JSON', () => {
    const result = parsePersonalRecords(validPersonalRecordsJson)
    expect(result.exportedAt).toBe('2024-01-15T10:00:00Z')
    expect(result.records).toHaveLength(1)
    expect(result.records[0].exercise.name).toBe('Squat')
    expect(result.records[0].repMaxes?.[0].weight).toBe(180)
  })

  it('throws ParseError for invalid JSON syntax', () => {
    expect(() => parsePersonalRecords('not json')).toThrow(ParseError)
    expect(() => parsePersonalRecords('not json')).toThrow('Invalid JSON')
  })

  it('throws ParseError for schema validation failures', () => {
    const invalidJson = JSON.stringify({ exportedAt: '2024-01-15T10:00:00Z' })
    expect(() => parsePersonalRecords(invalidJson)).toThrow(ParseError)
  })

  it('includes validation errors in ParseError', () => {
    const invalidJson = JSON.stringify({ records: [] })
    try {
      parsePersonalRecords(invalidJson)
      expect.fail('Should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(ParseError)
      const parseError = e as ParseError
      expect(parseError.errors.length).toBeGreaterThan(0)
    }
  })

  it('preserves additional properties', () => {
    const json = JSON.stringify({
      exportedAt: '2024-01-15T10:00:00Z',
      records: [],
      'app:customField': 'value',
    })
    const result = parsePersonalRecords(json)
    expect(result['app:customField']).toBe('value')
  })

  it('parses full-featured personal records', () => {
    const json = JSON.stringify({
      exportedAt: '2024-01-15T10:00:00Z',
      athlete: { bodyweightKg: 82.5, sex: 'male' },
      records: [
        {
          exercise: { name: 'Squat', equipment: 'barbell' },
          repMaxes: [
            { reps: 1, weight: 180, unit: 'kg', date: '2024-01-15', type: 'actual' },
            { reps: 5, weight: 155, unit: 'kg', date: '2024-01-10', type: 'actual' },
          ],
          estimated1RM: {
            value: 185,
            unit: 'kg',
            formula: 'brzycki',
            basedOnReps: 5,
            basedOnWeight: 155,
          },
          volumePR: { value: 8500, unit: 'kg', date: '2024-01-12' },
        },
        {
          exercise: { name: 'Plank' },
          durationPR: { seconds: 180, date: '2024-01-08' },
        },
      ],
      normalizedScores: {
        squat: { wilks: 145.2, dots: 148.5 },
      },
    })
    const result = parsePersonalRecords(json)
    expect(result.athlete?.bodyweightKg).toBe(82.5)
    expect(result.records).toHaveLength(2)
    expect(result.records[0].repMaxes).toHaveLength(2)
    expect(result.records[0].estimated1RM?.formula).toBe('brzycki')
    expect(result.records[1].durationPR?.seconds).toBe(180)
    expect(result.normalizedScores?.squat?.wilks).toBe(145.2)
  })
})
