# Program Schema

A **Program** represents a multi-week training program containing workout templates organized by week.

## Top-Level Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Program name (1-200 chars) |
| `weeks` | ProgramWeek[] | Yes | The weeks in the program (min 1) |
| `description` | string | No | Program description |
| `author` | string | No | Program author |
| `tags` | string[] | No | Tags for categorization |

## ProgramWeek

A single week within a program.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `workouts` | WorkoutTemplate[] | Yes | Workouts for this week (min 1) |
| `name` | string | No | Week name (e.g., "Week 1", "Deload") |
| `notes` | string | No | Notes for this week |

Each workout in `workouts` follows the full [WorkoutTemplate](/schema/workout-template) schema.

## Schema References

The Program schema uses JSON Schema `$ref` to include the WorkoutTemplate schema:

```json
{
  "workouts": {
    "type": "array",
    "items": {
      "$ref": "workout-template.schema.json"
    }
  }
}
```

This means a Program embeds complete WorkoutTemplate objects, not just references.

## Example: Simple Program

```json
{
  "name": "Simple Strength",
  "description": "A basic 3-day strength program",
  "author": "Coach Smith",
  "tags": ["strength", "beginner", "3-day"],
  "weeks": [
    {
      "name": "Week 1",
      "workouts": [
        {
          "name": "Day A - Squat",
          "day": 1,
          "exercises": [
            {
              "exercise": { "name": "Squat" },
              "sets": [
                { "targetReps": 5, "targetWeight": 100, "unit": "kg" }
              ]
            }
          ]
        },
        {
          "name": "Day B - Bench",
          "day": 3,
          "exercises": [
            {
              "exercise": { "name": "Bench Press" },
              "sets": [
                { "targetReps": 5, "targetWeight": 80, "unit": "kg" }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Example: 5/3/1 BBB (4 Weeks)

A complete 4-week program with percentage-based loading:

```json
{
  "name": "5/3/1 Boring But Big",
  "description": "Jim Wendler's 5/3/1 with BBB assistance",
  "author": "Jim Wendler",
  "tags": ["strength", "intermediate", "4-day", "531"],
  "weeks": [
    {
      "name": "Week 1 - 5s",
      "workouts": [
        {
          "name": "Squat Day",
          "exercises": [
            {
              "exercise": { "name": "Squat" },
              "sets": [
                { "percentage": 65, "percentageOf": "TM", "targetReps": 5 },
                { "percentage": 75, "percentageOf": "TM", "targetReps": 5 },
                { "percentage": 85, "percentageOf": "TM", "targetReps": 5, "type": "amrap" }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "Week 2 - 3s",
      "workouts": [
        {
          "name": "Squat Day",
          "exercises": [
            {
              "exercise": { "name": "Squat" },
              "sets": [
                { "percentage": 70, "percentageOf": "TM", "targetReps": 3 },
                { "percentage": 80, "percentageOf": "TM", "targetReps": 3 },
                { "percentage": 90, "percentageOf": "TM", "targetReps": 3, "type": "amrap" }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "Week 3 - 5/3/1",
      "workouts": [
        {
          "name": "Squat Day",
          "exercises": [
            {
              "exercise": { "name": "Squat" },
              "sets": [
                { "percentage": 75, "percentageOf": "TM", "targetReps": 5 },
                { "percentage": 85, "percentageOf": "TM", "targetReps": 3 },
                { "percentage": 95, "percentageOf": "TM", "targetReps": 1, "type": "amrap" }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "Week 4 - Deload",
      "notes": "Reduce volume, focus on recovery",
      "workouts": [
        {
          "name": "Squat Day",
          "exercises": [
            {
              "exercise": { "name": "Squat" },
              "sets": [
                { "percentage": 40, "percentageOf": "TM", "targetReps": 5 },
                { "percentage": 50, "percentageOf": "TM", "targetReps": 5 },
                { "percentage": 60, "percentageOf": "TM", "targetReps": 5 }
              ]
            }
          ]
        }
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
  "$id": "https://openweight.org/schemas/program.schema.json",
  "title": "Program",
  "description": "A multi-week training program",
  "type": "object",
  "required": ["name", "weeks"],
  "additionalProperties": true
}
```
See the [full schema on GitHub](https://github.com/radupana/openweight/blob/main/schemas/program.schema.json).
:::
