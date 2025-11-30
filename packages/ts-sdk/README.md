# @openweight/sdk

TypeScript SDK for [openweight](https://github.com/radupana/openweight) — the open data format for strength training.

## Installation

```bash
npm install @openweight/sdk
```

## Usage

### Parsing workout logs

```typescript
import { parseWorkoutLog } from '@openweight/sdk'

const json = `{
  "date": "2024-01-15T09:00:00Z",
  "exercises": [
    {
      "exercise": { "name": "Squat" },
      "sets": [{ "reps": 5, "weight": 100, "unit": "kg" }]
    }
  ]
}`

const workout = parseWorkoutLog(json)
console.log(workout.exercises[0].exercise.name) // "Squat"
```

### Validating data

```typescript
import { validateWorkoutLog, isValidWorkoutLog } from '@openweight/sdk'

// Get detailed validation result
const result = validateWorkoutLog(data)
if (!result.valid) {
  console.log(result.errors)
}

// Type guard for unknown data
if (isValidWorkoutLog(data)) {
  // data is now typed as WorkoutLog
}
```

### Serializing workout logs

```typescript
import { serializeWorkoutLog, serializeWorkoutLogPretty } from '@openweight/sdk'

const json = serializeWorkoutLog(workout)        // Compact
const pretty = serializeWorkoutLogPretty(workout) // Formatted
```

### Types

```typescript
import type { WorkoutLog, ExerciseLog, Exercise, SetLog } from '@openweight/sdk'
```

## API

### Functions

| Function | Description |
|----------|-------------|
| `parseWorkoutLog(json: string)` | Parse JSON string to `WorkoutLog`. Throws `ParseError` on failure. |
| `validateWorkoutLog(data: unknown)` | Validate data against schema. Returns `{ valid, errors }`. |
| `isValidWorkoutLog(data: unknown)` | Type guard. Returns `true` if valid. |
| `serializeWorkoutLog(workout)` | Serialize to compact JSON string. |
| `serializeWorkoutLogPretty(workout)` | Serialize to formatted JSON string. |

### Types

| Type | Description |
|------|-------------|
| `WorkoutLog` | A completed strength training session |
| `ExerciseLog` | An exercise performed within a workout |
| `Exercise` | Exercise definition (name, equipment, etc.) |
| `SetLog` | A single set (reps, weight, RPE, etc.) |
| `WeightUnit` | `'kg' \| 'lb'` |
| `DistanceUnit` | `'m' \| 'km' \| 'ft' \| 'mi' \| 'yd'` |

## Releasing

1. Update version: `npm run version:patch` (or `version:minor` / `version:major`)
2. Commit: `git commit -am "chore: release @openweight/sdk vX.Y.Z"`
3. Push to main
4. Create a GitHub Release with a tag matching the version (e.g., `v0.2.0`)
5. The publish workflow will automatically publish to npm with provenance

## License

Apache-2.0
