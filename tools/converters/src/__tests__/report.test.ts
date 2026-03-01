import { describe, it, expect } from 'vitest'
import { buildReport } from '../report.js'

describe('buildReport', () => {
  it('builds a report with correct stats', () => {
    const report = buildReport({
      source: 'strong',
      totalRows: 10,
      convertedRows: 8,
      skippedRows: 2,
      workouts: [
        {
          date: '2024-01-15T10:30:00Z',
          exercises: [
            { exercise: { name: 'Bench Press' }, sets: [{}, {}] },
            { exercise: { name: 'Squat' }, sets: [{}] },
          ],
        },
      ],
      columnMappings: [],
      unmappedExercises: ['Custom Lift'],
      warnings: [],
    })

    expect(report.source).toBe('strong')
    expect(report.totalRows).toBe(10)
    expect(report.convertedRows).toBe(8)
    expect(report.skippedRows).toBe(2)
    expect(report.workoutCount).toBe(1)
    expect(report.exerciseCount).toBe(2)
    expect(report.unmappedExercises).toEqual(['Custom Lift'])
  })
})
