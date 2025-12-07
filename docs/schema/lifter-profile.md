# LifterProfile Schema

**LifterProfile** represents a lifter's profile including physical attributes, bodyweight history, and personal records (PRs). It's the go-to schema for athlete data that isn't tied to a specific workout.

## Interactive Explorer

<SchemaExplorer
  schema-url="schemas/lifter-profile.schema.json"
  title="LifterProfile Schema"
  :initial-expansion-level="2"
/>

## Use Cases

- **Migrate between apps**: Export your profile and PRs from one app, import to another
- **Track body composition**: Store height, bodyweight history over time
- **Backup personal bests**: Archive PRs separately from full workout history
- **Share achievements**: Export PRs to share with coach or community
- **Strength standards comparison**: Use bodyweight to calculate percentile rankings
- **Program prescription**: Apps can use current 1RMs to calculate training percentages

## Top-Level Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `exportedAt` | string (date-time) | Yes | When this profile was exported |
| `name` | string | No | Display name or nickname |
| `sex` | "male" \| "female" | No | For coefficient calculations (Wilks, DOTS, etc.) |
| `birthDate` | string (date) | No | For age-based categories (masters, juniors) |
| `height` | Height | No | Height measurement |
| `bodyweight` | Bodyweight | No | Current bodyweight |
| `bodyweightHistory` | BodyweightEntry[] | No | Historical bodyweight entries |
| `records` | ExerciseRecord[] | No | Personal records by exercise |
| `normalizedScores` | NormalizedScores | No | Pre-calculated Wilks/DOTS for powerlifts |

## Height

Height measurement with unit.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | number | Yes | Height value |
| `unit` | "cm" \| "in" | Yes | Height unit |

## Bodyweight

Current or reference bodyweight.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | number | Yes | Bodyweight value |
| `unit` | "kg" \| "lb" | Yes | Weight unit |
| `date` | string (date) | No | When measured |

## BodyweightEntry

A historical bodyweight measurement.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | number | Yes | Bodyweight value |
| `unit` | "kg" \| "lb" | Yes | Weight unit |
| `date` | string (date) | Yes | When measured |
| `notes` | string | No | Context (morning weigh-in, competition, etc.) |

## ExerciseRecord

Personal records for a single exercise.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `exercise` | Exercise | Yes | Which exercise (name, equipment, category) |
| `repMaxes` | RepMax[] | No | Rep max records (1RM, 3RM, 5RM, etc.) |
| `estimated1RM` | Estimated1RM | No | Calculated e1RM with formula metadata |
| `volumePR` | VolumePR | No | Best session volume for this exercise |
| `durationPR` | DurationPR | No | Best time for timed exercises |

## RepMax

A rep max record (e.g., heaviest weight for 1 rep, 3 reps, 5 reps).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reps` | integer (1-15) | Yes | Rep count |
| `weight` | number | Yes | Weight lifted |
| `unit` | "kg" \| "lb" | Yes | Weight unit |
| `date` | string (date) | Yes | When PR was achieved |
| `type` | "actual" \| "estimated" | No | Whether tested or calculated |
| `bodyweightKg` | number | No | Bodyweight at time of PR |
| `workoutId` | string | No | Reference to source workout |
| `rpe` | number (0-10) | No | RPE if recorded |
| `notes` | string | No | Context (competition, gym PR, etc.) |

## Estimated1RM

A calculated one-rep max estimate based on submaximal performance.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | number | Yes | Estimated 1RM value |
| `unit` | "kg" \| "lb" | Yes | Weight unit |
| `formula` | string | Yes | Formula used (see below) |
| `basedOnReps` | integer | Yes | Rep count used for calculation |
| `basedOnWeight` | number | Yes | Weight used for calculation |
| `date` | string (date) | No | When the source set was performed |

### Supported Formulas

| Formula | Calculation |
|---------|-------------|
| `brzycki` | `weight / (1.0278 - 0.0278 x reps)` |
| `epley` | `weight x (1 + 0.0333 x reps)` |
| `lombardi` | `weight x reps^0.10` |
| `mayhew` | `100 x weight / (52.2 + 41.9 x e^(-0.055 x reps))` |
| `oconner` | `weight x (1 + 0.025 x reps)` |
| `wathan` | `100 x weight / (48.8 + 53.8 x e^(-0.075 x reps))` |

## VolumePR

Best total volume achieved for an exercise in a single session.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | number | Yes | Total volume (sets x reps x weight) |
| `unit` | "kg" \| "lb" | Yes | Weight unit |
| `date` | string (date) | Yes | When achieved |
| `notes` | string | No | Context (e.g., "10x5 at 170kg") |

## DurationPR

Best time for timed exercises (planks, carries, etc.).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `seconds` | integer | Yes | Duration in seconds |
| `date` | string (date) | Yes | When achieved |
| `weight` | number | No | Weight used (for weighted exercises) |
| `unit` | "kg" \| "lb" | Conditional | Required if weight is present |
| `notes` | string | No | Additional context |

## NormalizedScores

Pre-calculated bodyweight-normalized scores for powerlifts.

| Field | Type | Description |
|-------|------|-------------|
| `squat` | LiftScores | Scores for squat |
| `bench` | LiftScores | Scores for bench press |
| `deadlift` | LiftScores | Scores for deadlift |
| `total` | LiftScores | Scores for powerlifting total |

### LiftScores

| Field | Type | Description |
|-------|------|-------------|
| `wilks` | number | Classic powerlifting coefficient |
| `dots` | number | Modern replacement for Wilks |
| `ipfGl` | number | IPF Goodlift points |
| `glossbrenner` | number | Alternative coefficient |

## Example

```json
{
  "exportedAt": "2024-01-15T10:00:00Z",
  "name": "John",
  "sex": "male",
  "birthDate": "1990-05-15",
  "height": { "value": 180, "unit": "cm" },
  "bodyweight": { "value": 82.5, "unit": "kg", "date": "2024-01-15" },
  "bodyweightHistory": [
    { "value": 82.5, "unit": "kg", "date": "2024-01-15", "notes": "Morning weigh-in" },
    { "value": 83.0, "unit": "kg", "date": "2024-01-08" },
    { "value": 81.5, "unit": "kg", "date": "2024-01-01" }
  ],
  "records": [
    {
      "exercise": {
        "name": "Barbell Back Squat",
        "equipment": "barbell"
      },
      "repMaxes": [
        {
          "reps": 1,
          "weight": 180,
          "unit": "kg",
          "date": "2024-01-10",
          "type": "actual",
          "notes": "Competition PR"
        },
        {
          "reps": 5,
          "weight": 155,
          "unit": "kg",
          "date": "2023-12-20",
          "type": "actual"
        }
      ],
      "estimated1RM": {
        "value": 185,
        "unit": "kg",
        "formula": "brzycki",
        "basedOnReps": 5,
        "basedOnWeight": 155
      }
    },
    {
      "exercise": {
        "name": "Plank",
        "equipment": "bodyweight"
      },
      "durationPR": {
        "seconds": 180,
        "date": "2024-01-08"
      }
    }
  ],
  "normalizedScores": {
    "squat": { "wilks": 145.2, "dots": 148.5 },
    "total": { "wilks": 406.2, "dots": 414.6 }
  }
}
```

## Full Schema

::: details Click to expand full JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openweight.org/schemas/lifter-profile.schema.json",
  "title": "LifterProfile",
  "description": "A lifter's profile including physical attributes, bodyweight history, and personal records",
  "type": "object",
  "required": ["exportedAt"],
  "additionalProperties": true
}
```

See the [full schema on GitHub](https://github.com/radupana/openweight/blob/main/schemas/lifter-profile.schema.json).
:::
