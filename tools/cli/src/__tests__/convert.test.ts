import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { readFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'

const CLI = resolve(__dirname, '../../dist/index.js')
const FIXTURES = resolve(__dirname, '../../../converters/src/__fixtures__')

function run(args: string[]): { stdout: string; stderr: string; exitCode: number } {
  const result = spawnSync('node', [CLI, ...args], {
    encoding: 'utf-8',
    timeout: 10000,
  })
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 1,
  }
}

describe('convert command', () => {
  it('converts Strong CSV with auto-detection', () => {
    const result = run([
      'convert',
      '--weight-unit', 'kg',
      `${FIXTURES}/strong-basic.csv`,
    ])
    expect(result.exitCode).toBe(0)
    const workout = JSON.parse(result.stdout)
    expect(workout.date).toBe('2024-01-15T10:30:00Z')
    expect(workout.exercises).toHaveLength(2)
  })

  it('converts Hevy CSV with auto-detection', () => {
    const result = run([
      'convert',
      `${FIXTURES}/hevy-basic.csv`,
    ])
    expect(result.exitCode).toBe(0)
    const workout = JSON.parse(result.stdout)
    expect(workout.date).toBe('2024-01-15T10:30:00Z')
    expect(workout.exercises).toHaveLength(2)
  })

  it('outputs multiple workouts as array', () => {
    const result = run([
      'convert',
      '--weight-unit', 'kg',
      `${FIXTURES}/strong-multiworkout.csv`,
    ])
    expect(result.exitCode).toBe(0)
    const workouts = JSON.parse(result.stdout)
    expect(Array.isArray(workouts)).toBe(true)
    expect(workouts).toHaveLength(2)
  })

  it('supports --pretty flag', () => {
    const result = run([
      'convert',
      '--pretty',
      `${FIXTURES}/hevy-basic.csv`,
    ])
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('\n  ')
  })

  it('supports --output flag', () => {
    const outFile = resolve(tmpdir(), `openweight-test-${Date.now()}.json`)
    try {
      const result = run([
        'convert',
        '--weight-unit', 'kg',
        '--output', outFile,
        `${FIXTURES}/strong-basic.csv`,
      ])
      expect(result.exitCode).toBe(0)
      const content = readFileSync(outFile, 'utf-8')
      const workout = JSON.parse(content)
      expect(workout.date).toBeDefined()
    } finally {
      try { unlinkSync(outFile) } catch {}
    }
  })

  it('shows report with --report flag', () => {
    const result = run([
      'convert',
      '--report',
      `${FIXTURES}/hevy-basic.csv`,
    ])
    expect(result.exitCode).toBe(0)
    expect(result.stderr).toContain('Conversion Report')
    expect(result.stderr).toContain('Source:')
    expect(result.stderr).toContain('Workouts:')
  })

  it('requires --weight-unit for Strong', () => {
    const result = run([
      'convert',
      '--format', 'strong',
      `${FIXTURES}/strong-basic.csv`,
    ])
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('weight unit')
  })

  it('rejects unknown format', () => {
    const result = run([
      'convert',
      '--format', 'fitbod',
      `${FIXTURES}/strong-basic.csv`,
    ])
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('Unknown format')
  })
})
