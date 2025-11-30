# Program Examples

Browse example training programs from simple to complex.

## minimal.json

The smallest valid program — one week with two workouts.

```json
{
  "name": "Simple 2-Day Split",
  "weeks": [
    {
      "workouts": [
        {
          "name": "Workout A",
          "exercises": [
            {
              "exercise": { "name": "Squat" },
              "sets": [
                { "targetReps": 5 },
                { "targetReps": 5 },
                { "targetReps": 5 }
              ]
            },
            {
              "exercise": { "name": "Bench Press" },
              "sets": [
                { "targetReps": 5 },
                { "targetReps": 5 },
                { "targetReps": 5 }
              ]
            }
          ]
        },
        {
          "name": "Workout B",
          "exercises": [
            {
              "exercise": { "name": "Deadlift" },
              "sets": [
                { "targetReps": 5 },
                { "targetReps": 5 },
                { "targetReps": 5 }
              ]
            },
            {
              "exercise": { "name": "Overhead Press" },
              "sets": [
                { "targetReps": 5 },
                { "targetReps": 5 },
                { "targetReps": 5 }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## 531-bbb.json (5/3/1 Boring But Big)

A complete 4-week mesocycle with percentage-based loading. This example shows:
- **Weekly progression**: Week 1 (5s), Week 2 (3s), Week 3 (5/3/1), Week 4 (Deload)
- **Percentage-based loading**: All weights relative to Training Max
- **AMRAP sets**: Final working set each week
- **BBB accessory work**: 5x10 at lighter percentages

```json
{
  "name": "5/3/1 Boring But Big - Squat Focus",
  "description": "Jim Wendler's 5/3/1 with BBB accessory template",
  "author": "Jim Wendler",
  "tags": ["strength", "intermediate", "4-week", "531"],
  "weeks": [
    {
      "name": "Week 1 - 5s",
      "workouts": [
        {
          "name": "Squat Day",
          "exercises": [
            {
              "exercise": { "name": "Squat", "equipment": "barbell" },
              "sets": [
                { "percentage": 65, "percentageOf": "TM", "targetReps": 5 },
                { "percentage": 75, "percentageOf": "TM", "targetReps": 5 },
                { "percentage": 85, "percentageOf": "TM", "targetReps": 5, "type": "amrap" }
              ]
            },
            {
              "exercise": { "name": "Squat" },
              "notes": "BBB 5x10",
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
      ]
    },
    {
      "name": "Week 2 - 3s",
      "workouts": [
        {
          "name": "Squat Day",
          "exercises": [
            {
              "exercise": { "name": "Squat", "equipment": "barbell" },
              "sets": [
                { "percentage": 70, "percentageOf": "TM", "targetReps": 3 },
                { "percentage": 80, "percentageOf": "TM", "targetReps": 3 },
                { "percentage": 90, "percentageOf": "TM", "targetReps": 3, "type": "amrap" }
              ]
            },
            {
              "exercise": { "name": "Squat" },
              "notes": "BBB 5x10",
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
      ]
    },
    {
      "name": "Week 3 - 5/3/1",
      "workouts": [
        {
          "name": "Squat Day",
          "exercises": [
            {
              "exercise": { "name": "Squat", "equipment": "barbell" },
              "sets": [
                { "percentage": 75, "percentageOf": "TM", "targetReps": 5 },
                { "percentage": 85, "percentageOf": "TM", "targetReps": 3 },
                { "percentage": 95, "percentageOf": "TM", "targetReps": 1, "type": "amrap" }
              ]
            },
            {
              "exercise": { "name": "Squat" },
              "notes": "BBB 5x10",
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
      ]
    },
    {
      "name": "Week 4 - Deload",
      "notes": "Reduce intensity, focus on recovery",
      "workouts": [
        {
          "name": "Squat Day",
          "exercises": [
            {
              "exercise": { "name": "Squat", "equipment": "barbell" },
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

## Program Metadata

Programs support rich metadata:

```json
{
  "name": "My Custom Program",
  "description": "A 6-week hypertrophy block",
  "author": "Coach Smith",
  "tags": ["hypertrophy", "intermediate", "6-week", "upper-lower"],
  "weeks": [...]
}
```

## More Examples

See all program examples in the [GitHub repository](https://github.com/radupana/openweight/tree/main/examples/programs).
