import { describe, it, expect } from 'vitest'
import { normalizeSetType } from '../transform/set-type.js'

describe('normalizeSetType', () => {
  it('returns empty for normal sets', () => {
    expect(normalizeSetType('Normal')).toEqual({})
    expect(normalizeSetType('normal')).toEqual({})
  })

  it('maps warm up variants to warmup type', () => {
    expect(normalizeSetType('Warm Up')).toEqual({ type: 'warmup' })
    expect(normalizeSetType('warm-up')).toEqual({ type: 'warmup' })
    expect(normalizeSetType('warmup')).toEqual({ type: 'warmup' })
  })

  it('maps drop set to dropset type', () => {
    expect(normalizeSetType('Drop Set')).toEqual({ type: 'dropset' })
    expect(normalizeSetType('dropset')).toEqual({ type: 'dropset' })
  })

  it('maps failure to toFailure flag', () => {
    expect(normalizeSetType('Failure')).toEqual({ toFailure: true })
    expect(normalizeSetType('To Failure')).toEqual({ toFailure: true })
  })

  it('returns empty for unknown/empty types', () => {
    expect(normalizeSetType(undefined)).toEqual({})
    expect(normalizeSetType('')).toEqual({})
    expect(normalizeSetType('unknown')).toEqual({})
  })
})
