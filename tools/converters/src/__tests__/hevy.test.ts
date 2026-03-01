import { describe, it, expect } from 'vitest'
import { hevyParser } from '../parsers/hevy.js'

describe('Hevy parser', () => {
  const HEVY_HEADERS = [
    'title', 'start_time', 'end_time', 'description', 'exercise_title',
    'superset_id', 'reps', 'weight_kg', 'weight_lbs', 'duration_seconds',
    'distance_km', 'distance_miles', 'rpe', 'set_index', 'set_type',
  ]

  describe('detect', () => {
    it('detects Hevy CSV headers', () => {
      expect(hevyParser.detect(HEVY_HEADERS)).toBe(true)
    })

    it('rejects non-Hevy headers', () => {
      expect(hevyParser.detect(['Date', 'Exercise Name', 'Set Order'])).toBe(false)
    })
  })

  describe('mapColumns', () => {
    it('maps all known Hevy columns', () => {
      const mappings = hevyParser.mapColumns(HEVY_HEADERS)
      const mapped = mappings.filter((m) => m.tier !== 'unmapped')
      expect(mapped.length).toBe(HEVY_HEADERS.length)
    })
  })

  describe('parseRow', () => {
    it('parses a valid Hevy row with kg weight', () => {
      const row = {
        'title': 'Morning Workout',
        'start_time': '2024-01-15T10:30:00Z',
        'end_time': '2024-01-15T12:00:00Z',
        'description': '',
        'exercise_title': 'Bench Press (Barbell)',
        'superset_id': '',
        'reps': '5',
        'weight_kg': '100',
        'weight_lbs': '220.46',
        'duration_seconds': '0',
        'distance_km': '0',
        'distance_miles': '0',
        'rpe': '8',
        'set_index': '1',
        'set_type': '1',
      }

      const result = hevyParser.parseRow(row, 0, { csv: '' })
      expect(result).not.toBeNull()
      expect(result!.exerciseName).toBe('Bench Press')
      expect(result!.weight).toBe(100)
      expect(result!.weightUnit).toBe('kg')
      expect(result!.reps).toBe(5)
      expect(result!.rpe).toBe(8)
    })

    it('falls back to lbs when kg is 0', () => {
      const row = {
        'title': 'Test',
        'start_time': '2024-01-15T10:30:00Z',
        'end_time': '2024-01-15T12:00:00Z',
        'description': '',
        'exercise_title': 'Bench Press (Barbell)',
        'superset_id': '',
        'reps': '5',
        'weight_kg': '0',
        'weight_lbs': '220',
        'duration_seconds': '0',
        'distance_km': '0',
        'distance_miles': '0',
        'rpe': '',
        'set_index': '1',
        'set_type': '1',
      }

      const result = hevyParser.parseRow(row, 0, { csv: '' })
      expect(result!.weight).toBe(220)
      expect(result!.weightUnit).toBe('lb')
    })

    it('captures superset ID', () => {
      const row = {
        'title': 'Test',
        'start_time': '2024-01-15T10:30:00Z',
        'end_time': '2024-01-15T12:00:00Z',
        'description': '',
        'exercise_title': 'Bench Press (Barbell)',
        'superset_id': '1',
        'reps': '8',
        'weight_kg': '80',
        'weight_lbs': '176',
        'duration_seconds': '0',
        'distance_km': '0',
        'distance_miles': '0',
        'rpe': '',
        'set_index': '1',
        'set_type': '1',
      }

      const result = hevyParser.parseRow(row, 0, { csv: '' })
      expect(result!.supersetId).toBe('1')
    })
  })
})
