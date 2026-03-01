import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const CLI = resolve(__dirname, '../../dist/index.js')
const EXAMPLES = resolve(__dirname, '../../../../examples')

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

describe('validate command', () => {
  it('validates a valid workout-log', () => {
    const result = run(['validate', `${EXAMPLES}/workout-logs/simple-strength.json`])
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('Valid workout-log')
  })

  it('validates a valid program', () => {
    const result = run(['validate', `${EXAMPLES}/programs/minimal.json`])
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('Valid program')
  })

  it('validates a valid lifter-profile', () => {
    const result = run(['validate', `${EXAMPLES}/lifter-profiles/minimal.json`])
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('Valid lifter-profile')
  })

  it('rejects an invalid file with explicit schema', () => {
    const result = run([
      'validate',
      '--schema', 'workout-log',
      `${EXAMPLES}/invalid/missing-date.json`,
    ])
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('Invalid workout-log')
    expect(result.stderr).toContain('date')
  })

  it('rejects invalid JSON', () => {
    const result = run(['validate', `${EXAMPLES}/../package.json`])
    // package.json is valid JSON but not a valid openweight schema
    // It should fail to detect or validate
    expect(result.exitCode).toBe(1)
  })

  it('shows error for missing file', () => {
    const result = run(['validate', 'nonexistent.json'])
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('Error')
  })

  it('accepts --schema flag', () => {
    const result = run([
      'validate',
      '--schema', 'workout-log',
      `${EXAMPLES}/workout-logs/minimal.json`,
    ])
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('Valid workout-log')
  })
})
