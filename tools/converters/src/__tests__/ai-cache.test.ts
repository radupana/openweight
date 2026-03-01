import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { MappingCache } from '../ai/cache.js'
import { mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

describe('MappingCache', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ow-cache-test-'))
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  it('returns undefined for cache miss on columns', () => {
    const cache = new MappingCache(tempDir)
    expect(cache.getColumnMappings(['Foo', 'Bar'])).toBeUndefined()
  })

  it('returns undefined for cache miss on exercises', () => {
    const cache = new MappingCache(tempDir)
    expect(cache.getExerciseMapping('Unknown Exercise')).toBeUndefined()
  })

  it('stores and retrieves column mappings', () => {
    const cache = new MappingCache(tempDir)
    const headers = ['Date', 'Kg', 'Reps']
    cache.setColumnMappings(headers, { Kg: 'weight' })
    cache.save()

    const cache2 = new MappingCache(tempDir)
    const result = cache2.getColumnMappings(headers)
    expect(result).toEqual({ Kg: 'weight' })
  })

  it('stores and retrieves exercise mappings', () => {
    const cache = new MappingCache(tempDir)
    cache.setExerciseMapping('BB Bench', 'Bench Press')
    cache.save()

    const cache2 = new MappingCache(tempDir)
    expect(cache2.getExerciseMapping('BB Bench')).toBe('Bench Press')
    expect(cache2.getExerciseMapping('bb bench')).toBe('Bench Press')
  })

  it('column cache key is order-independent', () => {
    const h1 = MappingCache.hashHeaders(['A', 'B', 'C'])
    const h2 = MappingCache.hashHeaders(['C', 'A', 'B'])
    expect(h1).toBe(h2)
  })

  it('creates cache directory if it does not exist', () => {
    const nestedDir = join(tempDir, 'nested', 'dir')
    const cache = new MappingCache(nestedDir)
    cache.setExerciseMapping('test', 'Test')
    cache.save()

    const cache2 = new MappingCache(nestedDir)
    expect(cache2.getExerciseMapping('test')).toBe('Test')
  })
})
