/**
 * Parse various date string formats into ISO 8601 date-time strings.
 *
 * Supported formats:
 * - "2024-01-15 10:30:00" (Strong format)
 * - "2024-01-15T10:30:00Z" (ISO 8601)
 * - "15 Jan 2024, 10:30" (Hevy format)
 * - "Jan 15, 2024 10:30 AM"
 * - "01/15/2024 10:30"
 */
export function parseDate(raw: string): string | null {
  if (!raw || !raw.trim()) return null

  const s = raw.trim()

  // Already ISO 8601 with timezone
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2}|Z)$/.test(s)) {
    return s
  }

  // ISO-like without timezone: "2024-01-15T10:30:00"
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(s)) {
    return s + 'Z'
  }

  // Strong format: "2024-01-15 10:30:00"
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) {
    return s.replace(' ', 'T') + 'Z'
  }

  // "2024-01-15 10:30"
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(s)) {
    return s.replace(' ', 'T') + ':00Z'
  }

  // Date only: "2024-01-15"
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return s + 'T00:00:00Z'
  }

  // "15 Jan 2024, 10:30" (Hevy) or "15 Jan 2024 10:30"
  const hevyMatch = s.match(
    /^(\d{1,2})\s+(\w{3})\s+(\d{4})[,\s]+(\d{1,2}):(\d{2})$/
  )
  if (hevyMatch) {
    const [, day, mon, year, hour, min] = hevyMatch
    const monthNum = monthToNum(mon)
    if (monthNum === null) return null
    return `${year}-${pad(monthNum)}-${pad(Number(day))}T${pad(Number(hour))}:${min}:00Z`
  }

  // "Jan 15, 2024 10:30 AM"
  const usMatch = s.match(
    /^(\w{3})\s+(\d{1,2}),?\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
  )
  if (usMatch) {
    const [, mon, day, year, hourStr, min, ampm] = usMatch
    const monthNum = monthToNum(mon)
    if (monthNum === null) return null
    let hour = Number(hourStr)
    if (ampm) {
      if (ampm.toUpperCase() === 'PM' && hour !== 12) hour += 12
      if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0
    }
    return `${year}-${pad(monthNum)}-${pad(Number(day))}T${pad(hour)}:${min}:00Z`
  }

  // MM/DD/YYYY HH:MM
  const slashMatch = s.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/
  )
  if (slashMatch) {
    const [, month, day, year, hour, min] = slashMatch
    return `${year}-${pad(Number(month))}-${pad(Number(day))}T${pad(Number(hour))}:${min}:00Z`
  }

  return null
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

function monthToNum(mon: string): number | null {
  return MONTHS[mon.toLowerCase().slice(0, 3)] ?? null
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}
