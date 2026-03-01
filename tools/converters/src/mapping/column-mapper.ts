import { aiMapColumn } from '../ai-stub.js'
import type { ColumnMapping } from '../types.js'

/**
 * 3-tier column mapping engine.
 * Tier 1: Exact match against known column names
 * Tier 2: Fuzzy/alias matching
 * Tier 3: AI-based mapping (stubbed)
 */
export function mapColumns(
  headers: string[],
  exactMap: Record<string, string>,
  aliasMap: Record<string, string>
): ColumnMapping[] {
  return headers.map((header) => {
    // Tier 1: Exact match
    const exactTarget = exactMap[header]
    if (exactTarget) {
      return {
        sourceColumn: header,
        targetField: exactTarget,
        tier: 'exact' as const,
        confidence: 1.0,
      }
    }

    // Tier 2: Fuzzy/alias match (case-insensitive, trimmed)
    const normalized = header.trim().toLowerCase()
    for (const [alias, target] of Object.entries(aliasMap)) {
      if (alias.toLowerCase() === normalized) {
        return {
          sourceColumn: header,
          targetField: target,
          tier: 'fuzzy' as const,
          confidence: 0.8,
        }
      }
    }

    // Tier 3: AI (stubbed)
    const aiResult = aiMapColumn(header)
    if (aiResult) return aiResult

    return {
      sourceColumn: header,
      targetField: null,
      tier: 'unmapped' as const,
      confidence: 0,
    }
  })
}
