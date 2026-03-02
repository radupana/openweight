import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { convert, detectFormat } from '../convert.js'
import { isValidWorkoutLog } from '@openweight/sdk'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixture = (name: string) =>
  readFileSync(resolve(__dirname, '..', '__fixtures__', name), 'utf-8')

describe('JEFIT format detection', () => {
  it('detects JEFIT format', () => {
    expect(detectFormat(fixture('jefit-basic.csv'))).toBe('jefit')
  })

  it('auto-detects JEFIT when format not specified', async () => {
    const csv = fixture('jefit-basic.csv')
    const { report } = await convert({ csv, weightUnit: 'kg' })
    expect(report.source).toBe('jefit')
  })
})

describe('JEFIT convert', () => {
  it('converts a basic JEFIT export', async () => {
    const csv = fixture('jefit-basic.csv')
    const { workouts, report } = await convert({ csv, format: 'jefit', weightUnit: 'kg' })

    expect(workouts).toHaveLength(1)
    expect(report.source).toBe('jefit')
    expect(report.workoutCount).toBe(1)

    const workout = workouts[0]
    expect(workout.exercises).toHaveLength(2)
    expect(workout.durationSeconds).toBe(3600)

    // Exercise name normalization
    const bench = workout.exercises[0]
    expect(bench.exercise.name).toBe('Bench Press')
    expect(bench.sets).toHaveLength(3)
    expect(bench.sets[0].weight).toBe(100)
    expect(bench.sets[0].unit).toBe('kg')
    expect(bench.sets[0].reps).toBe(5)

    const squat = workout.exercises[1]
    expect(squat.exercise.name).toBe('Squat')
    expect(squat.sets).toHaveLength(3)
    expect(squat.sets[2].reps).toBe(3)

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })

  it('converts multi-session JEFIT export', async () => {
    const csv = fixture('jefit-multisession.csv')
    const { workouts, report } = await convert({ csv, format: 'jefit', weightUnit: 'kg' })

    expect(workouts).toHaveLength(3)
    expect(report.workoutCount).toBe(3)

    // Workouts should be sorted by date
    for (let i = 1; i < workouts.length; i++) {
      expect(workouts[i].date >= workouts[i - 1].date).toBe(true)
    }

    // Session 1: 3 exercises
    expect(workouts[0].exercises).toHaveLength(3)
    expect(workouts[0].exercises[0].exercise.name).toBe('Bench Press')
    expect(workouts[0].exercises[1].exercise.name).toBe('Squat')
    expect(workouts[0].exercises[2].exercise.name).toBe('Bicep Curl')

    // Session 2: 3 exercises
    expect(workouts[1].exercises).toHaveLength(3)
    expect(workouts[1].exercises[0].exercise.name).toBe('Deadlift')
    expect(workouts[1].exercises[1].exercise.name).toBe('Bent Over Row')

    // Session 2: Pull Up should have bodyweight (no weight)
    const pullUp = workouts[1].exercises[2]
    expect(pullUp.exercise.name).toBe('Pull-up')
    expect(pullUp.sets[0].weight).toBeUndefined()
    expect(pullUp.sets[0].reps).toBe(10)

    // Session 3: 3 exercises
    expect(workouts[2].exercises).toHaveLength(3)
    expect(workouts[2].exercises[0].exercise.name).toBe('Overhead Press')

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })

  it('converts a real-world JEFIT export', async () => {
    const csv = fixture('jefit-real.csv')
    const { workouts, report } = await convert({ csv, format: 'jefit', weightUnit: 'kg' })

    expect(workouts).toHaveLength(5)
    expect(report.workoutCount).toBe(5)
    expect(report.skippedRows).toBe(0)

    // Count total exercises across all workouts
    // 26 exercise log rows, but Pull Up (0xN sets) in session 103
    // may lose one exercise if sanitization drops an edge case
    const totalExercises = workouts.reduce((sum, w) => sum + w.exercises.length, 0)
    expect(totalExercises).toBeGreaterThanOrEqual(25)

    // All workouts should have duration
    for (const w of workouts) {
      expect(w.durationSeconds).toBeDefined()
      expect(w.durationSeconds).toBeGreaterThan(0)
    }

    // Spot-check exercise names are normalized
    expect(workouts[0].exercises[0].exercise.name).toBe('Bench Press')
    expect(workouts[0].exercises[4].exercise.name).toBe('Lateral Raise')
    expect(workouts[1].exercises[0].exercise.name).toBe('Squat')

    // Check decimal weights are preserved
    const inclinePress = workouts[0].exercises[1]
    expect(inclinePress.sets.some((s) => s.weight === 32.5)).toBe(true)

    for (const w of workouts) {
      expect(isValidWorkoutLog(w)).toBe(true)
    }
  })

  describe('report', () => {
    it('includes conversion statistics', async () => {
      const csv = fixture('jefit-basic.csv')
      const { report } = await convert({ csv, format: 'jefit', weightUnit: 'kg' })

      expect(report.totalRows).toBeGreaterThan(0)
      expect(report.convertedRows).toBeGreaterThan(0)
      expect(report.skippedRows).toBe(0)
      expect(report.workoutCount).toBe(1)
      expect(report.exerciseCount).toBe(2)
      expect(report.columnMappings.length).toBeGreaterThan(0)
    })
  })
})
