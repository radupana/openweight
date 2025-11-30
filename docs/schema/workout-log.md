# WorkoutLog Schema

A **WorkoutLog** represents a completed strength training session with actual performance data.

## Interactive Explorer

<SchemaExplorer
  schema-url="schemas/workout-log.schema.json"
  title="WorkoutLog Schema"
  :initial-expansion-level="2"
/>

## Top-Level Properties

| Field             | Type               | Required | Description                                         |
|-------------------|--------------------|----------|-----------------------------------------------------|
| `date`            | string (date-time) | Yes      | When the workout occurred (ISO 8601 with timezone)  |
| `exercises`       | ExerciseLog[]      | Yes      | The exercises performed                             |
| `name`            | string             | No       | User-defined workout name (max 200 chars)           |
| `notes`           | string             | No       | Free-form session notes (max 10,000 chars)          |
| `durationSeconds` | integer            | No       | Total workout duration in seconds                   |
| `templateId`      | string             | No       | Reference to the template this log was created from |

## ExerciseLog

A single exercise performed within a workout.

| Field        | Type     | Required | Description                     |
|--------------|----------|----------|---------------------------------|
| `exercise`   | Exercise | Yes      | Which exercise was performed    |
| `sets`       | SetLog[] | Yes      | The sets performed (min 1)      |
| `order`      | integer  | No       | Position in workout (1-indexed) |
| `notes`      | string   | No       | Notes specific to this exercise |
| `supersetId` | integer  | No       | Groups exercises into supersets |

## Exercise

Describes which exercise was performed.

| Field           | Type     | Required | Description                                |
|-----------------|----------|----------|--------------------------------------------|
| `name`          | string   | Yes      | Human-readable exercise name (1-200 chars) |
| `equipment`     | string   | No       | Equipment used (see recommended values)    |
| `category`      | string   | No       | Body part or category                      |
| `musclesWorked` | string[] | No       | Specific muscles targeted                  |

### Recommended Equipment Values

`barbell`, `dumbbell`, `kettlebell`, `cable`, `machine`, `bodyweight`, `ez-bar`, `trap-bar`, `smith-machine`,
`resistance-band`, `suspension`

### Recommended Category Values

`chest`, `back`, `shoulders`, `arms`, `legs`, `core`, `full-body`, `olympic`, `cardio`

## SetLog

A single set within an exercise.

| Field             | Type                                | Required    | Description                                |
|-------------------|-------------------------------------|-------------|--------------------------------------------|
| `reps`            | integer                             | No          | Repetitions completed (0 = failed attempt) |
| `weight`          | number                              | No          | Weight used                                |
| `unit`            | "kg" \| "lb"                        | Conditional | Required if weight is present              |
| `durationSeconds` | integer                             | No          | Time for timed exercises                   |
| `distance`        | number                              | No          | Distance for carries, sled work            |
| `distanceUnit`    | "m" \| "km" \| "ft" \| "mi" \| "yd" | Conditional | Required if distance is present            |
| `rpe`             | number (0-10)                       | No          | Rate of Perceived Exertion                 |
| `rir`             | integer                             | No          | Reps In Reserve                            |
| `toFailure`       | boolean                             | No          | Whether the set was taken to failure       |
| `type`            | string                              | No          | Set type (default: "working")              |
| `restSeconds`     | integer                             | No          | Rest taken after this set                  |
| `tempo`           | string                              | No          | Tempo notation (e.g., "3-1-2-0")           |
| `notes`           | string                              | No          | Notes for this specific set                |

### Recommended Set Types

`working`, `warmup`, `dropset`, `backoff`, `amrap`, `cluster`, `myo`, `rest-pause`, `failure`

### Tempo Pattern

Tempo must match the pattern: `eccentric-pause-concentric-pause`

Examples: `3-1-2-0`, `4-0-1-0`, `2-0-X-0` (X = explosive)

## Conditional Validation

The schema enforces these rules:

1. If `weight` is present, `unit` must also be present
2. If `distance` is present, `distanceUnit` must also be present

## Example

```json
{
  "date": "2024-01-15T09:30:00Z",
  "name": "Push Day",
  "durationSeconds": 3600,
  "exercises": [
    {
      "exercise": {
        "name": "Barbell Bench Press",
        "equipment": "barbell",
        "category": "chest"
      },
      "sets": [
        {
          "reps": 5,
          "weight": 100,
          "unit": "kg",
          "rpe": 7
        },
        {
          "reps": 5,
          "weight": 100,
          "unit": "kg",
          "rpe": 7.5
        },
        {
          "reps": 5,
          "weight": 100,
          "unit": "kg",
          "rpe": 8
        }
      ]
    },
    {
      "exercise": {
        "name": "Incline Dumbbell Press",
        "equipment": "dumbbell",
        "category": "chest"
      },
      "sets": [
        {
          "reps": 10,
          "weight": 30,
          "unit": "kg"
        },
        {
          "reps": 10,
          "weight": 30,
          "unit": "kg"
        },
        {
          "reps": 8,
          "weight": 30,
          "unit": "kg"
        }
      ]
    }
  ],
  "notes": "Felt strong today. Bench press moving well."
}
```

## Full Schema

::: details Click to expand full JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openweight.org/schemas/workout-log.schema.json",
  "title": "WorkoutLog",
  "description": "A completed strength training session",
  "type": "object",
  "required": [
    "date",
    "exercises"
  ],
  "additionalProperties": true
}
```

See the [full schema on GitHub](https://github.com/radupana/openweight/blob/main/schemas/workout-log.schema.json).
:::
