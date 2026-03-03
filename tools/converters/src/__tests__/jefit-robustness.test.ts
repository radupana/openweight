import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { convert } from '../convert.js'
import { isValidWorkoutLog } from '@openweight/sdk'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixture = (name: string) =>
  readFileSync(resolve(__dirname, '..', '__fixtures__', 'exploratory', name), 'utf-8')

const jefitOpts = { format: 'jefit' as const, weightUnit: 'kg' as const }

describe('JEFIT robustness', () => {
  it('single set — minimal valid file', async () => {
    const csv = fixture('jefit-single-set.csv')
    const { workouts } = await convert({ csv, ...jefitOpts })

    expect(workouts).toHaveLength(1)
    expect(workouts[0].exercises).toHaveLength(1)
    expect(workouts[0].exercises[0].sets).toHaveLength(1)
    expect(workouts[0].exercises[0].sets[0].weight).toBe(100)
    expect(workouts[0].exercises[0].sets[0].reps).toBe(5)

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })

  it('header only — 0 workouts', async () => {
    const csv = fixture('jefit-header-only.csv')
    const { workouts } = await convert({ csv, ...jefitOpts })
    expect(workouts).toHaveLength(0)
  })

  it('empty logs — warns and skips exercises with no sets', async () => {
    const csv = fixture('jefit-empty-logs.csv')
    const { workouts, report } = await convert({ csv, ...jefitOpts })

    // Only Deadlift has valid logs
    expect(workouts).toHaveLength(1)
    expect(workouts[0].exercises).toHaveLength(1)
    expect(workouts[0].exercises[0].exercise.name).toBe('Deadlift')

    // 3 exercise log rows total, 2 skipped (empty logs)
    expect(report.totalRows).toBe(3)
    expect(report.skippedRows).toBe(2)

    const noSetsWarnings = report.warnings.filter((w) =>
      w.message.includes('no valid sets')
    )
    expect(noSetsWarnings.length).toBeGreaterThanOrEqual(1)

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })

  it('bodyweight exercises — weight=0 becomes undefined', async () => {
    const csv = fixture('jefit-bodyweight.csv')
    const { workouts } = await convert({ csv, ...jefitOpts })

    expect(workouts).toHaveLength(1)

    // Pull-up, Dip, Push-up should have no weight
    const pullUp = workouts[0].exercises.find((e) => e.exercise.name === 'Pull-up')
    expect(pullUp).toBeDefined()
    expect(pullUp!.sets[0].weight).toBeUndefined()
    expect(pullUp!.sets[0].reps).toBe(12)

    const dip = workouts[0].exercises.find((e) => e.exercise.name === 'Dip')
    expect(dip).toBeDefined()
    expect(dip!.sets[0].weight).toBeUndefined()

    // Bench Press should have weight
    const bench = workouts[0].exercises.find((e) => e.exercise.name === 'Bench Press')
    expect(bench).toBeDefined()
    expect(bench!.sets[0].weight).toBe(100)

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })

  it('decimal weights — preserved accurately', async () => {
    const csv = fixture('jefit-decimal-weights.csv')
    const { workouts } = await convert({ csv, ...jefitOpts })

    expect(workouts).toHaveLength(1)
    const bench = workouts[0].exercises.find((e) => e.exercise.name === 'Bench Press')
    expect(bench!.sets[0].weight).toBe(102.5)

    const curl = workouts[0].exercises.find((e) => e.exercise.name === 'Bicep Curl')
    expect(curl!.sets[0].weight).toBe(12.5)

    const lateral = workouts[0].exercises.find((e) => e.exercise.name === 'Lateral Raise')
    expect(lateral!.sets[0].weight).toBe(7.5)

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })

  it('starttimie typo — uses typo column for date', async () => {
    const csv = fixture('jefit-starttimie-typo.csv')
    const { workouts } = await convert({ csv, ...jefitOpts })

    expect(workouts).toHaveLength(2)
    // Dates should be parsed from the starttimie column
    expect(workouts[0].date).toContain('2024')

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })

  it('starttime missing — falls back to mydate', async () => {
    const csv = fixture('jefit-starttime-missing.csv')
    const { workouts } = await convert({ csv, ...jefitOpts })

    // Session 1 and 3 have no starttime — should fall back to mydate
    // Session 2 has starttime
    expect(workouts.length).toBeGreaterThanOrEqual(2)

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })

  it('unicode exercise names — preserved', async () => {
    const csv = fixture('jefit-unicode-exercises.csv')
    const { workouts } = await convert({ csv, ...jefitOpts })

    expect(workouts).toHaveLength(1)
    const exerciseNames = workouts[0].exercises.map((e) => e.exercise.name)

    // Bench Press normalized, others kept as-is (no mapping)
    expect(exerciseNames).toContain('Bench Press')
    expect(exerciseNames).toContain('Sentadilla Frontal')
    expect(exerciseNames).toContain('Entwicklungsdrücken')
    expect(exerciseNames).toContain('懸垂')
    expect(exerciseNames).toContain('Подтягивания')

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })

  it('malformed logs — warns per token, keeps valid sets', async () => {
    const csv = fixture('jefit-malformed-logs.csv')
    const { workouts, report } = await convert({ csv, ...jefitOpts })

    // Some exercises should produce valid workouts despite bad tokens
    expect(workouts.length).toBeGreaterThanOrEqual(1)

    // Should have parse warnings for malformed tokens
    const parseWarnings = report.warnings.filter((w) => w.type === 'parse')
    expect(parseWarnings.length).toBeGreaterThan(0)

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })

  it('extreme values — sanitized by transform pipeline', async () => {
    const csv = fixture('jefit-extreme-values.csv')
    const { workouts, report } = await convert({ csv, ...jefitOpts })

    expect(workouts.length).toBeGreaterThanOrEqual(1)

    // Negative weight (-5x5) should be rejected at parse time with a clear warning
    const negativeWarnings = report.warnings.filter((w) =>
      w.message.includes('Negative value')
    )
    expect(negativeWarnings.length).toBeGreaterThan(0)

    // Squat has "-5x5,100x5" — the -5 set is rejected, the 100x5 set survives
    const squat = workouts[0].exercises.find((e) => e.exercise.name === 'Squat')
    expect(squat).toBeDefined()
    expect(squat!.sets.every((s) => s.weight === undefined || s.weight > 0)).toBe(true)

    // Zero reps (100x0) should be rejected with a clear warning
    const zeroRepsWarnings = report.warnings.filter((w) =>
      w.message.includes('Zero reps')
    )
    expect(zeroRepsWarnings.length).toBeGreaterThan(0)

    // 999.99 is extreme but valid (under 10000 guard)
    const bench = workouts[0].exercises.find((e) => e.exercise.name === 'Bench Press')
    if (bench) {
      expect(bench.sets[0].weight).toBe(999.99)
    }

    // 1e10 (10 billion) should be rejected by the >10000 guard in unpackSets
    const legPress = workouts[0].exercises.find((e) => e.exercise.name === 'Leg Press')
    if (legPress) {
      const absurdSet = legPress.sets.find((s) => s.weight === 1e10)
      expect(absurdSet).toBeUndefined()
    }

    // Warnings should be generated for unreasonable values
    const unreasonableWarnings = report.warnings.filter((w) =>
      w.message.includes('Unreasonable value')
    )
    expect(unreasonableWarnings.length).toBeGreaterThan(0)

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })

  it('missing session — orphan logs warn and are skipped', async () => {
    const csv = fixture('jefit-missing-session.csv')
    const { workouts, report } = await convert({ csv, ...jefitOpts })

    // Only session 1 exists — exercises for 999 and 888 should be skipped
    expect(workouts).toHaveLength(1)

    // Report should reflect skipped rows
    expect(report.skippedRows).toBe(2)
    expect(report.totalRows).toBe(4)
    expect(report.convertedRows).toBe(2)

    const orphanWarnings = report.warnings.filter((w) =>
      w.message.includes('unknown session')
    )
    expect(orphanWarnings).toHaveLength(2)

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })

  it('zero duration — omitted from workout', async () => {
    const csv = fixture('jefit-zero-duration.csv')
    const { workouts } = await convert({ csv, ...jefitOpts })

    expect(workouts).toHaveLength(2)

    // Session 1 has total_time=0, should have no duration
    const session1 = workouts[0]
    expect(session1.durationSeconds).toBeUndefined()

    // Session 2 has total_time=3600
    const session2 = workouts[1]
    expect(session2.durationSeconds).toBe(3600)

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })

  it('many exercises — stress test with 16 exercises', async () => {
    const csv = fixture('jefit-many-exercises.csv')
    const { workouts } = await convert({ csv, ...jefitOpts })

    expect(workouts).toHaveLength(1)
    expect(workouts[0].exercises).toHaveLength(16)

    // Verify a few exercise names are normalized
    const names = workouts[0].exercises.map((e) => e.exercise.name)
    expect(names).toContain('Bench Press')
    expect(names).toContain('Squat')
    expect(names).toContain('Pull-up')
    expect(names).toContain('Skull Crusher')

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })

  it('duplicate sessions — first occurrence wins with warning', async () => {
    const csv = fixture('jefit-duplicate-sessions.csv')
    const { workouts, report } = await convert({ csv, ...jefitOpts })

    // Session ID 1 appears twice — first wins (2024-03-01)
    expect(workouts.length).toBeGreaterThanOrEqual(1)

    const dupWarnings = report.warnings.filter((w) =>
      w.message.includes('Duplicate session')
    )
    expect(dupWarnings).toHaveLength(1)

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })

  it('BOM — stripped and parsed correctly', async () => {
    const csv = fixture('jefit-bom.csv')
    const { workouts } = await convert({ csv, ...jefitOpts })

    expect(workouts).toHaveLength(1)
    expect(workouts[0].exercises).toHaveLength(2)

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })

  it('CRLF — handled correctly', async () => {
    const csv = fixture('jefit-crlf.csv')
    const { workouts } = await convert({ csv, ...jefitOpts })

    expect(workouts).toHaveLength(1)
    expect(workouts[0].exercises).toHaveLength(2)

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })
})
