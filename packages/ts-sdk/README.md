# @openweight/sdk

TypeScript SDK for [openweight](https://github.com/radupana/openweight) — the open data format for strength training.

## Installation

```bash
npm install @openweight/sdk
```

## Usage

### Parsing

```typescript
import { parseWorkoutLog, parseWorkoutTemplate, parseProgram, parsePersonalRecords } from '@openweight/sdk'

const workout = parseWorkoutLog(jsonString)
const template = parseWorkoutTemplate(jsonString)
const program = parseProgram(jsonString)
const records = parsePersonalRecords(jsonString)
```

### Validating

```typescript
import { validateWorkoutLog, isValidWorkoutLog, validatePersonalRecords } from '@openweight/sdk'

// Get detailed validation result
const result = validateWorkoutLog(data)
if (!result.valid) {
  console.log(result.errors)
}

// Type guard for unknown data
if (isValidWorkoutLog(data)) {
  // data is now typed as WorkoutLog
}

// Validate personal records
const prResult = validatePersonalRecords(data)
```

### Serializing

```typescript
import { serializeWorkoutLog, serializeWorkoutLogPretty, serializePersonalRecords } from '@openweight/sdk'

const json = serializeWorkoutLog(workout)        // Compact
const pretty = serializeWorkoutLogPretty(workout) // Formatted
const prJson = serializePersonalRecords(records)
```

### Types

```typescript
import type {
  WorkoutLog, ExerciseLog, Exercise, SetLog,
  WorkoutTemplate, ExerciseTemplate, SetTemplate,
  Program, ProgramWeek,
  PersonalRecords, ExerciseRecord, RepMax, Estimated1RM, VolumePR, DurationPR,
  Athlete, NormalizedScores, LiftScores,
} from '@openweight/sdk'
```

## API

### Parse Functions

| Function | Description |
|----------|-------------|
| `parseWorkoutLog(json)` | Parse JSON to `WorkoutLog` |
| `parseWorkoutTemplate(json)` | Parse JSON to `WorkoutTemplate` |
| `parseProgram(json)` | Parse JSON to `Program` |
| `parsePersonalRecords(json)` | Parse JSON to `PersonalRecords` |

### Validate Functions

| Function | Description |
|----------|-------------|
| `validateWorkoutLog(data)` | Validate against schema. Returns `{ valid, errors }` |
| `validateWorkoutTemplate(data)` | Validate against schema |
| `validateProgram(data)` | Validate against schema |
| `validatePersonalRecords(data)` | Validate against schema |
| `isValidWorkoutLog(data)` | Type guard, returns `boolean` |
| `isValidWorkoutTemplate(data)` | Type guard |
| `isValidProgram(data)` | Type guard |
| `isValidPersonalRecords(data)` | Type guard |

### Serialize Functions

| Function | Description |
|----------|-------------|
| `serializeWorkoutLog(data)` | Serialize to compact JSON |
| `serializeWorkoutLogPretty(data)` | Serialize to formatted JSON |
| `serializeWorkoutTemplate(data)` | Serialize to compact JSON |
| `serializeWorkoutTemplatePretty(data)` | Serialize to formatted JSON |
| `serializeProgram(data)` | Serialize to compact JSON |
| `serializeProgramPretty(data)` | Serialize to formatted JSON |
| `serializePersonalRecords(data)` | Serialize to compact JSON |
| `serializePersonalRecordsPretty(data)` | Serialize to formatted JSON |

### Types

| Type | Description |
|------|-------------|
| `WorkoutLog` | A completed workout session |
| `WorkoutTemplate` | A planned workout prescription |
| `Program` | A multi-week training program |
| `PersonalRecords` | Personal records export (1RMs, PRs) |
| `ExerciseRecord` | PRs for a single exercise |
| `RepMax` | A rep max record (1RM, 3RM, etc.) |
| `Estimated1RM` | Calculated e1RM with formula metadata |
| `VolumePR` | Volume personal record |
| `DurationPR` | Duration personal record |
| `WeightUnit` | `'kg' \| 'lb'` |
| `DistanceUnit` | `'m' \| 'km' \| 'ft' \| 'mi' \| 'yd'` |

## License

Apache-2.0
