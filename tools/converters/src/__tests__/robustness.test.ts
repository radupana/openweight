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

describe('robustness: bodyweight/distance exercises are not rejected as invalid', () => {
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

describe('robustness: extreme values are sanitized per-field without losing valid data', () => {
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

    // Row 6 (RPE=-1): RPE is silently dropped by transformer (rpe > 0 guard)
    // but the set itself is valid (weight=500, reps=1)
    const squat = workouts[0].exercises.find(e => e.exercise.name === 'Squat')
    expect(squat).toBeDefined()
    const setWithNegRpe = squat!.sets.find(s => s.weight === 500)
    expect(setWithNegRpe).toBeDefined()
    expect(setWithNegRpe!.rpe).toBeUndefined()

    // Row 7 (RPE=11): RPE passes the > 0 guard but sanitizeSet strips it
    // (out of 0-10 range) — the set keeps its weight and reps
    const setWithHighRpe = squat!.sets.find(s => s.weight === 100 && s.reps === 3)
    expect(setWithHighRpe).toBeDefined()
    expect(setWithHighRpe!.rpe).toBeUndefined()

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

describe('robustness: garbage values are skipped, valid rows preserved', () => {
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

describe('robustness: reversed/zero Hevy duration emits warnings', () => {
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

describe('robustness: Strong set types are mapped correctly', () => {
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

describe('robustness: equivalent date formats group into the same workout', () => {
  it('groups same-instant dates with different formats together', async () => {
    const csv = fixture('strong-date-formats.csv')
    const { workouts, report } = await convert({ csv, format: 'strong', weightUnit: 'kg' })

    // Rows 1-3 and 6-8 all resolve to 2024-01-15T10:30:00Z with name "Morning"
    // and should group into a single workout
    const morning = workouts.find(w => w.name === 'Morning')
    expect(morning).toBeDefined()

    // Bench Press sets from rows 1-3,6 + Squat sets from rows 7-8
    const benchSets = morning!.exercises.find(e => e.exercise.name === 'Bench Press')?.sets ?? []
    const squatSets = morning!.exercises.find(e => e.exercise.name === 'Squat')?.sets ?? []
    expect(benchSets.length).toBeGreaterThanOrEqual(3)
    expect(squatSets.length).toBeGreaterThanOrEqual(1)

    // Row 4 (+05:30 offset) is a different UTC instant, so "Afternoon" is separate
    const afternoon = workouts.find(w => w.name === 'Afternoon')
    expect(afternoon).toBeDefined()

    // Row 5 (date only, no time) groups separately
    const dateOnly = workouts.find(w => w.name === 'Date Only')
    expect(dateOnly).toBeDefined()

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })
})
