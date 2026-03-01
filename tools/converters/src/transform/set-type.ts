/**
 * Normalize raw set type strings from various apps into openweight set type and flags.
 */
export interface NormalizedSetType {
  type?: string
  toFailure?: boolean
}

const SET_TYPE_MAP: Record<string, NormalizedSetType> = {
  // Strong set types
  'normal': {},
  'warm up': { type: 'warmup' },
  'warm-up': { type: 'warmup' },
  'warmup': { type: 'warmup' },
  'drop set': { type: 'dropset' },
  'dropset': { type: 'dropset' },
  'failure': { toFailure: true },
  'to failure': { toFailure: true },

  // Hevy set types
  '1': {},  // normal
  '2': { type: 'warmup' },
  '3': { type: 'dropset' },
  '4': { toFailure: true },
}

export function normalizeSetType(raw: string | undefined): NormalizedSetType {
  if (!raw || !raw.trim()) return {}
  return SET_TYPE_MAP[raw.trim().toLowerCase()] ?? {}
}
