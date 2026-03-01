# Migrate from Strong

Export your entire training history from Strong and convert it to openweight format in under a minute.

## Step 1: Export from Strong

1. Open the **Strong** app
2. Go to **Settings** (gear icon)
3. Tap **Export Workout Data**
4. Choose **CSV** format
5. Save or share the file (e.g., `strong.csv`)

::: tip
Strong exports all your workout history in a single CSV file. Every workout, every exercise, every set — it's all there.
:::

## Step 2: Convert

```bash
npx @openweight/cli convert --weight-unit kg strong.csv -o workouts.json --pretty
```

::: warning Weight unit is required
Strong's CSV doesn't include the unit — it depends on your in-app setting. You **must** specify `--weight-unit kg` or `--weight-unit lb` to match what you used in Strong.
:::

That's it. Your training history is now in `workouts.json`.

## Step 3: Verify (optional)

Validate the output:

```bash
npx @openweight/cli validate workouts.json
```

Or add `--report` to the convert command to see conversion stats:

```bash
npx @openweight/cli convert --weight-unit kg strong.csv -o workouts.json --pretty --report
```

Example output:
```
=== Conversion Report ===
Source format: strong
Workouts converted: 247
Exercises found: 31
Sets converted: 4,218
Warnings: 0
```

## What Gets Converted

| Strong field | openweight field | Notes |
|---|---|---|
| Date | `date` | Converted to ISO 8601 |
| Workout Name | `name` | |
| Duration | `durationSeconds` | Parsed from "1h 23m" format |
| Exercise Name | `exercise.name` | Normalized when possible |
| Set Order | Set array position | |
| Weight | `weight` + `unit` | Unit from `--weight-unit` flag |
| Reps | `reps` | |
| Distance | `distance` + `distanceUnit` | When present |
| Seconds | `durationSeconds` (set) | For timed exercises |
| RPE | `rpe` | When tracked |
| Notes | `notes` on exercise | |
| Workout Notes | `notes` on workout | |

### Exercise Name Normalization

Common Strong exercise names are automatically mapped to canonical names:

| Strong name | openweight name |
|---|---|
| Barbell Bench Press | Bench Press |
| Barbell Squat | Squat |
| Barbell Deadlift | Deadlift |
| Lat Pulldown (Cable) | Lat Pulldown |

Exercises that don't have a known mapping are kept as-is and flagged in the report.

### Set Types

| Strong set type | openweight set type |
|---|---|
| Normal | (default working set) |
| Warm Up | `warmup` |
| Drop Set | `dropset` |
| Failure | `toFailure: true` |

## Full CLI Reference

```
npx @openweight/cli convert <file> [options]

Options:
  -f, --format <format>       Source format (auto-detected from headers)
  -u, --weight-unit <unit>    Weight unit: kg or lb (required for Strong)
  -o, --output <file>         Output file (default: stdout)
  --pretty                    Pretty-print JSON output
  --report                    Print conversion report to stderr
```

## Example Output

A single workout from Strong converts to:

```json
{
  "date": "2024-03-15T07:30:00.000Z",
  "name": "Push Day",
  "durationSeconds": 4380,
  "exercises": [
    {
      "exercise": {
        "name": "Bench Press"
      },
      "sets": [
        { "reps": 5, "weight": 100, "unit": "kg", "rpe": 7 },
        { "reps": 5, "weight": 100, "unit": "kg", "rpe": 8 },
        { "reps": 5, "weight": 100, "unit": "kg", "rpe": 8.5 }
      ]
    },
    {
      "exercise": {
        "name": "Overhead Press"
      },
      "sets": [
        { "reps": 8, "weight": 50, "unit": "kg" },
        { "reps": 8, "weight": 50, "unit": "kg" },
        { "reps": 7, "weight": 50, "unit": "kg" }
      ]
    }
  ]
}
```

Multiple workouts are output as a JSON array.

## Troubleshooting

### "Weight unit is required for Strong format"

Strong's CSV doesn't include units. Add `--weight-unit kg` or `--weight-unit lb` to match your Strong app settings.

### Exercise names look different

The converter normalizes common names (e.g., "Barbell Bench Press" becomes "Bench Press"). This makes data consistent across apps. Original names are never lost — they appear in the conversion report.

### Some exercises show as "unmapped"

This is normal. The converter has mappings for ~60 common exercises. Anything not in the mapping table is kept exactly as it appears in Strong.
