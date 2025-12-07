# TypeScript SDK

The TypeScript SDK provides type-safe parsing, validation, and serialization for openweight data.

## Installation

::: code-group

```bash [npm]
npm install @openweight/sdk
```

```bash [pnpm]
pnpm add @openweight/sdk
```

```bash [yarn]
yarn add @openweight/sdk
```

:::

## Requirements

- Node.js 18+
- TypeScript 5.0+ (for type definitions)

## Types

The SDK exports TypeScript interfaces for all schema types:

```typescript
import type {
  // Workout Log
  WorkoutLog,
  ExerciseLog,
  Exercise,
  SetLog,
  // Templates & Programs
  WorkoutTemplate,
  ExerciseTemplate,
  SetTemplate,
  Program,
  ProgramWeek,
  // Lifter Profile
  LifterProfile,
  Height,
  Bodyweight,
  BodyweightEntry,
  ExerciseRecord,
  RepMax,
  Estimated1RM,
  VolumePR,
  DurationPR,
  NormalizedScores,
  LiftScores,
  // Enums
  WeightUnit,
  HeightUnit,
  DistanceUnit,
  Sex,
  E1RMFormula,
  RepMaxType,
} from '@openweight/sdk'
```

### WeightUnit

```typescript
type WeightUnit = 'kg' | 'lb'
```

### DistanceUnit

```typescript
type DistanceUnit = 'm' | 'km' | 'ft' | 'mi' | 'yd'
```

## Parsing

Parse JSON strings into typed objects:

```typescript
import {
  parseWorkoutLog,
  parseWorkoutTemplate,
  parseProgram,
  parseLifterProfile
} from '@openweight/sdk'

const workout = parseWorkoutLog(jsonString)
const template = parseWorkoutTemplate(jsonString)
const program = parseProgram(jsonString)
const profile = parseLifterProfile(jsonString)
```

### Error Handling

```typescript
import { parseWorkoutLog, ParseError } from '@openweight/sdk'

try {
  const workout = parseWorkoutLog(invalidJson)
} catch (error) {
  if (error instanceof ParseError) {
    console.log('Parse failed:', error.message)
    for (const err of error.errors) {
      console.log(`  ${err.path}: ${err.message}`)
    }
  }
}
```

The `ParseError` includes:
- `message`: Human-readable error description
- `errors`: Array of `ValidationError` objects with `path` and `message`

## Validation

### Type Guards

Use type guards for simple validation:

```typescript
import {
  isValidWorkoutLog,
  isValidWorkoutTemplate,
  isValidProgram,
  isValidLifterProfile
} from '@openweight/sdk'

if (isValidWorkoutLog(data)) {
  // TypeScript knows data is WorkoutLog
  console.log(data.date)
}

if (isValidLifterProfile(data)) {
  // TypeScript knows data is LifterProfile
  console.log(data.exportedAt)
}
```

### Detailed Validation

Get detailed error information:

```typescript
import {
  validateWorkoutLog,
  validateWorkoutTemplate,
  validateProgram,
  validateLifterProfile
} from '@openweight/sdk'
import type { ValidationResult, ValidationError } from '@openweight/sdk'

const result: ValidationResult = validateWorkoutLog(data)

if (result.valid) {
  console.log('Data is valid')
} else {
  for (const error of result.errors) {
    console.log(`${error.path}: ${error.message}`)
  }
}

// Same pattern for lifter profiles
const profileResult = validateLifterProfile(data)
```

## Serialization

Convert objects to JSON strings:

```typescript
import {
  serializeWorkoutLog,
  serializeWorkoutLogPretty,
  serializeWorkoutTemplate,
  serializeWorkoutTemplatePretty,
  serializeProgram,
  serializeProgramPretty,
  serializeLifterProfile,
  serializeLifterProfilePretty,
} from '@openweight/sdk'

const workout: WorkoutLog = {
  date: '2024-01-15T09:30:00Z',
  exercises: [
    {
      exercise: { name: 'Squat' },
      sets: [{ reps: 5, weight: 100, unit: 'kg' }]
    }
  ]
}

// Compact (for storage/API)
const compact = serializeWorkoutLog(workout)
// {"date":"2024-01-15T09:30:00Z","exercises":[...]}

// Pretty (for display)
const pretty = serializeWorkoutLogPretty(workout)
// {
//   "date": "2024-01-15T09:30:00Z",
//   "exercises": [...]
// }
```

## Schemas

Access the raw JSON Schema objects:

```typescript
import {
  workoutLogSchema,
  workoutTemplateSchema,
  programSchema,
  lifterProfileSchema
} from '@openweight/sdk'

// Use with your own AJV instance
import Ajv from 'ajv'
const ajv = new Ajv()
const validate = ajv.compile(workoutLogSchema)
```

## Importing Data from Files and APIs

### Reading from a File (Node.js)

```typescript
import { readFile } from 'fs/promises'
import { parseProgram, ParseError, type Program } from '@openweight/sdk'

async function importProgramFromFile(filePath: string): Promise<Program> {
  const json = await readFile(filePath, 'utf-8')
  return parseProgram(json)
}

// Usage
try {
  const program = await importProgramFromFile('./my-program.json')
  console.log(`Imported: ${program.name}`)
  console.log(`Weeks: ${program.weeks.length}`)
} catch (error) {
  if (error instanceof ParseError) {
    console.error('Invalid program file:', error.message)
  }
}
```

### Fetching from an API

```typescript
import { parseProgram, ParseError, type Program } from '@openweight/sdk'

async function fetchProgramFromAPI(url: string): Promise<Program> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  const json = await response.text()
  return parseProgram(json)
}

// Usage - importing a shared program from another openweight-compatible app
try {
  const program = await fetchProgramFromAPI('https://api.example.com/programs/531-bbb')
  console.log(`Fetched: ${program.name}`)

  // The program is now a fully typed Program object
  for (const week of program.weeks) {
    console.log(`  Week: ${week.name ?? 'Unnamed'}`)
    for (const workout of week.workouts) {
      console.log(`    - ${workout.name}`)
    }
  }
} catch (error) {
  if (error instanceof ParseError) {
    console.error('Invalid program data:', error.message)
  }
}
```

### Importing from User Upload (Browser)

```typescript
import { parseWorkoutLog, parseProgram, ParseError } from '@openweight/sdk'

async function handleFileUpload(file: File) {
  const json = await file.text()

  // Try parsing as different types
  try {
    const program = parseProgram(json)
    console.log('Imported program:', program.name)
    return { type: 'program', data: program }
  } catch {
    // Not a program, try workout log
  }

  try {
    const workout = parseWorkoutLog(json)
    console.log('Imported workout:', workout.name ?? workout.date)
    return { type: 'workout', data: workout }
  } catch (error) {
    if (error instanceof ParseError) {
      throw new Error(`Invalid openweight file: ${error.message}`)
    }
    throw error
  }
}
```

## Constructing Objects Programmatically

You can create openweight objects directly in TypeScript without parsing JSON:

### Creating a Program

```typescript
import {
  serializeProgramPretty,
  type Program,
  type ProgramWeek,
  type WorkoutTemplate,
  type ExerciseTemplate,
  type SetTemplate,
} from '@openweight/sdk'

// Build a program step by step
const squatSets: SetTemplate[] = [
  { targetReps: 5, percentage: 65, percentageOf: 'TM' },
  { targetReps: 5, percentage: 75, percentageOf: 'TM' },
  { targetReps: 5, percentage: 85, percentageOf: 'TM', type: 'amrap' },
]

const squatExercise: ExerciseTemplate = {
  exercise: { name: 'Squat', equipment: 'barbell', category: 'legs' },
  sets: squatSets,
}

const squatDay: WorkoutTemplate = {
  name: 'Squat Day',
  exercises: [squatExercise],
}

const week1: ProgramWeek = {
  name: 'Week 1 - 5s',
  workouts: [squatDay],
}

const program: Program = {
  name: 'My 5/3/1 Program',
  description: 'Custom strength program',
  author: 'My Name',
  tags: ['strength', 'powerlifting'],
  weeks: [week1],
}

// Serialize to JSON for storage or export
const json = serializeProgramPretty(program)
console.log(json)
```

### Creating a Workout Log

```typescript
import {
  serializeWorkoutLogPretty,
  type WorkoutLog,
  type ExerciseLog,
  type SetLog,
} from '@openweight/sdk'

// Record a completed workout
const sets: SetLog[] = [
  { reps: 5, weight: 100, unit: 'kg', rpe: 7 },
  { reps: 5, weight: 100, unit: 'kg', rpe: 8 },
  { reps: 5, weight: 100, unit: 'kg', rpe: 8.5 },
]

const squatLog: ExerciseLog = {
  exercise: { name: 'Squat', equipment: 'barbell' },
  sets: sets,
}

const workout: WorkoutLog = {
  date: new Date().toISOString(),
  name: 'Morning Workout',
  exercises: [squatLog],
  durationSeconds: 3600, // 1 hour
}

const json = serializeWorkoutLogPretty(workout)
```

### Helper Function for Building Programs

```typescript
import type { Program, SetTemplate } from '@openweight/sdk'

// Helper to create a simple linear progression program
function createLinearProgram(
  name: string,
  exercises: string[],
  setsPerExercise: number,
  repsPerSet: number,
  weeks: number
): Program {
  return {
    name,
    weeks: Array.from({ length: weeks }, (_, weekIndex) => ({
      name: `Week ${weekIndex + 1}`,
      workouts: [
        {
          name: 'Full Body',
          exercises: exercises.map((exerciseName) => ({
            exercise: { name: exerciseName },
            sets: Array.from({ length: setsPerExercise }, (): SetTemplate => ({
              targetReps: repsPerSet,
            })),
          })),
        },
      ],
    })),
  }
}

// Create a simple 4-week program
const beginnerProgram = createLinearProgram(
  'Beginner Full Body',
  ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press'],
  3,  // 3 sets
  5,  // 5 reps
  4   // 4 weeks
)
```

## Complete Example

```typescript
import {
  parseWorkoutLog,
  validateWorkoutLog,
  serializeWorkoutLogPretty,
  ParseError,
  type WorkoutLog,
} from '@openweight/sdk'

// Parse from JSON
const json = `{
  "date": "2024-01-15T09:30:00Z",
  "name": "Morning Workout",
  "exercises": [
    {
      "exercise": {
        "name": "Barbell Back Squat",
        "equipment": "barbell",
        "category": "legs"
      },
      "sets": [
        { "reps": 5, "weight": 100, "unit": "kg", "rpe": 7 },
        { "reps": 5, "weight": 100, "unit": "kg", "rpe": 8 },
        { "reps": 5, "weight": 100, "unit": "kg", "rpe": 8.5 }
      ]
    }
  ]
}`

try {
  const workout = parseWorkoutLog(json)

  // Access typed data
  console.log(`Workout: ${workout.name}`)
  console.log(`Date: ${workout.date}`)

  for (const ex of workout.exercises) {
    console.log(`\nExercise: ${ex.exercise.name}`)
    for (const set of ex.sets) {
      console.log(`  ${set.reps} reps @ ${set.weight}${set.unit}`)
    }
  }

  // Serialize back to JSON
  const output = serializeWorkoutLogPretty(workout)
  console.log('\nSerialized:', output)

} catch (error) {
  if (error instanceof ParseError) {
    console.error('Invalid workout:', error.message)
  }
}
```

## ESM and CommonJS

The SDK supports both ESM and CommonJS:

```javascript
// ESM
import { parseWorkoutLog } from '@openweight/sdk'

// CommonJS
const { parseWorkoutLog } = require('@openweight/sdk')
```
