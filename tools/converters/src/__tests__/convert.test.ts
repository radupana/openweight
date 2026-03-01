import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { convert, detectFormat } from '../convert.js'
import { isValidWorkoutLog } from '@openweight/sdk'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixture = (name: string) =>
  readFileSync(resolve(__dirname, '..', '__fixtures__', name), 'utf-8')

describe('detectFormat', () => {
  it('detects Strong format', () => {
    expect(detectFormat(fixture('strong-basic.csv'))).toBe('strong')
  })

  it('detects Hevy format', () => {
    expect(detectFormat(fixture('hevy-basic.csv'))).toBe('hevy')
  })
})

describe('convert', () => {
  describe('Strong CSV', () => {
    it('converts a basic Strong export', () => {
      const csv = fixture('strong-basic.csv')
      const { workouts, report } = convert({ csv, format: 'strong', weightUnit: 'kg' })

      expect(workouts).toHaveLength(1)
      expect(report.source).toBe('strong')
      expect(report.workoutCount).toBe(1)

      const workout = workouts[0]
      expect(workout.name).toBe('Morning Workout')
      expect(workout.exercises).toHaveLength(2)
      expect(workout.durationSeconds).toBe(4980) // 1h 23m

      // Bench Press: 3 sets
      const bench = workout.exercises[0]
      expect(bench.exercise.name).toBe('Bench Press')
      expect(bench.sets).toHaveLength(3)
      expect(bench.sets[0].weight).toBe(100)
      expect(bench.sets[0].unit).toBe('kg')
      expect(bench.sets[0].reps).toBe(5)
      expect(bench.sets[0].rpe).toBe(8)

      // Squat: 3 sets
      const squat = workout.exercises[1]
      expect(squat.exercise.name).toBe('Squat')
      expect(squat.sets).toHaveLength(3)

      // All workouts should be valid
      for (const w of workouts) {
        expect(isValidWorkoutLog(w)).toBe(true)
      }
    })

    it('converts multiple workouts from Strong', () => {
      const csv = fixture('strong-multiworkout.csv')
      const { workouts, report } = convert({ csv, format: 'strong', weightUnit: 'kg' })

      expect(workouts).toHaveLength(2)
      expect(report.workoutCount).toBe(2)

      // First workout: Push Day
      expect(workouts[0].name).toBe('Push Day')
      expect(workouts[0].exercises).toHaveLength(2)

      // Second workout: Pull Day
      expect(workouts[1].name).toBe('Pull Day')
      expect(workouts[1].exercises).toHaveLength(2)

      // Exercise name normalization
      expect(workouts[0].exercises[0].exercise.name).toBe('Bench Press')
      expect(workouts[0].exercises[1].exercise.name).toBe('Lateral Raise')
      expect(workouts[1].exercises[0].exercise.name).toBe('Deadlift')
      expect(workouts[1].exercises[1].exercise.name).toBe('Pull-up')

      for (const w of workouts) {
        expect(isValidWorkoutLog(w)).toBe(true)
      }
    })
  })

  describe('Hevy CSV', () => {
    it('converts a basic Hevy export', () => {
      const csv = fixture('hevy-basic.csv')
      const { workouts, report } = convert({ csv, format: 'hevy' })

      expect(workouts).toHaveLength(1)
      expect(report.source).toBe('hevy')

      const workout = workouts[0]
      expect(workout.name).toBe('Morning Workout')
      expect(workout.exercises).toHaveLength(2)

      // Bench Press: 3 sets, weight in kg
      const bench = workout.exercises[0]
      expect(bench.exercise.name).toBe('Bench Press')
      expect(bench.sets).toHaveLength(3)
      expect(bench.sets[0].weight).toBe(100)
      expect(bench.sets[0].unit).toBe('kg')

      // Squat: 2 sets
      const squat = workout.exercises[1]
      expect(squat.exercise.name).toBe('Squat')
      expect(squat.sets).toHaveLength(2)

      for (const w of workouts) {
        expect(isValidWorkoutLog(w)).toBe(true)
      }
    })

    it('converts Hevy supersets', () => {
      const csv = fixture('hevy-supersets.csv')
      const { workouts } = convert({ csv, format: 'hevy' })

      expect(workouts).toHaveLength(1)
      const workout = workouts[0]
      expect(workout.exercises).toHaveLength(3)

      // Bench and Row should have supersetId = 1
      const bench = workout.exercises[0]
      const row = workout.exercises[1]
      expect(bench.supersetId).toBe(1)
      expect(row.supersetId).toBe(1)

      // Lateral raise should not have supersetId
      const lateral = workout.exercises[2]
      expect(lateral.supersetId).toBeUndefined()

      for (const w of workouts) {
        expect(isValidWorkoutLog(w)).toBe(true)
      }
    })
  })

  describe('auto-detection', () => {
    it('auto-detects Strong format when format not specified', () => {
      const csv = fixture('strong-basic.csv')
      const { report } = convert({ csv, weightUnit: 'kg' })
      expect(report.source).toBe('strong')
    })

    it('auto-detects Hevy format when format not specified', () => {
      const csv = fixture('hevy-basic.csv')
      const { report } = convert({ csv })
      expect(report.source).toBe('hevy')
    })
  })

  describe('report', () => {
    it('includes conversion statistics', () => {
      const csv = fixture('strong-basic.csv')
      const { report } = convert({ csv, format: 'strong', weightUnit: 'kg' })

      expect(report.totalRows).toBe(6)
      expect(report.convertedRows).toBe(6)
      expect(report.skippedRows).toBe(0)
      expect(report.workoutCount).toBe(1)
      expect(report.exerciseCount).toBe(2)
      expect(report.columnMappings.length).toBeGreaterThan(0)
    })
  })
})
