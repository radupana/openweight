export type WeightUnit = 'kg' | 'lb'

export type DistanceUnit = 'm' | 'km' | 'ft' | 'mi' | 'yd'

// ============================================
// Workout Log Types (completed workouts)
// ============================================

export interface SetLog {
  reps?: number
  weight?: number
  unit?: WeightUnit
  durationSeconds?: number
  distance?: number
  distanceUnit?: DistanceUnit
  rpe?: number
  rir?: number
  toFailure?: boolean
  type?: string
  restSeconds?: number
  tempo?: string
  notes?: string
  [key: string]: unknown
}

export interface Exercise {
  name: string
  equipment?: string
  category?: string
  musclesWorked?: string[]
  [key: string]: unknown
}

export interface ExerciseLog {
  exercise: Exercise
  sets: SetLog[]
  order?: number
  notes?: string
  supersetId?: number
  [key: string]: unknown
}

export interface WorkoutLog {
  date: string
  exercises: ExerciseLog[]
  name?: string
  notes?: string
  durationSeconds?: number
  templateId?: string
  [key: string]: unknown
}

// ============================================
// Workout Template Types (planned workouts)
// ============================================

export interface SetTemplate {
  targetReps?: number
  targetRepsMin?: number
  targetRepsMax?: number
  targetWeight?: number
  unit?: WeightUnit
  percentage?: number
  percentageOf?: string
  targetRPE?: number
  targetRIR?: number
  restSeconds?: number
  tempo?: string
  type?: string
  notes?: string
  [key: string]: unknown
}

export interface ExerciseTemplate {
  exercise: Exercise
  sets: SetTemplate[]
  order?: number
  notes?: string
  supersetId?: number
  [key: string]: unknown
}

export interface WorkoutTemplate {
  name: string
  exercises: ExerciseTemplate[]
  notes?: string
  day?: number
  [key: string]: unknown
}

// ============================================
// Program Types (multi-week training programs)
// ============================================

export interface ProgramWeek {
  workouts: WorkoutTemplate[]
  name?: string
  notes?: string
  [key: string]: unknown
}

export interface Program {
  name: string
  weeks: ProgramWeek[]
  description?: string
  author?: string
  tags?: string[]
  [key: string]: unknown
}

// ============================================
// Lifter Profile Types
// ============================================

export type Sex = 'male' | 'female'

export type HeightUnit = 'cm' | 'in'

export type E1RMFormula = 'brzycki' | 'epley' | 'lombardi' | 'mayhew' | 'oconner' | 'wathan'

export type RepMaxType = 'actual' | 'estimated'

export interface Height {
  value: number
  unit: HeightUnit
}

export interface Bodyweight {
  value: number
  unit: WeightUnit
  date?: string
}

export interface BodyweightEntry {
  value: number
  unit: WeightUnit
  date: string
  notes?: string
  [key: string]: unknown
}

export interface RepMax {
  reps: number
  weight: number
  unit: WeightUnit
  date: string
  type?: RepMaxType
  bodyweightKg?: number
  workoutId?: string
  rpe?: number
  notes?: string
  [key: string]: unknown
}

export interface Estimated1RM {
  value: number
  unit: WeightUnit
  formula: E1RMFormula
  basedOnReps: number
  basedOnWeight: number
  date?: string
  [key: string]: unknown
}

export interface VolumePR {
  value: number
  unit: WeightUnit
  date: string
  notes?: string
  [key: string]: unknown
}

export interface DurationPR {
  seconds: number
  date: string
  weight?: number
  unit?: WeightUnit
  notes?: string
  [key: string]: unknown
}

export interface ExerciseRecord {
  exercise: Exercise
  repMaxes?: RepMax[]
  estimated1RM?: Estimated1RM
  volumePR?: VolumePR
  durationPR?: DurationPR
  [key: string]: unknown
}

export interface LiftScores {
  wilks?: number
  dots?: number
  ipfGl?: number
  glossbrenner?: number
  [key: string]: unknown
}

export interface NormalizedScores {
  squat?: LiftScores
  bench?: LiftScores
  deadlift?: LiftScores
  total?: LiftScores
  [key: string]: unknown
}

export interface LifterProfile {
  exportedAt: string
  name?: string
  sex?: Sex
  birthDate?: string
  height?: Height
  bodyweight?: Bodyweight
  bodyweightHistory?: BodyweightEntry[]
  records?: ExerciseRecord[]
  normalizedScores?: NormalizedScores
  [key: string]: unknown
}
