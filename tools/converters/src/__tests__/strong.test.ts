import { describe, it, expect } from 'vitest'
import { strongParser } from '../parsers/strong.js'

describe('Strong parser', () => {
  const STRONG_HEADERS = [
    'Date', 'Workout Name', 'Duration', 'Exercise Name',
    'Set Order', 'Weight', 'Reps', 'Distance', 'Seconds',
    'Notes', 'Workout Notes', 'RPE',
  ]

  describe('detect', () => {
    it('detects Strong CSV headers', () => {
      expect(strongParser.detect(STRONG_HEADERS)).toBe(true)
    })

    it('rejects non-Strong headers', () => {
      expect(strongParser.detect(['title', 'start_time', 'exercise_title'])).toBe(false)
    })
  })

  describe('mapColumns', () => {
    it('maps all known Strong columns', () => {
      const mappings = strongParser.mapColumns(STRONG_HEADERS)
      const exact = mappings.filter((m) => m.tier === 'exact')
      expect(exact.length).toBe(STRONG_HEADERS.length)
    })
  })

  describe('parseRow', () => {
    it('parses a valid Strong row', () => {
      const row = {
        'Date': '2024-01-15 10:30:00',
        'Workout Name': 'Push Day',
        'Duration': '1h 10m',
        'Exercise Name': 'Barbell Bench Press',
        'Set Order': '1',
        'Weight': '100',
        'Reps': '5',
        'Distance': '0',
        'Seconds': '0',
        'Notes': '',
        'Workout Notes': '',
        'RPE': '8',
      }

      const result = strongParser.parseRow(row, 0, { csv: '', weightUnit: 'kg' })
      expect(result).not.toBeNull()
      expect(result!.exerciseName).toBe('Bench Press')
      expect(result!.weight).toBe(100)
      expect(result!.reps).toBe(5)
      expect(result!.rpe).toBe(8)
      expect(result!.weightUnit).toBe('kg')
    })

    it('returns null for rows missing date', () => {
      const row = {
        'Date': '',
        'Exercise Name': 'Barbell Bench Press',
        'Set Order': '1',
        'Weight': '100',
        'Reps': '5',
      }
      expect(strongParser.parseRow(row, 0, { csv: '' })).toBeNull()
    })
  })
})
