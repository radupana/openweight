import type { ColumnMapping } from '../types.js'
import type { AIProvider, AIColumnMapping } from '../ai/provider.js'
import type { MappingCache } from '../ai/cache.js'

/**
 * 3-tier column mapping engine (sync).
 * Tier 1: Exact match against known column names
 * Tier 2: Fuzzy/alias matching
 * Tier 3: Falls through to unmapped (use mapColumnsWithAI for AI tier)
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

    return {
      sourceColumn: header,
      targetField: null,
      tier: 'unmapped' as const,
      confidence: 0,
    }
  })
}

/**
 * Valid openweight intermediate fields that AI can map to.
 */
const VALID_TARGET_FIELDS = [
  'rawDate',
  'workoutName',
  'rawDuration',
  'exerciseName',
  'setIndex',
  'weight',
  'weightUnit',
  'reps',
  'distance',
  'distanceUnit',
  'durationSeconds',
  'rpe',
  'rawSetType',
  'supersetId',
  'exerciseNotes',
  'workoutNotes',
]

/**
 * Async 3-tier column mapping with AI fallback.
 * Runs Tier 1+2 first, then uses AI for remaining unmapped columns.
 */
export async function mapColumnsWithAI(
  headers: string[],
  exactMap: Record<string, string>,
  aliasMap: Record<string, string>,
  ai: AIProvider,
  sampleRows: Record<string, string>[],
  cache?: MappingCache
): Promise<{ mappings: ColumnMapping[]; aiMappings: AIColumnMapping[] }> {
  // Run sync Tier 1+2 first
  const mappings = mapColumns(headers, exactMap, aliasMap)

  const unmapped = mappings.filter((m) => m.tier === 'unmapped')
  if (unmapped.length === 0) {
    return { mappings, aiMappings: [] }
  }

  const unmappedHeaders = unmapped.map((m) => m.sourceColumn)

  // Check cache first
  if (cache) {
    const cached = cache.getColumnMappings(headers)
    if (cached) {
      const aiMappings: AIColumnMapping[] = []
      for (const mapping of mappings) {
        if (mapping.tier === 'unmapped' && cached[mapping.sourceColumn]) {
          mapping.targetField = cached[mapping.sourceColumn]
          mapping.tier = 'ai'
          mapping.confidence = 0.8
          aiMappings.push({
            sourceColumn: mapping.sourceColumn,
            targetField: cached[mapping.sourceColumn],
            confidence: 0.8,
            reasoning: 'cached from previous AI mapping',
          })
        }
      }
      if (aiMappings.length > 0) {
        return { mappings, aiMappings }
      }
    }
  }

  // Call AI for remaining unmapped
  const alreadyMapped = new Set(
    mappings.filter((m) => m.tier !== 'unmapped').map((m) => m.targetField)
  )
  const availableFields = VALID_TARGET_FIELDS.filter((f) => !alreadyMapped.has(f))

  const aiResults = await ai.inferColumnMappings({
    unmappedHeaders,
    validFields: availableFields,
    sampleRows,
  })

  // Merge AI results into mappings
  const aiMappings: AIColumnMapping[] = []
  for (const aiResult of aiResults) {
    if (aiResult.confidence < 0.7) continue
    if (!availableFields.includes(aiResult.targetField)) continue

    const mapping = mappings.find(
      (m) => m.sourceColumn === aiResult.sourceColumn && m.tier === 'unmapped'
    )
    if (mapping) {
      mapping.targetField = aiResult.targetField
      mapping.tier = 'ai'
      mapping.confidence = aiResult.confidence
      aiMappings.push(aiResult)
    }
  }

  return { mappings, aiMappings }
}
