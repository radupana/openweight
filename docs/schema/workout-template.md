# WorkoutTemplate Schema

A **WorkoutTemplate** represents a planned workout with target reps, weights, and intensity prescriptions.

## Interactive Explorer

<SchemaExplorer
  schema-url="schemas/workout-template.schema.json"
  title="WorkoutTemplate Schema"
  :initial-expansion-level="2"
/>

## Top-Level Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Template name (1-200 chars) |
| `exercises` | ExerciseTemplate[] | Yes | The exercises to perform (min 1) |
| `notes` | string | No | Notes about this template |
| `day` | integer (1-7) | No | Day of week (1=Monday, 7=Sunday) |

## ExerciseTemplate

A single exercise prescription within a template.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `exercise` | Exercise | Yes | Which exercise to perform |
| `sets` | SetTemplate[] | Yes | The sets to perform (min 1) |
| `order` | integer | No | Position in workout (1-indexed) |
| `notes` | string | No | Notes specific to this exercise |
| `supersetId` | integer | No | Groups exercises into supersets |
| `restSeconds` | integer | No | Recommended rest between sets |

## Exercise

Same structure as in WorkoutLog:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Human-readable exercise name |
| `equipment` | string | No | Equipment used |
| `category` | string | No | Body part or category |
| `musclesWorked` | string[] | No | Specific muscles targeted |

## SetTemplate

Prescribes what to do in a set.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `targetReps` | integer | No | Exact target rep count |
| `targetRepsMin` | integer | No | Minimum reps in range |
| `targetRepsMax` | integer | No | Maximum reps in range |
| `targetWeight` | number | No | Absolute weight target |
| `unit` | "kg" \| "lb" | Conditional | Required if targetWeight is present |
| `percentage` | number (0-100) | No | Percentage of reference |
| `percentageOf` | string | Conditional | Reference for percentage (e.g., "1RM") |
| `targetRPE` | number (0-10) | No | Target RPE |
| `targetRIR` | integer | No | Target Reps In Reserve |
| `type` | string | No | Set type (default: "working") |
| `rest` | integer | No | Rest after this set (seconds) |
| `tempo` | string | No | Tempo notation |
| `notes` | string | No | Notes for this set |

## Conditional Validation

The schema enforces:

1. If `targetWeight` is present, `unit` must also be present
2. If `percentage` is present, `percentageOf` must also be present

## Rep Ranges

Use `targetRepsMin` and `targetRepsMax` for rep ranges:

```json
{
  "targetRepsMin": 8,
  "targetRepsMax": 12
}
```

Or use `targetReps` for an exact count:

```json
{
  "targetReps": 5
}
```

## Percentage-Based Loading

For percentage-based programs (like 5/3/1):

```json
{
  "percentage": 85,
  "percentageOf": "1RM",
  "targetReps": 5
}
```

Common `percentageOf` values: `1RM`, `TM` (Training Max), `E1RM` (Estimated 1RM)

## Example

```json
{
  "name": "Squat Day",
  "day": 1,
  "exercises": [
    {
      "exercise": {
        "name": "Barbell Back Squat",
        "equipment": "barbell",
        "category": "legs"
      },
      "restSeconds": 180,
      "sets": [
        { "percentage": 65, "percentageOf": "TM", "targetReps": 5, "type": "warmup" },
        { "percentage": 75, "percentageOf": "TM", "targetReps": 5 },
        { "percentage": 85, "percentageOf": "TM", "targetReps": 5 },
        { "percentage": 85, "percentageOf": "TM", "targetReps": 5, "type": "amrap" }
      ]
    },
    {
      "exercise": {
        "name": "Barbell Back Squat",
        "equipment": "barbell"
      },
      "notes": "BBB sets",
      "sets": [
        { "percentage": 50, "percentageOf": "TM", "targetReps": 10 },
        { "percentage": 50, "percentageOf": "TM", "targetReps": 10 },
        { "percentage": 50, "percentageOf": "TM", "targetReps": 10 },
        { "percentage": 50, "percentageOf": "TM", "targetReps": 10 },
        { "percentage": 50, "percentageOf": "TM", "targetReps": 10 }
      ]
    }
  ]
}
```

## Full Schema

::: details Click to expand full JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openweight.org/schemas/workout-template.schema.json",
  "title": "WorkoutTemplate",
  "description": "A planned workout with prescribed exercises and sets",
  "type": "object",
  "required": ["name", "exercises"],
  "additionalProperties": true
}
```
See the [full schema on GitHub](https://github.com/radupana/openweight/blob/main/schemas/workout-template.schema.json).
:::
