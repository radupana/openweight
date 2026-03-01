import { describe, it, expect } from 'vitest'
import {
  buildColumnMappingPrompt,
  buildExerciseNormPrompt,
  parseColumnMappingResponse,
  parseExerciseNormResponse,
} from '../ai/prompts.js'

describe('buildColumnMappingPrompt', () => {
  it('includes unmapped headers', () => {
    const prompt = buildColumnMappingPrompt({
      unmappedHeaders: ['Kg', 'Notizen'],
      validFields: ['weight', 'exerciseNotes'],
      sampleRows: [{ Kg: '100', Notizen: 'good set' }],
    })

    expect(prompt).toContain('"Kg"')
    expect(prompt).toContain('"Notizen"')
    expect(prompt).toContain('weight')
    expect(prompt).toContain('exerciseNotes')
    expect(prompt).toContain('100')
  })

  it('includes valid target fields', () => {
    const prompt = buildColumnMappingPrompt({
      unmappedHeaders: ['X'],
      validFields: ['rawDate', 'weight', 'reps'],
      sampleRows: [],
    })

    expect(prompt).toContain('rawDate')
    expect(prompt).toContain('weight')
    expect(prompt).toContain('reps')
  })
})

describe('buildExerciseNormPrompt', () => {
  it('includes unknown names and canonical references', () => {
    const prompt = buildExerciseNormPrompt({
      unknownNames: ['BB Bench', 'Pulldown'],
      knownCanonicalNames: ['Bench Press', 'Lat Pulldown'],
    })

    expect(prompt).toContain('"BB Bench"')
    expect(prompt).toContain('"Pulldown"')
    expect(prompt).toContain('Bench Press')
    expect(prompt).toContain('Lat Pulldown')
  })
})

describe('parseColumnMappingResponse', () => {
  it('parses valid JSON response', () => {
    const result = parseColumnMappingResponse(JSON.stringify([
      { sourceColumn: 'Kg', targetField: 'weight', confidence: 0.9, reasoning: 'weight values' },
    ]))

    expect(result).toHaveLength(1)
    expect(result[0].sourceColumn).toBe('Kg')
    expect(result[0].targetField).toBe('weight')
  })

  it('filters out low-confidence results', () => {
    const result = parseColumnMappingResponse(JSON.stringify([
      { sourceColumn: 'Kg', targetField: 'weight', confidence: 0.5, reasoning: 'unsure' },
    ]))

    expect(result).toHaveLength(0)
  })

  it('handles markdown code block wrapping', () => {
    const result = parseColumnMappingResponse(
      '```json\n[{"sourceColumn": "Kg", "targetField": "weight", "confidence": 0.9, "reasoning": "test"}]\n```'
    )

    expect(result).toHaveLength(1)
  })

  it('returns empty array for invalid JSON', () => {
    expect(parseColumnMappingResponse('not json')).toEqual([])
  })

  it('returns empty array for non-array JSON', () => {
    expect(parseColumnMappingResponse('{"key": "value"}')).toEqual([])
  })

  it('filters out malformed items', () => {
    const result = parseColumnMappingResponse(JSON.stringify([
      { sourceColumn: 'Kg', confidence: 0.9 }, // missing targetField
      { sourceColumn: 'Reps', targetField: 'reps', confidence: 0.8, reasoning: 'ok' },
    ]))

    expect(result).toHaveLength(1)
    expect(result[0].sourceColumn).toBe('Reps')
  })
})

describe('parseExerciseNormResponse', () => {
  it('parses valid response', () => {
    const result = parseExerciseNormResponse(JSON.stringify([
      { originalName: 'BB Bench', canonicalName: 'Bench Press', confidence: 0.95, reasoning: 'abbreviation' },
    ]))

    expect(result).toHaveLength(1)
    expect(result[0].canonicalName).toBe('Bench Press')
  })

  it('filters low-confidence suggestions', () => {
    const result = parseExerciseNormResponse(JSON.stringify([
      { originalName: 'X', canonicalName: 'Y', confidence: 0.3, reasoning: 'guess' },
    ]))

    expect(result).toHaveLength(0)
  })

  it('returns empty array for invalid input', () => {
    expect(parseExerciseNormResponse('')).toEqual([])
  })
})
