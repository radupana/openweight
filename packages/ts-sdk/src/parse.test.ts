import { describe, it, expect } from 'vitest'
import { parseWorkoutLog, ParseError } from './parse.js'

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
