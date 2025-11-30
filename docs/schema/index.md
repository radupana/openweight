# Schema Overview

openweight defines three JSON Schemas that together describe the full lifecycle of strength training data.

## Schemas

| Schema                                      | Purpose                       | Status |
|---------------------------------------------|-------------------------------|--------|
| [WorkoutLog](/schema/workout-log)           | Completed workout sessions    | Stable |
| [WorkoutTemplate](/schema/workout-template) | Planned workout prescriptions | Stable |
| [Program](/schema/program)                  | Multi-week training programs  | Stable |

## JSON Schema Version

All schemas use **JSON Schema draft-07** for maximum compatibility with validation libraries.

## Schema IDs

Each schema has a canonical `$id` for reference resolution:

| Schema          | $id                                                           |
|-----------------|---------------------------------------------------------------|
| WorkoutLog      | `https://openweight.org/schemas/workout-log.schema.json`      |
| WorkoutTemplate | `https://openweight.org/schemas/workout-template.schema.json` |
| Program         | `https://openweight.org/schemas/program.schema.json`          |

## Relationships

```
Program
  └── references → WorkoutTemplate (via $ref)

WorkoutLog
  └── optionally links to → WorkoutTemplate (via templateId)
```

A Program contains an array of weeks, each containing WorkoutTemplate objects (embedded via JSON Schema `$ref`).

A WorkoutLog can optionally reference the template it was created from using `templateId`, but this is informational
only — the log stands alone as a complete record.

## Extensibility

All schemas set `additionalProperties: true`, allowing apps to store custom fields:

```json
{
  "date": "2024-01-15T09:30:00Z",
  "exercises": [
    ...
  ],
  "myapp:notes": "Felt strong today"
}
```

Use a namespaced prefix (e.g., `myapp:`) to avoid conflicts with future schema versions.

## Validation

### TypeScript

```typescript
import {validateWorkoutLog} from '@openweight/sdk'

const result = validateWorkoutLog(data)
if (!result.valid) {
    console.log(result.errors)
}
```

### Kotlin

```kotlin
import com.openweight.validateWorkoutLog

val result = validateWorkoutLog(jsonElement)
if (!result.valid) {
    result.errors.forEach { println(it) }
}
```

## Raw Schema Files

The canonical schema files are available in the repository:

- [workout-log.schema.json](https://github.com/radupana/openweight/blob/main/schemas/workout-log.schema.json)
- [workout-template.schema.json](https://github.com/radupana/openweight/blob/main/schemas/workout-template.schema.json)
- [program.schema.json](https://github.com/radupana/openweight/blob/main/schemas/program.schema.json)
