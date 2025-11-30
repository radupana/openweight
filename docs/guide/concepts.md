# Core Concepts

openweight models strength training using a hierarchy of concepts that map to how athletes think about their training.

## Data Hierarchy

```
Program
└── ProgramWeek[]
    └── WorkoutTemplate[]
        └── ExerciseTemplate[]
            └── SetTemplate[]

WorkoutLog (completed session)
└── ExerciseLog[]
    └── SetLog[]
```

## Completed vs. Planned

openweight distinguishes between **what you plan to do** and **what you actually did**:

| Planned (Templates)          | Completed (Logs) |
|------------------------------|------------------|
| WorkoutTemplate              | WorkoutLog       |
| ExerciseTemplate             | ExerciseLog      |
| SetTemplate                  | SetLog           |
| `targetReps`, `targetWeight` | `reps`, `weight` |

A `WorkoutLog` can reference the template it was created from via `templateId`.

## Exercise

An Exercise describes which movement was performed:

| Field           | Type     | Description                                         |
|-----------------|----------|-----------------------------------------------------|
| `name`          | string   | Human-readable name (required)                      |
| `equipment`     | string   | Equipment used: barbell, dumbbell, bodyweight, etc. |
| `category`      | string   | Body part: chest, back, legs, etc.                  |
| `musclesWorked` | string[] | Specific muscles targeted                           |

The same Exercise definition is shared between logs and templates.

## Sets

### SetLog (Completed)

Records what actually happened in a set:

| Field             | Type          | Description                                 |
|-------------------|---------------|---------------------------------------------|
| `reps`            | integer       | Repetitions completed                       |
| `weight`          | number        | Weight used                                 |
| `unit`            | "kg" \| "lb"  | Weight unit (required if weight is present) |
| `durationSeconds` | integer       | Time for timed exercises                    |
| `rpe`             | number (0-10) | Rate of Perceived Exertion                  |
| `rir`             | integer       | Reps In Reserve                             |
| `toFailure`       | boolean       | Whether the set was taken to failure        |
| `type`            | string        | Set type: working, warmup, dropset, etc.    |
| `tempo`           | string        | Tempo notation (e.g., "3-1-2-0")            |

### SetTemplate (Planned)

Prescribes what to do in a set:

| Field                             | Type          | Description                         |
|-----------------------------------|---------------|-------------------------------------|
| `targetReps`                      | integer       | Target rep count                    |
| `targetRepsMin` / `targetRepsMax` | integer       | Rep range (e.g., 8-12)              |
| `targetWeight`                    | number        | Absolute weight target              |
| `percentage` / `percentageOf`     | number/string | Percentage-based (e.g., 80% of 1RM) |
| `targetRPE`                       | number        | Target RPE                          |
| `targetRIR`                       | integer       | Target RIR                          |

## Units

### Weight Units

| Value | Description |
|-------|-------------|
| `kg`  | Kilograms   |
| `lb`  | Pounds      |

**Rule:** If `weight` is present, `unit` is required.

### Distance Units

| Value | Description |
|-------|-------------|
| `m`   | Meters      |
| `km`  | Kilometers  |
| `ft`  | Feet        |
| `mi`  | Miles       |
| `yd`  | Yards       |

**Rule:** If `distance` is present, `distanceUnit` is required.

## Intensity Metrics

### RPE (Rate of Perceived Exertion)

A 0-10 scale measuring how hard a set felt:

| RPE | Description                  |
|-----|------------------------------|
| 10  | Maximum effort, no reps left |
| 9   | Could do 1 more rep          |
| 8   | Could do 2 more reps         |
| 7   | Could do 3 more reps         |

Decimals are allowed (e.g., 8.5).

### RIR (Reps In Reserve)

An alternative to RPE, counting reps left in the tank:

| RIR | Description            |
|-----|------------------------|
| 0   | No reps left (failure) |
| 1   | 1 rep left             |
| 2   | 2 reps left            |

## Tempo Notation

Tempo is expressed as four numbers: `eccentric-pause-concentric-pause`

| Notation  | Description                               |
|-----------|-------------------------------------------|
| `3-1-2-0` | 3s down, 1s pause, 2s up, no pause at top |
| `4-0-1-0` | 4s down, no pause, 1s up, no pause        |
| `2-0-X-0` | 2s down, no pause, explosive up, no pause |

Use `X` for explosive (as fast as possible).

## Supersets

Exercises can be grouped into supersets using `supersetId`:

```json
{
  "exercises": [
    {
      "exercise": {
        "name": "Bench Press"
      },
      "supersetId": 1,
      "sets": [
        ...
      ]
    },
    {
      "exercise": {
        "name": "Bent Over Row"
      },
      "supersetId": 1,
      "sets": [
        ...
      ]
    }
  ]
}
```

Exercises with the same `supersetId` are performed together.

## Extensibility

All openweight objects allow additional properties. Apps can store custom data using a namespaced key:

```json
{
  "date": "2024-01-15T09:30:00Z",
  "exercises": [
    ...
  ],
  "myapp:sessionId": "abc123",
  "myapp:gymLocation": "Downtown"
}
```

Use a prefix like `myapp:` to avoid conflicts with future schema fields.
