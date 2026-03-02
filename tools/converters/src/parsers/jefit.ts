import { parseCSV } from './csv.js'
import { normalizeExerciseName } from '../mapping/exercise-names.js'
import type {
  IntermediateRow,
  ConversionWarning,
  ColumnMapping,
  ConvertOptions,
} from '../types.js'

/**
 * Convert a Unix timestamp (seconds) to an ISO 8601 string without milliseconds.
 * The transformer's parseDate only matches ISO strings without .000Z fractional seconds.
 */
function unixToISO(seconds: number): string {
  const d = new Date(seconds * 1000)
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

const SESSIONS_MARKER = '### WORKOUT SESSIONS ###'
const LOGS_MARKER = '### EXERCISE LOGS ###'
const SECTION_END = '###########################'

/**
 * Detect whether raw content is a JEFIT export by checking for section markers.
 */
export function isJefit(content: string): boolean {
  return content.includes(SESSIONS_MARKER) && content.includes(LOGS_MARKER)
}

/**
 * Split a JEFIT composite file into its two CSV sections.
 */
export function splitJefitSections(raw: string): {
  workoutSessions: string
  exerciseLogs: string
} {
  const sessionsStart = raw.indexOf(SESSIONS_MARKER)
  const logsStart = raw.indexOf(LOGS_MARKER)

  if (sessionsStart === -1 || logsStart === -1) {
    throw new Error('Missing JEFIT section markers')
  }

  // Extract sessions section: after marker line, up to section end
  const afterSessionsMarker = raw.indexOf('\n', sessionsStart)
  const sessionsEndMarker = raw.indexOf(SECTION_END, afterSessionsMarker)
  const workoutSessions = raw
    .slice(afterSessionsMarker + 1, sessionsEndMarker)
    .trim()

  // Extract logs section: after marker line, up to section end
  const afterLogsMarker = raw.indexOf('\n', logsStart)
  const logsEndMarker = raw.indexOf(SECTION_END, afterLogsMarker)
  const exerciseLogs = raw.slice(afterLogsMarker + 1, logsEndMarker).trim()

  return { workoutSessions, exerciseLogs }
}

interface UnpackedSet {
  weight: number | undefined
  reps: number | undefined
}

/**
 * Unpack JEFIT's "weightxreps,weightxreps" log format into individual sets.
 * Returns warnings for malformed tokens.
 */
export function unpackSets(
  logs: string,
  sourceContext: { exerciseName: string; sourceRow: number }
): { sets: UnpackedSet[]; warnings: ConversionWarning[] } {
  const sets: UnpackedSet[] = []
  const warnings: ConversionWarning[] = []

  if (!logs || !logs.trim()) {
    return { sets, warnings }
  }

  const tokens = logs.split(',')
  for (const token of tokens) {
    const trimmed = token.trim()
    if (!trimmed) continue

    const parts = trimmed.split('x')
    if (parts.length !== 2) {
      warnings.push({
        type: 'parse',
        message: `Malformed set token "${trimmed}" in exercise "${sourceContext.exerciseName}"`,
        sourceRow: sourceContext.sourceRow,
      })
      continue
    }

    const [weightStr, repsStr] = parts
    const weight = Number(weightStr)
    const reps = Number(repsStr)

    if (!isFinite(weight) || !isFinite(reps)) {
      warnings.push({
        type: 'parse',
        message: `Malformed set token "${trimmed}" in exercise "${sourceContext.exerciseName}"`,
        sourceRow: sourceContext.sourceRow,
      })
      continue
    }

    sets.push({
      weight: weight === 0 ? undefined : weight,
      reps: reps,
    })
  }

  return { sets, warnings }
}

interface SessionInfo {
  date: string
  durationSeconds: number | undefined
}

/**
 * Parse full JEFIT export into IntermediateRows.
 */
export function parseJefit(
  content: string,
  options: ConvertOptions
): {
  rows: IntermediateRow[]
  warnings: ConversionWarning[]
  columnMappings: ColumnMapping[]
} {
  const warnings: ConversionWarning[] = []

  // Strip BOM
  const cleaned = content.replace(/^\uFEFF/, '')

  // Normalize line endings
  const normalized = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  const { workoutSessions, exerciseLogs } = splitJefitSections(normalized)

  // Parse workout sessions CSV
  const sessions = parseCSV(workoutSessions)
  const sessionMap = new Map<string, SessionInfo>()

  for (const row of sessions.rows) {
    const id = row['_id']?.trim()
    if (!id) continue

    if (sessionMap.has(id)) {
      warnings.push({
        type: 'parse',
        message: `Duplicate session ID "${id}" — first occurrence wins`,
      })
      continue
    }

    // Resolve date: prefer starttime, then starttimie (typo), then mydate
    const starttime = row['starttime']?.trim()
    const starttimie = row['starttimie']?.trim()
    const mydate = row['mydate']?.trim()

    let date: string | undefined
    if (starttime) {
      date = unixToISO(Number(starttime))
    } else if (starttimie) {
      date = unixToISO(Number(starttimie))
    } else if (mydate) {
      date = mydate
    }

    if (!date) {
      warnings.push({
        type: 'skipped_row',
        message: `Session "${id}" has no usable date — skipped`,
      })
      continue
    }

    // Duration: total_time is in seconds, 0 means no duration
    const totalTime = Number(row['total_time']?.trim() || '0')
    const durationSeconds =
      isFinite(totalTime) && totalTime > 0 ? totalTime : undefined

    sessionMap.set(id, { date, durationSeconds })
  }

  // Parse exercise logs CSV
  const logs = parseCSV(exerciseLogs)
  const rows: IntermediateRow[] = []
  let rowCounter = 0

  for (let i = 0; i < logs.rows.length; i++) {
    const logRow = logs.rows[i]
    const sessionId = logRow['belongsession']?.trim()
    const exerciseNameRaw = logRow['ename']?.trim()
    const logsStr = logRow['logs']

    if (!sessionId || !exerciseNameRaw) continue

    const session = sessionMap.get(sessionId)
    if (!session) {
      warnings.push({
        type: 'parse',
        message: `Exercise "${exerciseNameRaw}" references unknown session "${sessionId}" — skipped`,
        sourceRow: i + 2,
      })
      continue
    }

    const exerciseName = normalizeExerciseName(
      exerciseNameRaw,
      options.exerciseMappings
    )

    const { sets, warnings: setWarnings } = unpackSets(logsStr ?? '', {
      exerciseName: exerciseNameRaw,
      sourceRow: i + 2,
    })
    warnings.push(...setWarnings)

    if (sets.length === 0) {
      warnings.push({
        type: 'parse',
        message: `Exercise "${exerciseNameRaw}" has no valid sets — skipped`,
        sourceRow: i + 2,
      })
      continue
    }

    for (let setIdx = 0; setIdx < sets.length; setIdx++) {
      const set = sets[setIdx]
      rowCounter++
      rows.push({
        rawDate: session.date,
        rawDuration: session.durationSeconds,
        exerciseName,
        setIndex: setIdx + 1,
        weight: set.weight,
        weightUnit: set.weight !== undefined ? options.weightUnit : undefined,
        reps: set.reps,
        sourceRow: rowCounter,
      })
    }
  }

  // JEFIT doesn't use flat column mapping — produce synthetic mappings for report
  const columnMappings: ColumnMapping[] = [
    {
      sourceColumn: '_id',
      targetField: 'sessionId',
      tier: 'exact',
      confidence: 1,
    },
    {
      sourceColumn: 'mydate',
      targetField: 'rawDate',
      tier: 'exact',
      confidence: 1,
    },
    {
      sourceColumn: 'starttime',
      targetField: 'rawDate',
      tier: 'exact',
      confidence: 1,
    },
    {
      sourceColumn: 'total_time',
      targetField: 'durationSeconds',
      tier: 'exact',
      confidence: 1,
    },
    {
      sourceColumn: 'ename',
      targetField: 'exerciseName',
      tier: 'exact',
      confidence: 1,
    },
    {
      sourceColumn: 'logs',
      targetField: 'weight+reps',
      tier: 'exact',
      confidence: 1,
    },
  ]

  return { rows, warnings, columnMappings }
}
