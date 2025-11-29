export type WeightUnit = 'kg' | 'lb'

export type DistanceUnit = 'm' | 'km' | 'ft' | 'mi' | 'yd'

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
  [key: string]: unknown
}
