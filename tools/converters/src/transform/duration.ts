/**
 * Parse duration strings into seconds.
 *
 * Supported formats:
 * - "1h 23m" / "1h 23m 45s"
 * - "01:23:45" (HH:MM:SS)
 * - "23:45" (MM:SS)
 * - "3600" (raw seconds as string)
 * - 3600 (raw seconds as number)
 */
export function parseDuration(raw: string | number | undefined): number | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined

  if (typeof raw === 'number') {
    return raw > 0 ? raw : undefined
  }

  const s = raw.trim()

  // "1h 23m 45s" / "1h 23m" / "23m 45s" / "1h" / "23m" / "45s"
  const hmsMatch = s.match(
    /^(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?$/
  )
  if (hmsMatch && (hmsMatch[1] || hmsMatch[2] || hmsMatch[3])) {
    const h = Number(hmsMatch[1] || 0)
    const m = Number(hmsMatch[2] || 0)
    const sec = Number(hmsMatch[3] || 0)
    return h * 3600 + m * 60 + sec
  }

  // HH:MM:SS
  const colonMatch = s.match(/^(\d+):(\d{2}):(\d{2})$/)
  if (colonMatch) {
    const [, h, m, sec] = colonMatch
    return Number(h) * 3600 + Number(m) * 60 + Number(sec)
  }

  // MM:SS
  const mmssMatch = s.match(/^(\d+):(\d{2})$/)
  if (mmssMatch) {
    const [, m, sec] = mmssMatch
    return Number(m) * 60 + Number(sec)
  }

  // Raw seconds as string
  const num = Number(s)
  if (!isNaN(num) && num > 0) return num

  return undefined
}
