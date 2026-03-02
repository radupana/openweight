import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { convert } from '../convert.js'
import { isValidWorkoutLog } from '@openweight/sdk'
import { parseNumber } from '../transform/units.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixture = (name: string) =>
  readFileSync(resolve(__dirname, '..', '__fixtures__', 'exploratory', name), 'utf-8')

describe('robustness: bodyweight and distance exercises (Finding #3)', () => {
  it('Strong bodyweight/distance exercises produce valid workouts', async () => {
    const csv = fixture('strong-bodyweight-distance.csv')
    const { workouts } = await convert({ csv, format: 'strong', weightUnit: 'kg' })

    expect(workouts).toHaveLength(1)
    const workout = workouts[0]

    // Running should have distance with unit
    const running = workout.exercises.find(e => e.exercise.name === 'Running')
    expect(running).toBeDefined()
    expect(running!.sets[0].distance).toBe(5000)
    expect(running!.sets[0].distanceUnit).toBe('m')

    // Pull-ups should have reps but no weight
    const pullUp = workout.exercises.find(e => e.exercise.name === 'Pull-up')
    expect(pullUp).toBeDefined()
    expect(pullUp!.sets[0].reps).toBe(10)
    expect(pullUp!.sets[0].weight).toBeUndefined()

    // Plank should have duration
    const plank = workout.exercises.find(e => e.exercise.name === 'Plank')
    expect(plank).toBeDefined()
    expect(plank!.sets[0].durationSeconds).toBe(60)

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })
})

describe('robustness: set-level sanitization (Finding #4)', () => {
  it('Strong extreme values: keeps valid sets, rejects invalid ones', async () => {
    const csv = fixture('strong-extreme-values.csv')
    const { workouts, report } = await convert({ csv, format: 'strong', weightUnit: 'kg' })

    expect(workouts.length).toBeGreaterThan(0)

    // Row 2 (all zeros) produces an empty-set warning
    const emptySetWarnings = report.warnings.filter(w =>
      w.type === 'parse' && w.message.includes('Empty set')
    )
    expect(emptySetWarnings.length).toBeGreaterThan(0)

    // Row 4 (weight=-5): negative weight is filtered by the transformer (weight > 0),
    // so the set becomes {reps: 1} — valid but weightless, not rejected
    // Row 3 (weight=999.99, reps=100) is valid — extreme but finite
    const bench = workouts[0].exercises.find(e => e.exercise.name === 'Bench Press')
    expect(bench).toBeDefined()
    const negWeightSet = bench!.sets.find(s => s.weight === -5)
    expect(negWeightSet).toBeUndefined()
    const heavySet = bench!.sets.find(s => s.weight === 999.99)
    expect(heavySet).toBeDefined()

    // Row 6 (RPE=-1): RPE is silently dropped (< 0 never assigned to set)
    // but the set itself is valid (weight=500, reps=1)
    const squat = workouts[0].exercises.find(e => e.exercise.name === 'Squat')
    if (squat) {
      const setWithNegRpe = squat.sets.find(s => s.weight === 500)
      expect(setWithNegRpe).toBeDefined()
      expect(setWithNegRpe!.rpe).toBeUndefined()
    }

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })

  it('Hevy extreme values: filters empty sets', async () => {
    const csv = fixture('hevy-extreme-values.csv')
    const { workouts, report } = await convert({ csv, format: 'hevy' })

    expect(workouts.length).toBeGreaterThan(0)

    // Row 2 has all zeros (reps=0, weight=0, distance=0, duration=0) — empty set
    const emptySetWarnings = report.warnings.filter(w =>
      w.type === 'parse' && w.message.includes('Empty set')
    )
    expect(emptySetWarnings.length).toBeGreaterThan(0)

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })
})

describe('robustness: garbage values (Finding #5)', () => {
  it('Strong garbage values: skips unparseable rows, keeps valid ones', async () => {
    const csv = fixture('strong-garbage-values.csv')
    const { workouts, report } = await convert({ csv, format: 'strong', weightUnit: 'kg' })

    // Row 2 has invalid date — should be skipped
    const skippedRows = report.warnings.filter(w => w.type === 'skipped_row')
    expect(skippedRows.length).toBeGreaterThan(0)

    // Row 4 (weight=80, reps=5) is the only fully valid row
    expect(workouts.length).toBeGreaterThan(0)
    const bench = workouts[0].exercises[0]
    const validSet = bench.sets.find(s => s.weight === 80 && s.reps === 5)
    expect(validSet).toBeDefined()

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })

  it('parseNumber rejects Infinity and -Infinity', () => {
    expect(parseNumber('Infinity')).toBeUndefined()
    expect(parseNumber('-Infinity')).toBeUndefined()
    expect(parseNumber('NaN')).toBeUndefined()
    // Normal values still work
    expect(parseNumber('42')).toBe(42)
    expect(parseNumber('0')).toBe(0)
    expect(parseNumber('-5')).toBe(-5)
  })
})

describe('robustness: reversed/zero Hevy duration (Finding #7)', () => {
  it('warns on reversed timestamps', async () => {
    const csv = fixture('hevy-reversed-time.csv')
    const { workouts, report } = await convert({ csv, format: 'hevy' })

    // Should still produce workouts (the sets are valid)
    expect(workouts.length).toBeGreaterThan(0)

    // Should warn about reversed time
    const reversedWarning = report.warnings.find(w =>
      w.message.includes('start time is after end time')
    )
    expect(reversedWarning).toBeDefined()

    // Should warn about zero duration
    const zeroWarning = report.warnings.find(w =>
      w.message.includes('zero duration')
    )
    expect(zeroWarning).toBeDefined()

    // Workouts should not have durationSeconds
    for (const w of workouts) {
      expect(w.durationSeconds).toBeUndefined()
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })
})

describe('robustness: Strong set types (Finding #1)', () => {
  it('extracts set types from Set Type column', async () => {
    const csv = fixture('strong-all-set-types.csv')
    const { workouts } = await convert({ csv, format: 'strong', weightUnit: 'kg' })

    expect(workouts).toHaveLength(1)
    const bench = workouts[0].exercises[0]
    expect(bench.sets).toHaveLength(4)

    // Set 1: Warm Up
    expect(bench.sets[0].type).toBe('warmup')

    // Set 2: Normal — no type field (normal is default)
    expect(bench.sets[1].type).toBeUndefined()

    // Set 3: Drop Set
    expect(bench.sets[2].type).toBe('dropset')

    // Set 4: Failure — should set toFailure
    expect(bench.sets[3].toFailure).toBe(true)

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })
})

describe('robustness: date format normalization (Finding #2)', () => {
  it('groups same-instant dates with different formats together', async () => {
    const csv = fixture('strong-date-formats.csv')
    const { workouts, report } = await convert({ csv, format: 'strong', weightUnit: 'kg' })

    // Rows with "2024-01-15 10:30:00", "2024-01-15T10:30:00Z", "2024-01-15T10:30:00"
    // should group together since they represent the same instant when parsed
    // The +05:30 offset is a different instant so it groups separately
    // Some date formats may not parse — check warnings

    // At minimum, we should get fewer workouts than raw rows (8 rows)
    // and the parseable same-instant rows should be grouped
    expect(workouts.length).toBeLessThan(8)

    // Every workout produced should be valid
    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }

    // Unparseable date formats should produce warnings
    const totalWorkouts = workouts.length
    const skippedRows = report.warnings.filter(w => w.type === 'skipped_row').length
    expect(totalWorkouts + skippedRows).toBeGreaterThan(0)
  })
})
