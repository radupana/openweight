import { describe, it, expect } from 'vitest'
import { parseWeightUnit, parseDistanceUnit, parseNumber } from '../transform/units.js'

describe('parseWeightUnit', () => {
  it('normalizes weight unit variants', () => {
    expect(parseWeightUnit('kg')).toBe('kg')
    expect(parseWeightUnit('kgs')).toBe('kg')
    expect(parseWeightUnit('lb')).toBe('lb')
    expect(parseWeightUnit('lbs')).toBe('lb')
    expect(parseWeightUnit('pounds')).toBe('lb')
  })

  it('returns undefined for invalid', () => {
    expect(parseWeightUnit(undefined)).toBeUndefined()
    expect(parseWeightUnit('stones')).toBeUndefined()
  })
})

describe('parseDistanceUnit', () => {
  it('normalizes distance unit variants', () => {
    expect(parseDistanceUnit('m')).toBe('m')
    expect(parseDistanceUnit('meters')).toBe('m')
    expect(parseDistanceUnit('km')).toBe('km')
    expect(parseDistanceUnit('mi')).toBe('mi')
    expect(parseDistanceUnit('miles')).toBe('mi')
  })

  it('returns undefined for invalid', () => {
    expect(parseDistanceUnit(undefined)).toBeUndefined()
  })
})

describe('parseNumber', () => {
  it('parses numeric strings', () => {
    expect(parseNumber('100')).toBe(100)
    expect(parseNumber('3.5')).toBe(3.5)
    expect(parseNumber('0')).toBe(0)
  })

  it('returns undefined for non-numeric', () => {
    expect(parseNumber(undefined)).toBeUndefined()
    expect(parseNumber('')).toBeUndefined()
    expect(parseNumber('abc')).toBeUndefined()
  })
})
