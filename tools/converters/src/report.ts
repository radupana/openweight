import type { WorkoutLog } from '@openweight/sdk'
import type {
  ConversionReport,
  ColumnMapping,
  ConversionWarning,
  SourceFormat,
} from './types.js'

export function buildReport(options: {
  source: SourceFormat
  totalRows: number
  convertedRows: number
  skippedRows: number
  workouts: WorkoutLog[]
  columnMappings: ColumnMapping[]
  unmappedExercises: string[]
  warnings: ConversionWarning[]
}): ConversionReport {
  const exerciseSet = new Set<string>()
  for (const w of options.workouts) {
    for (const e of w.exercises) {
      exerciseSet.add(e.exercise.name)
    }
  }

  return {
    source: options.source,
    totalRows: options.totalRows,
    convertedRows: options.convertedRows,
    skippedRows: options.skippedRows,
    workoutCount: options.workouts.length,
    exerciseCount: exerciseSet.size,
    columnMappings: options.columnMappings,
    unmappedExercises: options.unmappedExercises,
    warnings: options.warnings,
  }
}
