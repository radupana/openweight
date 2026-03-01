import type { WorkoutLog, WeightUnit, DistanceUnit } from '@openweight/sdk'
import type { AIProvider, AIColumnMapping, AIExerciseMapping } from './ai/provider.js'

export type SourceFormat = 'strong' | 'hevy'

export interface ConvertOptions {
  format?: SourceFormat
  csv: string
  weightUnit?: WeightUnit
  exerciseMappings?: Record<string, string>
  ai?: AIProvider
  aiModel?: string
}

export interface ConvertResult {
  workouts: WorkoutLog[]
  report: ConversionReport
}

export interface IntermediateRow {
  rawDate: string
  workoutName?: string
  rawDuration?: string | number
  exerciseName: string
  setIndex: number
  weight?: number
  weightUnit?: WeightUnit
  reps?: number
  distance?: number
  distanceUnit?: DistanceUnit
  durationSeconds?: number
  rpe?: number
  rawSetType?: string
  supersetId?: string
  exerciseNotes?: string
  workoutNotes?: string
  sourceRow: number
}

export interface ColumnMapping {
  sourceColumn: string
  targetField: string | null
  tier: 'exact' | 'fuzzy' | 'ai' | 'unmapped'
  confidence: number
}

export interface SourceParser {
  format: SourceFormat
  detect(headers: string[]): boolean
  mapColumns(headers: string[]): ColumnMapping[]
  parseRow(
    row: Record<string, string>,
    rowIndex: number,
    options: ConvertOptions
  ): IntermediateRow | null
}

export interface ConversionWarning {
  type: 'unmapped_column' | 'unmapped_exercise' | 'skipped_row' | 'validation' | 'parse'
  message: string
  sourceRow?: number
  details?: string
}

export interface ConversionReport {
  source: SourceFormat
  totalRows: number
  convertedRows: number
  skippedRows: number
  workoutCount: number
  exerciseCount: number
  columnMappings: ColumnMapping[]
  unmappedExercises: string[]
  warnings: ConversionWarning[]
  aiColumnMappings?: AIColumnMapping[]
  aiExerciseSuggestions?: AIExerciseMapping[]
}

export interface ParsedCSV {
  headers: string[]
  rows: Record<string, string>[]
}
