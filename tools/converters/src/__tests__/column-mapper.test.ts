import { describe, it, expect } from 'vitest'
import { mapColumns } from '../mapping/column-mapper.js'

describe('mapColumns', () => {
  const exactMap = { 'Date': 'rawDate', 'Weight': 'weight' }
  const aliasMap = { 'workout_name': 'workoutName' }

  it('maps exact matches at tier 1', () => {
    const result = mapColumns(['Date', 'Weight'], exactMap, aliasMap)
    expect(result).toEqual([
      { sourceColumn: 'Date', targetField: 'rawDate', tier: 'exact', confidence: 1.0 },
      { sourceColumn: 'Weight', targetField: 'weight', tier: 'exact', confidence: 1.0 },
    ])
  })

  it('maps alias matches at tier 2', () => {
    const result = mapColumns(['workout_name'], exactMap, aliasMap)
    expect(result).toEqual([
      { sourceColumn: 'workout_name', targetField: 'workoutName', tier: 'fuzzy', confidence: 0.8 },
    ])
  })

  it('marks unknown columns as unmapped', () => {
    const result = mapColumns(['FooBar'], exactMap, aliasMap)
    expect(result).toEqual([
      { sourceColumn: 'FooBar', targetField: null, tier: 'unmapped', confidence: 0 },
    ])
  })
})
