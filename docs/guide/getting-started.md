# Getting Started

This guide will help you get up and running with openweight in minutes.

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

## Parse a Workout Log

```typescript
import { parseWorkoutLog } from '@openweight/sdk'

const json = `{
  "date": "2024-01-15T09:30:00Z",
  "exercises": [
    {
      "exercise": { "name": "Squat" },
      "sets": [
        { "reps": 5, "weight": 100, "unit": "kg" }
      ]
    }
  ]
}`

const workout = parseWorkoutLog(json)
console.log(workout.exercises[0].exercise.name) // "Squat"
```

## Validate Data

```typescript
import { validateWorkoutLog, isValidWorkoutLog } from '@openweight/sdk'

const data = {
  date: '2024-01-15T09:30:00Z',
  exercises: [
    {
      exercise: { name: 'Bench Press' },
      sets: [{ reps: 8, weight: 60, unit: 'kg' }]
    }
  ]
}

// Type guard
if (isValidWorkoutLog(data)) {
  console.log('Valid workout!')
}

// Detailed validation
const result = validateWorkoutLog(data)
if (!result.valid) {
  console.log(result.errors)
}
```

## Serialize to JSON

```typescript
import { serializeWorkoutLog, serializeWorkoutLogPretty } from '@openweight/sdk'

const workout = {
  date: '2024-01-15T09:30:00Z',
  exercises: [
    {
      exercise: { name: 'Deadlift' },
      sets: [{ reps: 5, weight: 140, unit: 'kg' }]
    }
  ]
}

// Compact JSON (for storage/transmission)
const compact = serializeWorkoutLog(workout)

// Pretty JSON (for display/debugging)
const pretty = serializeWorkoutLogPretty(workout)
```

## Kotlin SDK

For Android/JVM projects, see the [Kotlin SDK documentation](/sdk/kotlin).

## Next Steps

- [Core Concepts](/guide/concepts) — Understand the data model
- [Schema Reference](/schema/) — Full schema specification
- [Examples](/examples/) — Browse example workout files
