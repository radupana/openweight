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
