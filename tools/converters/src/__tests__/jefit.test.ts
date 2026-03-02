import { describe, it, expect } from 'vitest'
import { isJefit, splitJefitSections, unpackSets, parseJefit } from '../parsers/jefit.js'

describe('isJefit', () => {
  it('returns true for JEFIT content', () => {
    const content = `### WORKOUT SESSIONS ###
_id,mydate,starttime,starttimie,total_time
1,2024-01-15,1705305000,,3600
###########################

### EXERCISE LOGS ###
belongsession,ename,logs
1,"Bench Press","100x5"
###########################`
    expect(isJefit(content)).toBe(true)
  })

  it('returns false for Strong CSV', () => {
    const content = `Date,Workout Name,Exercise Name,Set Order,Weight,Reps
2024-01-15,Push,Bench Press,1,100,5`
    expect(isJefit(content)).toBe(false)
  })

  it('returns false for plain text', () => {
    expect(isJefit('hello world')).toBe(false)
  })
})

describe('splitJefitSections', () => {
  it('splits a valid JEFIT file into sections', () => {
    const content = `### WORKOUT SESSIONS ###
_id,mydate,starttime,starttimie,total_time
1,2024-01-15,1705305000,,3600
###########################

### EXERCISE LOGS ###
belongsession,ename,logs
1,"Bench Press","100x5"
###########################`
    const { workoutSessions, exerciseLogs } = splitJefitSections(content)
    expect(workoutSessions).toContain('_id,mydate')
    expect(workoutSessions).toContain('1,2024-01-15')
    expect(exerciseLogs).toContain('belongsession,ename,logs')
    expect(exerciseLogs).toContain('Bench Press')
  })

  it('throws on missing markers', () => {
    expect(() => splitJefitSections('no markers here')).toThrow('Missing JEFIT section markers')
  })
})

describe('unpackSets', () => {
  const ctx = { exerciseName: 'Bench Press', sourceRow: 1 }

  it('unpacks a single set', () => {
    const { sets, warnings } = unpackSets('100x5', ctx)
    expect(sets).toEqual([{ weight: 100, reps: 5 }])
    expect(warnings).toHaveLength(0)
  })

  it('unpacks multiple sets', () => {
    const { sets } = unpackSets('100x5,100x5,100x3', ctx)
    expect(sets).toHaveLength(3)
    expect(sets[2]).toEqual({ weight: 100, reps: 3 })
  })

  it('treats weight=0 as bodyweight (undefined)', () => {
    const { sets } = unpackSets('0x10,0x8', ctx)
    expect(sets[0].weight).toBeUndefined()
    expect(sets[0].reps).toBe(10)
  })

  it('handles decimal weights', () => {
    const { sets } = unpackSets('102.5x5,7.5x15', ctx)
    expect(sets[0]).toEqual({ weight: 102.5, reps: 5 })
    expect(sets[1]).toEqual({ weight: 7.5, reps: 15 })
  })

  it('returns empty for empty string', () => {
    const { sets, warnings } = unpackSets('', ctx)
    expect(sets).toHaveLength(0)
    expect(warnings).toHaveLength(0)
  })

  it('warns on malformed tokens', () => {
    const { sets, warnings } = unpackSets('abcxdef,100x5', ctx)
    expect(sets).toHaveLength(1)
    expect(sets[0]).toEqual({ weight: 100, reps: 5 })
    expect(warnings).toHaveLength(1)
    expect(warnings[0].type).toBe('parse')
  })

  it('warns on tokens with wrong number of parts', () => {
    const { warnings } = unpackSets('100x5x3,100', ctx)
    expect(warnings).toHaveLength(2)
  })

  it('warns on NaN values', () => {
    const { sets, warnings } = unpackSets('NaNxNaN,15x10', ctx)
    expect(sets).toHaveLength(1)
    expect(warnings).toHaveLength(1)
  })
})

describe('parseJefit', () => {
  it('parses a basic JEFIT file into intermediate rows', () => {
    const content = `### WORKOUT SESSIONS ###
_id,mydate,starttime,starttimie,total_time
1,2024-01-15,1705305000,,3600
###########################

### EXERCISE LOGS ###
belongsession,ename,logs
1,"Barbell Bench Press","100x5,100x5,100x3"
1,"Barbell Squat","140x5,140x5"
###########################`

    const { rows, warnings, columnMappings } = parseJefit(content, {
      csv: content,
      weightUnit: 'kg',
    })

    // 3 bench sets + 2 squat sets = 5 rows
    expect(rows).toHaveLength(5)
    expect(columnMappings.length).toBeGreaterThan(0)

    // Exercise names should be normalized
    expect(rows[0].exerciseName).toBe('Bench Press')
    expect(rows[3].exerciseName).toBe('Squat')

    // Weight unit should be set
    expect(rows[0].weightUnit).toBe('kg')

    // Duration should come from session
    expect(rows[0].rawDuration).toBe(3600)

    // Parse warnings should be empty for valid data
    const parseWarnings = warnings.filter((w) => w.type === 'parse')
    expect(parseWarnings).toHaveLength(0)
  })

  it('uses starttimie (typo) when starttime is missing', () => {
    const content = `### WORKOUT SESSIONS ###
_id,mydate,starttimie,total_time
1,2024-03-01,1709290800,3600
###########################

### EXERCISE LOGS ###
belongsession,ename,logs
1,"Barbell Bench Press","100x5"
###########################`

    const { rows } = parseJefit(content, { csv: content, weightUnit: 'kg' })
    expect(rows).toHaveLength(1)
    // Should have parsed the date from starttimie
    expect(rows[0].rawDate).toContain('2024')
  })

  it('falls back to mydate when no timestamps', () => {
    const content = `### WORKOUT SESSIONS ###
_id,mydate,starttime,starttimie,total_time
1,2024-03-01,,,3600
###########################

### EXERCISE LOGS ###
belongsession,ename,logs
1,"Barbell Bench Press","100x5"
###########################`

    const { rows } = parseJefit(content, { csv: content, weightUnit: 'kg' })
    expect(rows).toHaveLength(1)
    expect(rows[0].rawDate).toBe('2024-03-01')
  })

  it('handles bodyweight exercises (weight=0)', () => {
    const content = `### WORKOUT SESSIONS ###
_id,mydate,starttime,starttimie,total_time
1,2024-01-15,1705305000,,3600
###########################

### EXERCISE LOGS ###
belongsession,ename,logs
1,"Pull Up","0x10,0x8"
###########################`

    const { rows } = parseJefit(content, { csv: content, weightUnit: 'kg' })
    expect(rows).toHaveLength(2)
    expect(rows[0].weight).toBeUndefined()
    expect(rows[0].weightUnit).toBeUndefined()
    expect(rows[0].reps).toBe(10)
  })

  it('warns on orphan logs referencing unknown sessions', () => {
    const content = `### WORKOUT SESSIONS ###
_id,mydate,starttime,starttimie,total_time
1,2024-01-15,1705305000,,3600
###########################

### EXERCISE LOGS ###
belongsession,ename,logs
1,"Bench Press","100x5"
999,"Squat","140x5"
###########################`

    const { rows, warnings } = parseJefit(content, { csv: content, weightUnit: 'kg' })
    expect(rows).toHaveLength(1)
    const orphanWarnings = warnings.filter((w) => w.message.includes('unknown session'))
    expect(orphanWarnings).toHaveLength(1)
  })

  it('warns on duplicate session IDs — first wins', () => {
    const content = `### WORKOUT SESSIONS ###
_id,mydate,starttime,starttimie,total_time
1,2024-03-01,1709290800,,3600
1,2024-03-05,1709636400,,2700
###########################

### EXERCISE LOGS ###
belongsession,ename,logs
1,"Bench Press","100x5"
###########################`

    const { rows, warnings } = parseJefit(content, { csv: content, weightUnit: 'kg' })
    expect(rows).toHaveLength(1)
    // Date should be from first session
    expect(rows[0].rawDate).toContain('2024-03-01')
    const dupWarnings = warnings.filter((w) => w.message.includes('Duplicate session'))
    expect(dupWarnings).toHaveLength(1)
  })

  it('skips exercises with empty logs', () => {
    const content = `### WORKOUT SESSIONS ###
_id,mydate,starttime,starttimie,total_time
1,2024-01-15,1705305000,,3600
###########################

### EXERCISE LOGS ###
belongsession,ename,logs
1,"Bench Press",""
1,"Squat","140x5"
###########################`

    const { rows, warnings } = parseJefit(content, { csv: content, weightUnit: 'kg' })
    expect(rows).toHaveLength(1)
    expect(rows[0].exerciseName).toBe('Squat')
    const emptyWarnings = warnings.filter((w) => w.message.includes('no valid sets'))
    expect(emptyWarnings).toHaveLength(1)
  })

  it('handles zero duration as no duration', () => {
    const content = `### WORKOUT SESSIONS ###
_id,mydate,starttime,starttimie,total_time
1,2024-01-15,1705305000,,0
###########################

### EXERCISE LOGS ###
belongsession,ename,logs
1,"Bench Press","100x5"
###########################`

    const { rows } = parseJefit(content, { csv: content, weightUnit: 'kg' })
    expect(rows).toHaveLength(1)
    expect(rows[0].rawDuration).toBeUndefined()
  })

  it('strips BOM from content', () => {
    const content = `\uFEFF### WORKOUT SESSIONS ###
_id,mydate,starttime,starttimie,total_time
1,2024-03-01,1709290800,,3600
###########################

### EXERCISE LOGS ###
belongsession,ename,logs
1,"Barbell Bench Press","100x5"
###########################`

    const { rows } = parseJefit(content, { csv: content, weightUnit: 'kg' })
    expect(rows).toHaveLength(1)
  })

  it('handles CRLF line endings', () => {
    const content = '### WORKOUT SESSIONS ###\r\n_id,mydate,starttime,starttimie,total_time\r\n1,2024-03-01,1709290800,,3600\r\n###########################\r\n\r\n### EXERCISE LOGS ###\r\nbelongsession,ename,logs\r\n1,"Barbell Bench Press","100x5"\r\n###########################'

    const { rows } = parseJefit(content, { csv: content, weightUnit: 'kg' })
    expect(rows).toHaveLength(1)
  })
})
