import { describe, it, expect } from 'vitest'
import { parseDate } from '../transform/date.js'

describe('parseDate', () => {
  it('parses ISO 8601 with timezone', () => {
    expect(parseDate('2024-01-15T10:30:00Z')).toBe('2024-01-15T10:30:00Z')
    expect(parseDate('2024-01-15T10:30:00+05:00')).toBe('2024-01-15T10:30:00+05:00')
  })

  it('parses ISO without timezone (appends Z)', () => {
    expect(parseDate('2024-01-15T10:30:00')).toBe('2024-01-15T10:30:00Z')
  })

  it('parses Strong format "YYYY-MM-DD HH:MM:SS"', () => {
    expect(parseDate('2024-01-15 10:30:00')).toBe('2024-01-15T10:30:00Z')
  })

  it('parses "YYYY-MM-DD HH:MM"', () => {
    expect(parseDate('2024-01-15 10:30')).toBe('2024-01-15T10:30:00Z')
  })

  it('parses date only', () => {
    expect(parseDate('2024-01-15')).toBe('2024-01-15T00:00:00Z')
  })

  it('parses Hevy format "DD Mon YYYY, HH:MM"', () => {
    expect(parseDate('15 Jan 2024, 10:30')).toBe('2024-01-15T10:30:00Z')
  })

  it('parses US format "Mon DD, YYYY HH:MM AM"', () => {
    expect(parseDate('Jan 15, 2024 10:30 AM')).toBe('2024-01-15T10:30:00Z')
    expect(parseDate('Jan 15, 2024 2:30 PM')).toBe('2024-01-15T14:30:00Z')
  })

  it('parses MM/DD/YYYY HH:MM', () => {
    expect(parseDate('01/15/2024 10:30')).toBe('2024-01-15T10:30:00Z')
  })

  it('returns null for empty/invalid input', () => {
    expect(parseDate('')).toBeNull()
    expect(parseDate('not a date')).toBeNull()
  })
})
