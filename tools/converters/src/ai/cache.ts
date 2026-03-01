import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { createHash } from 'node:crypto'

interface CacheData {
  columnMappings: Record<string, Record<string, string>>
  exerciseMappings: Record<string, string>
}

const DEFAULT_CACHE_DIR = join(homedir(), '.openweight')
const CACHE_FILE = 'mapping-cache.json'

export class MappingCache {
  private data: CacheData
  private filePath: string

  constructor(cacheDir?: string) {
    const dir = cacheDir ?? DEFAULT_CACHE_DIR
    this.filePath = join(dir, CACHE_FILE)
    this.data = this.load(dir)
  }

  private load(dir: string): CacheData {
    try {
      if (existsSync(this.filePath)) {
        const raw = readFileSync(this.filePath, 'utf-8')
        const parsed = JSON.parse(raw)
        return {
          columnMappings: parsed.columnMappings ?? {},
          exerciseMappings: parsed.exerciseMappings ?? {},
        }
      }
    } catch {
      // Corrupt cache — start fresh
    }
    return { columnMappings: {}, exerciseMappings: {} }
  }

  static hashHeaders(headers: string[]): string {
    const sorted = [...headers].sort().join('|')
    return createHash('sha256').update(sorted).digest('hex').slice(0, 16)
  }

  getColumnMappings(headers: string[]): Record<string, string> | undefined {
    const key = MappingCache.hashHeaders(headers)
    return this.data.columnMappings[key]
  }

  setColumnMappings(headers: string[], mappings: Record<string, string>): void {
    const key = MappingCache.hashHeaders(headers)
    this.data.columnMappings[key] = mappings
  }

  getExerciseMapping(name: string): string | undefined {
    return this.data.exerciseMappings[name.toLowerCase()]
  }

  setExerciseMapping(originalName: string, canonicalName: string): void {
    this.data.exerciseMappings[originalName.toLowerCase()] = canonicalName
  }

  save(): void {
    const dir = join(this.filePath, '..')
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(this.filePath, JSON.stringify(this.data, null, 2) + '\n')
  }
}
