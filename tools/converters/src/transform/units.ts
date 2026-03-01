import type { WeightUnit, DistanceUnit } from '@openweight/sdk'

const VALID_WEIGHT_UNITS: Set<string> = new Set(['kg', 'lb'])
const VALID_DISTANCE_UNITS: Set<string> = new Set(['m', 'km', 'ft', 'mi', 'yd'])

export function isValidWeightUnit(unit: string): unit is WeightUnit {
  return VALID_WEIGHT_UNITS.has(unit)
}

export function isValidDistanceUnit(unit: string): unit is DistanceUnit {
  return VALID_DISTANCE_UNITS.has(unit)
}

export function parseWeightUnit(raw: string | undefined): WeightUnit | undefined {
  if (!raw) return undefined
  const normalized = raw.trim().toLowerCase()
  // Handle common variations
  if (normalized === 'lbs' || normalized === 'lb' || normalized === 'pounds') return 'lb'
  if (normalized === 'kg' || normalized === 'kgs' || normalized === 'kilograms') return 'kg'
  return isValidWeightUnit(normalized) ? normalized : undefined
}

export function parseDistanceUnit(raw: string | undefined): DistanceUnit | undefined {
  if (!raw) return undefined
  const normalized = raw.trim().toLowerCase()
  if (normalized === 'meters' || normalized === 'meter') return 'm'
  if (normalized === 'kilometers' || normalized === 'kilometer') return 'km'
  if (normalized === 'feet' || normalized === 'foot') return 'ft'
  if (normalized === 'miles' || normalized === 'mile') return 'mi'
  if (normalized === 'yards' || normalized === 'yard') return 'yd'
  return isValidDistanceUnit(normalized) ? normalized : undefined
}

export function parseNumber(raw: string | undefined): number | undefined {
  if (!raw || !raw.trim()) return undefined
  const num = Number(raw.trim())
  return isNaN(num) ? undefined : num
}
