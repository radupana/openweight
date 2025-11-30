# Workout Log Examples

Browse example workout logs from simple to complex.

## minimal.json

The smallest valid workout log — just a date and one exercise with one set.

```json
{
  "date": "2024-01-15T10:00:00Z",
  "exercises": [
    {
      "exercise": { "name": "Squat" },
      "sets": [{ "reps": 5 }]
    }
  ]
}
```

## simple-strength.json

A typical strength training session with warmup sets and RPE tracking.

```json
{
  "date": "2024-01-16T08:00:00Z",
  "name": "Squat Day",
  "durationSeconds": 4200,
  "exercises": [
    {
      "exercise": {
        "name": "Barbell Back Squat",
        "equipment": "barbell",
        "category": "legs"
      },
      "sets": [
        { "reps": 5, "weight": 60, "unit": "kg", "type": "warmup" },
        { "reps": 5, "weight": 80, "unit": "kg", "type": "warmup" },
        { "reps": 5, "weight": 100, "unit": "kg", "rpe": 7 },
        { "reps": 5, "weight": 100, "unit": "kg", "rpe": 7.5 },
        { "reps": 5, "weight": 100, "unit": "kg", "rpe": 8 }
      ]
    },
    {
      "exercise": {
        "name": "Romanian Deadlift",
        "equipment": "barbell",
        "category": "legs"
      },
      "sets": [
        { "reps": 8, "weight": 80, "unit": "kg", "rpe": 7 },
        { "reps": 8, "weight": 80, "unit": "kg", "rpe": 7.5 },
        { "reps": 8, "weight": 80, "unit": "kg", "rpe": 8 }
      ]
    },
    {
      "exercise": {
        "name": "Leg Press",
        "equipment": "machine",
        "category": "legs"
      },
      "sets": [
        { "reps": 10, "weight": 180, "unit": "kg", "rpe": 8 },
        { "reps": 10, "weight": 180, "unit": "kg", "rpe": 8.5 },
        { "reps": 10, "weight": 180, "unit": "kg", "rpe": 9 }
      ]
    }
  ]
}
```

## bodyweight-workout.json

A workout without any weight — no `weight` or `unit` fields needed.

```json
{
  "date": "2024-01-17T07:00:00Z",
  "name": "Bodyweight Circuit",
  "exercises": [
    {
      "exercise": {
        "name": "Pull-up",
        "equipment": "bodyweight",
        "category": "back"
      },
      "sets": [
        { "reps": 10 },
        { "reps": 8 },
        { "reps": 6 }
      ]
    },
    {
      "exercise": {
        "name": "Push-up",
        "equipment": "bodyweight",
        "category": "chest"
      },
      "sets": [
        { "reps": 20 },
        { "reps": 18 },
        { "reps": 15 }
      ]
    }
  ]
}
```

## timed-exercises.json

Exercises measured by duration instead of reps — using `durationSeconds`.

```json
{
  "date": "2024-01-18T12:00:00Z",
  "name": "Core & Isometrics",
  "exercises": [
    {
      "exercise": {
        "name": "Plank",
        "equipment": "bodyweight",
        "category": "core"
      },
      "sets": [
        { "durationSeconds": 60 },
        { "durationSeconds": 45 },
        { "durationSeconds": 30 }
      ]
    },
    {
      "exercise": {
        "name": "Dead Hang",
        "equipment": "bodyweight"
      },
      "sets": [
        { "durationSeconds": 45 },
        { "durationSeconds": 40 }
      ]
    }
  ]
}
```

## superset-workout.json

Exercises grouped into supersets using `supersetId`.

```json
{
  "date": "2024-01-19T16:00:00Z",
  "name": "Push/Pull Supersets",
  "exercises": [
    {
      "exercise": { "name": "Bench Press" },
      "supersetId": 1,
      "sets": [
        { "reps": 10, "weight": 60, "unit": "kg" }
      ]
    },
    {
      "exercise": { "name": "Bent Over Row" },
      "supersetId": 1,
      "sets": [
        { "reps": 10, "weight": 60, "unit": "kg" }
      ]
    },
    {
      "exercise": { "name": "Shoulder Press" },
      "supersetId": 2,
      "sets": [
        { "reps": 12, "weight": 20, "unit": "kg" }
      ]
    },
    {
      "exercise": { "name": "Pull-up" },
      "supersetId": 2,
      "sets": [
        { "reps": 8 }
      ]
    }
  ]
}
```

## tempo-training.json

Sets with tempo notation for controlled movement.

```json
{
  "date": "2024-01-20T09:00:00Z",
  "name": "Tempo Bench Day",
  "exercises": [
    {
      "exercise": {
        "name": "Bench Press",
        "equipment": "barbell"
      },
      "sets": [
        { "reps": 8, "weight": 70, "unit": "kg", "tempo": "3-1-2-0" },
        { "reps": 8, "weight": 70, "unit": "kg", "tempo": "3-1-2-0" },
        { "reps": 6, "weight": 70, "unit": "kg", "tempo": "3-1-2-0" }
      ]
    }
  ],
  "notes": "Tempo: 3 seconds down, 1 second pause, 2 seconds up"
}
```

## More Examples

See all workout log examples in the [GitHub repository](https://github.com/radupana/openweight/tree/main/examples/workout-logs).
