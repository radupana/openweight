import type {
  ColumnMappingRequest,
  AIColumnMapping,
  ExerciseNormRequest,
  AIExerciseMapping,
} from './provider.js'

export function buildColumnMappingPrompt(request: ColumnMappingRequest): string {
  const sampleData = request.sampleRows
    .slice(0, 3)
    .map((row) => {
      const relevant: Record<string, string> = {}
      for (const h of request.unmappedHeaders) {
        if (row[h] !== undefined) relevant[h] = row[h]
      }
      return JSON.stringify(relevant)
    })
    .join('\n')

  return `You are mapping CSV columns from a fitness/workout tracking app export to the openweight data format.

The following CSV columns could not be mapped automatically:
${request.unmappedHeaders.map((h) => `  - "${h}"`).join('\n')}

The valid openweight target fields are:
${request.validFields.map((f) => `  - ${f}`).join('\n')}

Here are sample values from the unmapped columns:
${sampleData}

For each unmapped column, determine if it maps to one of the valid fields.
Return a JSON array of mappings. Only include columns you are confident about (>= 0.7).

Example response:
[
  {"sourceColumn": "Kg", "targetField": "weight", "confidence": 0.9, "reasoning": "Column contains numeric weight values and name suggests kilograms"}
]

If none of the columns can be confidently mapped, return an empty array: []

Respond with ONLY the JSON array, no other text.`
}

export function buildExerciseNormPrompt(request: ExerciseNormRequest): string {
  return `You are normalizing exercise names from a workout tracking app to canonical strength training names.

The following exercise names were not recognized:
${request.unknownNames.map((n) => `  - "${n}"`).join('\n')}

Here are some known canonical exercise names for reference:
${request.knownCanonicalNames.slice(0, 40).map((n) => `  - ${n}`).join('\n')}

For each unknown exercise name, suggest the best canonical name. Use standard strength training terminology.
Only include exercises you are confident about (>= 0.7).

Return a JSON array:
[
  {"originalName": "BB Bench", "canonicalName": "Bench Press", "confidence": 0.95, "reasoning": "BB is abbreviation for barbell, common name for barbell bench press"}
]

If none can be confidently normalized, return an empty array: []

Respond with ONLY the JSON array, no other text.`
}

export function parseColumnMappingResponse(text: string): AIColumnMapping[] {
  const json = extractJSON(text)
  if (!Array.isArray(json)) return []

  return json.filter(
    (item): item is AIColumnMapping =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.sourceColumn === 'string' &&
      typeof item.targetField === 'string' &&
      typeof item.confidence === 'number' &&
      item.confidence >= 0.7
  )
}

export function parseExerciseNormResponse(text: string): AIExerciseMapping[] {
  const json = extractJSON(text)
  if (!Array.isArray(json)) return []

  return json.filter(
    (item): item is AIExerciseMapping =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.originalName === 'string' &&
      typeof item.canonicalName === 'string' &&
      typeof item.confidence === 'number' &&
      item.confidence >= 0.7
  )
}

function extractJSON(text: string): unknown {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    // Try to extract JSON array from markdown code blocks or surrounding text
    const match = text.match(/\[[\s\S]*\]/)
    if (match) {
      try {
        parsed = JSON.parse(match[0])
      } catch {
        return null
      }
    } else {
      return null
    }
  }

  // json_object mode often wraps arrays in an object like {"results": [...]}
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const values = Object.values(parsed as Record<string, unknown>)
    const arr = values.find((v) => Array.isArray(v))
    if (arr) return arr
  }

  return parsed
}
