import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createAIProvider } from '../ai/provider.js'
import type { AIProvider } from '../ai/provider.js'

describe('createAIProvider', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('throws when no env vars are set', async () => {
    delete process.env.OPENWEIGHT_AI_URL
    delete process.env.OPENAI_API_KEY

    await expect(createAIProvider()).rejects.toThrow('OPENWEIGHT_AI_URL or OPENAI_API_KEY')
  })

  it('creates provider with OPENAI_API_KEY', async () => {
    process.env.OPENAI_API_KEY = 'sk-test123'
    delete process.env.OPENWEIGHT_AI_URL

    const provider = await createAIProvider()
    expect(provider).toBeDefined()
    expect(provider.inferColumnMappings).toBeTypeOf('function')
    expect(provider.normalizeExerciseNames).toBeTypeOf('function')
  })

  it('creates provider with OPENWEIGHT_AI_URL', async () => {
    delete process.env.OPENAI_API_KEY
    process.env.OPENWEIGHT_AI_URL = 'http://localhost:11434/v1'

    const provider = await createAIProvider()
    expect(provider).toBeDefined()
  })

  it('accepts explicit options over env vars', async () => {
    delete process.env.OPENAI_API_KEY
    delete process.env.OPENWEIGHT_AI_URL

    const provider = await createAIProvider({
      apiKey: 'sk-explicit',
      model: 'gpt-4o',
    })
    expect(provider).toBeDefined()
  })
})

describe('mock AIProvider', () => {
  function createMockProvider(
    columnResponse: any[] = [],
    exerciseResponse: any[] = []
  ): AIProvider {
    return {
      inferColumnMappings: vi.fn().mockResolvedValue(columnResponse),
      normalizeExerciseNames: vi.fn().mockResolvedValue(exerciseResponse),
    }
  }

  it('returns mock column mappings', async () => {
    const provider = createMockProvider([
      { sourceColumn: 'Kg', targetField: 'weight', confidence: 0.9, reasoning: 'weight column' },
    ])

    const result = await provider.inferColumnMappings({
      unmappedHeaders: ['Kg'],
      validFields: ['weight'],
      sampleRows: [{ Kg: '100' }],
    })

    expect(result).toHaveLength(1)
    expect(result[0].targetField).toBe('weight')
  })

  it('returns mock exercise mappings', async () => {
    const provider = createMockProvider([], [
      { originalName: 'BB Bench', canonicalName: 'Bench Press', confidence: 0.95, reasoning: 'abbreviation' },
    ])

    const result = await provider.normalizeExerciseNames({
      unknownNames: ['BB Bench'],
      knownCanonicalNames: ['Bench Press'],
    })

    expect(result).toHaveLength(1)
    expect(result[0].canonicalName).toBe('Bench Press')
  })
})
