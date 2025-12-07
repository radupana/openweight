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

All openweight objects allow additional properties through index signatures (`[key: string]: unknown`). This enables apps to store proprietary metadata alongside standard fields without breaking compatibility with other openweight-compliant applications.

### Namespaced Keys

Use a prefix like `myapp:` to avoid conflicts with future schema fields and other apps:

```json
{
  "date": "2024-01-15T09:30:00Z",
  "exercises": [
    ...
  ],
  "myapp:sessionId": "abc123",
  "myapp:gymLocation": "Downtown",
  "myapp:heartRateAvg": 142,
  "myapp:caloriesBurned": 450
}
```

### Best Practices for Custom Fields

1. **Always use a namespace prefix** — Choose a unique prefix for your app (e.g., `featherweight:`, `strongapp:`, `myapp:`)
2. **Use consistent naming** — Stick to camelCase after the prefix: `myapp:customField`
3. **Document your extensions** — If others might import your data, document what your custom fields mean
4. **Keep it minimal** — Only add custom fields when standard fields don't suffice

### TypeScript Example

```typescript
import { serializeWorkoutLogPretty, type WorkoutLog } from '@openweight/sdk'

// Create a workout with custom app-specific metadata
const workout: WorkoutLog = {
  date: new Date().toISOString(),
  name: 'Morning Workout',
  exercises: [
    {
      exercise: { name: 'Squat' },
      sets: [{ reps: 5, weight: 100, unit: 'kg' }],
      // Custom field on exercise
      'myapp:restTimerUsed': true,
    },
  ],
  // Custom fields on workout
  'myapp:sessionId': 'abc123',
  'myapp:gymLocation': 'Downtown Gym',
  'myapp:mood': 'energetic',
  'myapp:heartRateData': {
    avg: 142,
    max: 165,
    zones: [10, 25, 40, 20, 5],
  },
}

const json = serializeWorkoutLogPretty(workout)
// Custom fields are preserved in the JSON output
```

### Compatibility Guarantees

- **Other apps will ignore your custom fields** — Apps that don't recognize `myapp:*` fields will simply pass them through unchanged
- **Round-trip safe** — Parsing and re-serializing preserves all custom fields
- **Schema validation passes** — Custom fields don't cause validation errors because `additionalProperties` is allowed

### When to Use Custom Fields vs. Standard Fields

| Use Case | Recommendation |
|----------|----------------|
| Heart rate, calories | Custom field: `myapp:heartRate` |
| Session notes | Standard field: `notes` |
| App-specific IDs | Custom field: `myapp:sessionId` |
| RPE/RIR | Standard field: `rpe`, `rir` |
| Gym location | Custom field: `myapp:gymLocation` |
| Exercise variations | Standard field: `exercise.name` with descriptive name |

### Handling Custom Fields When Importing

When importing data from another app, you can access or ignore custom fields:

```typescript
import { parseWorkoutLog } from '@openweight/sdk'

const workout = parseWorkoutLog(jsonFromAnotherApp)

// Access standard fields (type-safe)
console.log(workout.date)
console.log(workout.exercises[0].exercise.name)

// Access custom fields (requires type assertion or checking)
const theirSessionId = workout['otherapp:sessionId'] as string | undefined
if (theirSessionId) {
  console.log('Imported session:', theirSessionId)
}

// Or simply ignore them - they won't affect your app's logic
```
