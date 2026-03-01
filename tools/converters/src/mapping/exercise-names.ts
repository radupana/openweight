import mappings from './exercise-mappings.json' with { type: 'json' }

const normalizedMappings: Map<string, string> = new Map()

// Build a case-insensitive lookup
for (const [key, value] of Object.entries(mappings)) {
  normalizedMappings.set(key.toLowerCase(), value as string)
}

/**
 * Normalize an exercise name to its canonical form.
 * Returns the original name if no mapping is found.
 */
export function normalizeExerciseName(
  name: string,
  customMappings?: Record<string, string>
): string {
  if (!name || !name.trim()) return name

  const trimmed = name.trim()

  // Check custom mappings first (exact match, case-insensitive)
  if (customMappings) {
    const customLower = trimmed.toLowerCase()
    for (const [key, value] of Object.entries(customMappings)) {
      if (key.toLowerCase() === customLower) return value
    }
  }

  // Check built-in mappings
  return normalizedMappings.get(trimmed.toLowerCase()) ?? trimmed
}

/**
 * Check if an exercise name has a known canonical mapping.
 */
export function hasExerciseMapping(
  name: string,
  customMappings?: Record<string, string>
): boolean {
  const trimmed = name.trim().toLowerCase()
  if (customMappings) {
    for (const key of Object.keys(customMappings)) {
      if (key.toLowerCase() === trimmed) return true
    }
  }
  return normalizedMappings.has(trimmed)
}
