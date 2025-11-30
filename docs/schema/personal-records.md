# PersonalRecords Schema

**PersonalRecords** represents a standalone export of an athlete's personal records (PRs) and one-rep maxes (1RMs), independent of workout logs.

## Interactive Explorer

<SchemaExplorer
  schema-url="schemas/personal-records.schema.json"
  title="PersonalRecords Schema"
  :initial-expansion-level="2"
/>

## Use Cases

- **Migrate between apps**: Export PRs from one app, import to another
- **Backup personal bests**: Archive PRs separately from full workout history
- **Share achievements**: Export PRs to share with coach or community
- **Strength standards comparison**: Use with bodyweight to calculate percentile rankings
- **Program prescription**: Apps can use current 1RMs to calculate training percentages

## Top-Level Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `exportedAt` | string (date-time) | Yes | When this PR snapshot was exported |
| `records` | ExerciseRecord[] | Yes | Array of exercise PR records |
| `athlete` | Athlete | No | Athlete info for normalization (optional) |
| `normalizedScores` | NormalizedScores | No | Pre-calculated Wilks/DOTS for powerlifts |

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
| `brzycki` | `weight / (1.0278 – 0.0278 × reps)` |
| `epley` | `weight × (1 + 0.0333 × reps)` |
| `lombardi` | `weight × reps^0.10` |
| `mayhew` | `100 × weight / (52.2 + 41.9 × e^(-0.055 × reps))` |
| `oconner` | `weight × (1 + 0.025 × reps)` |
| `wathan` | `100 × weight / (48.8 + 53.8 × e^(-0.075 × reps))` |

## VolumePR

Best total volume achieved for an exercise in a single session.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | number | Yes | Total volume (sets × reps × weight) |
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

## Athlete

Optional athlete information for calculating normalized scores.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bodyweightKg` | number | No | Bodyweight in kilograms |
| `sex` | "male" \| "female" \| "mx" | No | For coefficient calculation |

::: info Privacy Note
The schema intentionally excludes PII (name, birth year). Apps that need identity should store it separately.
:::

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
  "athlete": {
    "bodyweightKg": 82.5,
    "sex": "male"
  },
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
  "$id": "https://openweight.org/schemas/personal-records.schema.json",
  "title": "PersonalRecords",
  "description": "Personal records and one-rep maxes for strength training",
  "type": "object",
  "required": ["exportedAt", "records"],
  "additionalProperties": true
}
```

See the [full schema on GitHub](https://github.com/radupana/openweight/blob/main/schemas/personal-records.schema.json).
:::
