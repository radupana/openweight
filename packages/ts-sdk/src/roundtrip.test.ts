import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { parseWorkoutLog, parseLifterProfile } from './parse.js'
import { serializeWorkoutLog, serializeLifterProfile } from './serialize.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const workoutLogsDir = join(__dirname, '..', '..', '..', 'examples', 'workout-logs')
const lifterProfilesDir = join(__dirname, '..', '..', '..', 'examples', 'lifter-profiles')

describe('roundtrip', () => {
  it('parse → serialize → parse produces equivalent data', () => {
    const json = JSON.stringify({
      date: '2024-01-15T09:00:00Z',
      name: 'Test Workout',
      exercises: [
        {
          exercise: { name: 'Squat', equipment: 'barbell' },
          sets: [
            { reps: 5, weight: 100, unit: 'kg', rpe: 8 },
            { reps: 5, weight: 100, unit: 'kg', rpe: 8.5 },
          ],
        },
      ],
    })

    const parsed1 = parseWorkoutLog(json)
    const serialized = serializeWorkoutLog(parsed1)
    const parsed2 = parseWorkoutLog(serialized)

    expect(parsed2).toEqual(parsed1)
  })

  describe('workout log example files', () => {
    const files = readdirSync(workoutLogsDir).filter((f) => f.endsWith('.json'))

    for (const file of files) {
      it(`roundtrips ${file}`, () => {
        const content = readFileSync(join(workoutLogsDir, file), 'utf-8')
        const parsed1 = parseWorkoutLog(content)
        const serialized = serializeWorkoutLog(parsed1)
        const parsed2 = parseWorkoutLog(serialized)

        expect(parsed2).toEqual(parsed1)
      })
    }
  })
})

describe('lifter profile roundtrip', () => {
  it('parse → serialize → parse produces equivalent data', () => {
    const json = JSON.stringify({
      exportedAt: '2024-01-15T10:00:00Z',
      name: 'John',
      sex: 'male',
      height: { value: 180, unit: 'cm' },
      bodyweight: { value: 82.5, unit: 'kg', date: '2024-01-15' },
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
        },
      ],
      normalizedScores: {
        squat: { wilks: 145.2, dots: 148.5 },
      },
    })

    const parsed1 = parseLifterProfile(json)
    const serialized = serializeLifterProfile(parsed1)
    const parsed2 = parseLifterProfile(serialized)

    expect(parsed2).toEqual(parsed1)
  })

  describe('lifter profile example files', () => {
    const files = readdirSync(lifterProfilesDir).filter((f) => f.endsWith('.json'))

    for (const file of files) {
      it(`roundtrips ${file}`, () => {
        const content = readFileSync(join(lifterProfilesDir, file), 'utf-8')
        const parsed1 = parseLifterProfile(content)
        const serialized = serializeLifterProfile(parsed1)
        const parsed2 = parseLifterProfile(serialized)

        expect(parsed2).toEqual(parsed1)
      })
    }
  })
})
