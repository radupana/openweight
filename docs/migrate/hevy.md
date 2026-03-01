# Migrate from Hevy

Export your training history from Hevy and convert it to openweight format in under a minute.

## Step 1: Export from Hevy

1. Open the **Hevy** app
2. Go to **Profile** → **Settings**
3. Tap **Export & Import Data**
4. Download the CSV file (e.g., `hevy.csv`)

::: tip
Hevy exports everything — workouts, exercises, sets, supersets, and notes. The converter handles all of it.
:::

## Step 2: Convert

```bash
npx @openweight/cli convert hevy.csv -o workouts.json --pretty
```

No extra flags needed. Hevy's CSV includes weight in both kg and lbs columns, so units are auto-detected.

## Step 3: Verify (optional)

```bash
npx @openweight/cli validate workouts.json
```

Or see full conversion stats:

```bash
npx @openweight/cli convert hevy.csv -o workouts.json --pretty --report
```

Example output:
```
--- Conversion Report ---
Source:     hevy
Rows:       3104/3104 converted, 0 skipped
Workouts:   183
Exercises:  27
```

## What Gets Converted

| Hevy field | openweight field | Notes |
|---|---|---|
| title | `name` | Workout name |
| start_time / end_time | `date` + `durationSeconds` | Duration calculated from timestamps |
| description | `notes` | Workout notes |
| exercise_title | `exercise.name` | Normalized when possible |
| superset_id | `supersetId` | Superset groupings preserved |
| reps | `reps` | |
| weight_kg / weight_lbs | `weight` + `unit` | Prefers kg; auto-detects which column has data |
| duration_seconds | `durationSeconds` (set) | For timed exercises |
| distance_km / distance_miles | `distance` + `distanceUnit` | Prefers km |
| rpe | `rpe` | When tracked |
| set_type | Set type mapping | See table below |

### Unit Auto-Detection

Hevy exports include both `weight_kg` and `weight_lbs` columns. The converter:
- Uses `weight_kg` when available (stores as `kg`)
- Falls back to `weight_lbs` (stores as `lb`)
- Same logic for distance: prefers `distance_km` over `distance_miles`

You never need to specify units manually.

### Exercise Name Normalization

Common Hevy exercise names are mapped to canonical names:

| Hevy name | openweight name |
|---|---|
| Bench Press (Barbell) | Bench Press |
| Back Squat (Barbell) | Squat |
| Deadlift (Barbell) | Deadlift |
| Lateral Raise (Dumbbell) | Lateral Raise |

### Set Types

| Hevy set_type | openweight set type |
|---|---|
| normal / 1 | (default working set) |
| warmup / 2 | `warmup` |
| dropset / 3 | `dropset` |
| failure / 4 | `toFailure: true` |

### Supersets

Hevy's `superset_id` column is preserved as `supersetId` on the exercise. Exercises with the same superset ID are grouped together, matching how they appear in Hevy.

## Full CLI Reference

```
npx @openweight/cli convert <file> [options]

Options:
  -f, --format <format>       Source format (auto-detected from headers)
  -u, --weight-unit <unit>    Weight unit: kg or lb (not needed for Hevy)
  -o, --output <file>         Output file (default: stdout)
  --pretty                    Pretty-print JSON output
  --report                    Print conversion report to stderr
```

## Example Output

A single Hevy workout converts to:

```json
{
  "date": "2024-06-10T08:15:00.000Z",
  "name": "Upper Body",
  "durationSeconds": 5400,
  "exercises": [
    {
      "exercise": {
        "name": "Bench Press"
      },
      "supersetId": "1",
      "sets": [
        { "reps": 8, "weight": 80, "unit": "kg" },
        { "reps": 8, "weight": 80, "unit": "kg" },
        { "reps": 7, "weight": 80, "unit": "kg" }
      ]
    },
    {
      "exercise": {
        "name": "Bent Over Row"
      },
      "supersetId": "1",
      "sets": [
        { "reps": 8, "weight": 70, "unit": "kg" },
        { "reps": 8, "weight": 70, "unit": "kg" },
        { "reps": 8, "weight": 70, "unit": "kg" }
      ]
    }
  ]
}
```

Multiple workouts are output as a JSON array.

## Troubleshooting

### Date parsing issues

Hevy uses the format `"10 Jun 2024, 08:15"` in some exports and ISO timestamps in others. Both are handled automatically.

### Exercises show as "unmapped"

This is normal. The converter maps ~60 common exercises to canonical names. Anything without a mapping is kept exactly as Hevy names it. Check the `--report` output to see which exercises were unmapped.
