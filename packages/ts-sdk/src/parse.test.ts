import { describe, it, expect } from 'vitest'
import { parseWorkoutLog, parseWorkoutTemplate, parseProgram, ParseError } from './parse.js'

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
