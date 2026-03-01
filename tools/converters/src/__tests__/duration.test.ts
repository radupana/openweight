import { describe, it, expect } from 'vitest'
import { parseDuration } from '../transform/duration.js'

describe('parseDuration', () => {
  it('parses "1h 23m"', () => {
    expect(parseDuration('1h 23m')).toBe(4980)
  })

  it('parses "1h 23m 45s"', () => {
    expect(parseDuration('1h 23m 45s')).toBe(5025)
  })

  it('parses "55m"', () => {
    expect(parseDuration('55m')).toBe(3300)
  })

  it('parses "45s"', () => {
    expect(parseDuration('45s')).toBe(45)
  })

  it('parses HH:MM:SS', () => {
    expect(parseDuration('1:23:45')).toBe(5025)
  })

  it('parses MM:SS', () => {
    expect(parseDuration('23:45')).toBe(1425)
  })

  it('parses raw seconds as string', () => {
    expect(parseDuration('3600')).toBe(3600)
  })

  it('parses raw seconds as number', () => {
    expect(parseDuration(3600)).toBe(3600)
  })

  it('returns undefined for empty/invalid input', () => {
    expect(parseDuration('')).toBeUndefined()
    expect(parseDuration(undefined)).toBeUndefined()
    expect(parseDuration(0)).toBeUndefined()
  })
})
