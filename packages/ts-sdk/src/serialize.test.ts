import { describe, it, expect } from 'vitest'
import { serializeWorkoutLog, serializeWorkoutLogPretty } from './serialize.js'
import type { WorkoutLog } from './types.js'

const workout: WorkoutLog = {
  date: '2024-01-15T09:00:00Z',
  exercises: [
    {
      exercise: { name: 'Squat' },
      sets: [{ reps: 5, weight: 100, unit: 'kg' }],
    },
  ],
}

describe('serializeWorkoutLog', () => {
  it('serializes to compact JSON', () => {
    const result = serializeWorkoutLog(workout)
    expect(result).not.toContain('\n')
    expect(JSON.parse(result)).toEqual(workout)
  })

  it('produces valid JSON', () => {
    const result = serializeWorkoutLog(workout)
    expect(() => JSON.parse(result)).not.toThrow()
  })
})

describe('serializeWorkoutLogPretty', () => {
  it('serializes to formatted JSON with newlines', () => {
    const result = serializeWorkoutLogPretty(workout)
    expect(result).toContain('\n')
    expect(result).toContain('  ')
  })

  it('produces valid JSON', () => {
    const result = serializeWorkoutLogPretty(workout)
    expect(() => JSON.parse(result)).not.toThrow()
    expect(JSON.parse(result)).toEqual(workout)
  })
})
