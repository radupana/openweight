# Workout Template Examples

Browse example workout templates from simple to complex.

## minimal.json

The smallest valid template — just a name and one exercise.

```json
{
  "name": "Push Day",
  "exercises": [
    {
      "exercise": { "name": "Bench Press" },
      "sets": [
        { "targetReps": 5 },
        { "targetReps": 5 },
        { "targetReps": 5 }
      ]
    }
  ]
}
```

## percentage-based.json

A 5/3/1 style template using percentage-based loading.

```json
{
  "name": "531 Week 1 Squat Day",
  "notes": "Wendler 5/3/1 week 1 - 3x5 at 65/75/85%",
  "exercises": [
    {
      "exercise": {
        "name": "Barbell Back Squat",
        "equipment": "barbell",
        "category": "legs"
      },
      "order": 1,
      "sets": [
        { "type": "warmup", "targetReps": 5, "percentage": 40, "percentageOf": "1RM" },
        { "type": "warmup", "targetReps": 5, "percentage": 50, "percentageOf": "1RM" },
        { "type": "warmup", "targetReps": 3, "percentage": 60, "percentageOf": "1RM" },
        { "type": "working", "targetReps": 5, "percentage": 65, "percentageOf": "1RM", "restSeconds": 180 },
        { "type": "working", "targetReps": 5, "percentage": 75, "percentageOf": "1RM", "restSeconds": 180 },
        { "type": "working", "targetReps": 5, "percentage": 85, "percentageOf": "1RM", "notes": "AMRAP on last set", "restSeconds": 180 }
      ]
    },
    {
      "exercise": {
        "name": "Barbell Back Squat",
        "equipment": "barbell",
        "category": "legs"
      },
      "order": 2,
      "notes": "BBB supplemental - 5x10 at 50%",
      "sets": [
        { "targetReps": 10, "percentage": 50, "percentageOf": "1RM", "restSeconds": 90 },
        { "targetReps": 10, "percentage": 50, "percentageOf": "1RM", "restSeconds": 90 },
        { "targetReps": 10, "percentage": 50, "percentageOf": "1RM", "restSeconds": 90 },
        { "targetReps": 10, "percentage": 50, "percentageOf": "1RM", "restSeconds": 90 },
        { "targetReps": 10, "percentage": 50, "percentageOf": "1RM", "restSeconds": 90 }
      ]
    },
    {
      "exercise": {
        "name": "Leg Curl",
        "equipment": "machine",
        "category": "legs"
      },
      "order": 3,
      "sets": [
        { "targetRepsMin": 10, "targetRepsMax": 15 },
        { "targetRepsMin": 10, "targetRepsMax": 15 },
        { "targetRepsMin": 10, "targetRepsMax": 15 }
      ]
    },
    {
      "exercise": {
        "name": "Ab Wheel Rollout",
        "equipment": "bodyweight",
        "category": "core"
      },
      "order": 4,
      "sets": [
        { "targetRepsMin": 10, "targetRepsMax": 20 },
        { "targetRepsMin": 10, "targetRepsMax": 20 },
        { "targetRepsMin": 10, "targetRepsMax": 20 }
      ]
    }
  ]
}
```

Key features shown:
- **Percentage-based loading**: `percentage` + `percentageOf` (e.g., 85% of 1RM)
- **Rep ranges**: `targetRepsMin` and `targetRepsMax` for hypertrophy accessories
- **Set types**: `warmup` vs `working` sets
- **Rest periods**: `restSeconds` for each set
- **Exercise ordering**: `order` field for explicit sequencing

## Rep Ranges

Use rep ranges for flexible programming:

```json
{
  "name": "Hypertrophy Day",
  "exercises": [
    {
      "exercise": { "name": "Lat Pulldown" },
      "sets": [
        { "targetRepsMin": 8, "targetRepsMax": 12, "targetRPE": 8 },
        { "targetRepsMin": 8, "targetRepsMax": 12, "targetRPE": 8 },
        { "targetRepsMin": 8, "targetRepsMax": 12, "targetRPE": 9 }
      ]
    }
  ]
}
```

## Absolute Weights

For fixed-weight templates:

```json
{
  "name": "Fixed Weight Day",
  "exercises": [
    {
      "exercise": { "name": "Bench Press" },
      "sets": [
        { "targetReps": 5, "targetWeight": 100, "unit": "kg" },
        { "targetReps": 5, "targetWeight": 100, "unit": "kg" },
        { "targetReps": 5, "targetWeight": 100, "unit": "kg" }
      ]
    }
  ]
}
```

## More Examples

See all template examples in the [GitHub repository](https://github.com/radupana/openweight/tree/main/examples/workout-templates).
