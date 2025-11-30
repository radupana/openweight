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
  // Personal Records
  PersonalRecords,
  ExerciseRecord,
  RepMax,
  Estimated1RM,
  VolumePR,
  DurationPR,
  Athlete,
  NormalizedScores,
  LiftScores,
  // Enums
  WeightUnit,
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
  parsePersonalRecords
} from '@openweight/sdk'

const workout = parseWorkoutLog(jsonString)
const template = parseWorkoutTemplate(jsonString)
const program = parseProgram(jsonString)
const records = parsePersonalRecords(jsonString)
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
  isValidPersonalRecords
} from '@openweight/sdk'

if (isValidWorkoutLog(data)) {
  // TypeScript knows data is WorkoutLog
  console.log(data.date)
}

if (isValidPersonalRecords(data)) {
  // TypeScript knows data is PersonalRecords
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
  validatePersonalRecords
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

// Same pattern for personal records
const prResult = validatePersonalRecords(data)
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
  serializePersonalRecords,
  serializePersonalRecordsPretty,
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
  personalRecordsSchema
} from '@openweight/sdk'

// Use with your own AJV instance
import Ajv from 'ajv'
const ajv = new Ajv()
const validate = ajv.compile(workoutLogSchema)
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
