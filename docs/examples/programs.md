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
- **Weekly progression**: Week 1 (3x5), Week 2 (3x3), Week 3 (5/3/1), Week 4 (Deload)
- **Percentage-based loading**: All weights relative to 1RM
- **AMRAP sets**: Final working set each week
- **BBB accessory work**: 5x10 at lighter percentages

The full example in the repo includes all four main lifts per week. Here's a condensed excerpt showing the squat day from Week 1:

```json
{
  "name": "5/3/1 Boring But Big",
  "description": "Jim Wendler's 5/3/1 program with Boring But Big supplemental work. A 4-week cycle focusing on the four main lifts with 5x10 volume work.",
  "author": "Jim Wendler",
  "tags": ["strength", "powerlifting", "intermediate"],
  "weeks": [
    {
      "name": "Week 1 - 3x5",
      "notes": "Working sets at 65%, 75%, 85% of training max",
      "workouts": [
        {
          "name": "Squat Day",
          "day": 1,
          "exercises": [
            {
              "exercise": { "name": "Barbell Back Squat", "equipment": "barbell", "category": "legs" },
              "order": 1,
              "sets": [
                { "type": "working", "targetReps": 5, "percentage": 65, "percentageOf": "1RM", "restSeconds": 180 },
                { "type": "working", "targetReps": 5, "percentage": 75, "percentageOf": "1RM", "restSeconds": 180 },
                { "type": "working", "targetReps": 5, "percentage": 85, "percentageOf": "1RM", "notes": "AMRAP", "restSeconds": 180 }
              ]
            },
            {
              "exercise": { "name": "Barbell Back Squat", "equipment": "barbell", "category": "legs" },
              "order": 2,
              "notes": "BBB sets",
              "sets": [
                { "targetReps": 10, "percentage": 50, "percentageOf": "1RM", "restSeconds": 90 },
                { "targetReps": 10, "percentage": 50, "percentageOf": "1RM", "restSeconds": 90 },
                { "targetReps": 10, "percentage": 50, "percentageOf": "1RM", "restSeconds": 90 },
                { "targetReps": 10, "percentage": 50, "percentageOf": "1RM", "restSeconds": 90 },
                { "targetReps": 10, "percentage": 50, "percentageOf": "1RM", "restSeconds": 90 }
              ]
            },
            {
              "exercise": { "name": "Leg Curl", "equipment": "machine", "category": "legs" },
              "order": 3,
              "sets": [
                { "targetRepsMin": 10, "targetRepsMax": 15 },
                { "targetRepsMin": 10, "targetRepsMax": 15 },
                { "targetRepsMin": 10, "targetRepsMax": 15 }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

See the [full 531-bbb.json on GitHub](https://github.com/radupana/openweight/blob/main/examples/programs/531-bbb.json) for all four weeks and all four lifts.

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
