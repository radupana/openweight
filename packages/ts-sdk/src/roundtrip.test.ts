import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { parseWorkoutLog } from './parse.js'
import { serializeWorkoutLog } from './serialize.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const examplesDir = join(__dirname, '..', '..', '..', 'examples', 'workout-logs')

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

  describe('example files', () => {
    const files = readdirSync(examplesDir).filter((f) => f.endsWith('.json'))

    for (const file of files) {
      it(`roundtrips ${file}`, () => {
        const content = readFileSync(join(examplesDir, file), 'utf-8')
        const parsed1 = parseWorkoutLog(content)
        const serialized = serializeWorkoutLog(parsed1)
        const parsed2 = parseWorkoutLog(serialized)

        expect(parsed2).toEqual(parsed1)
      })
    }
  })
})
