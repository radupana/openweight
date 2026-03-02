# Migrate from JEFIT

Export your training history from JEFIT and convert it to openweight format in under a minute.

## Step 1: Export from JEFIT

1. Open the **JEFIT** app
2. Go to **Settings** → **Account**
3. Tap **Export Data**
4. Save the CSV file (e.g., `jefit.csv`)

::: tip
JEFIT exports a multi-section file containing both your workout sessions and exercise logs. The
converter handles this composite format automatically.
:::

## Step 2: Convert

```bash
npx @openweight/cli convert --weight-unit kg jefit.csv -o workouts.json --pretty
```

::: warning Weight unit is required
JEFIT's export doesn't include weight units — it depends on your in-app setting. You **must**specify
`--weight-unit kg` or `--weight-unit lb` to match what you used in JEFIT.
:::

## Step 3: Verify (optional)

```bash
npx @openweight/cli validate workouts.json
```

Or see full conversion stats:

```bash
npx @openweight/cli convert --weight-unit kg jefit.csv -o workouts.json --pretty --report
```

Example output:

```
--- Conversion Report ---
Source:     jefit
Rows:       1847/1847 converted, 0 skipped
Workouts:   147
Exercises:  26
```

## What Gets Converted

| JEFIT field                     | openweight field                | Notes                                             |
|---------------------------------|---------------------------------|---------------------------------------------------|
| starttime / starttimie / mydate | `date`                          | Prefers Unix timestamp; falls back to date string |
| total_time                      | `durationSeconds`               | Seconds; 0 is treated as no duration              |
| ename                           | `exercise.name`                 | Normalized when possible                          |
| logs (`100x5,100x5`)            | `sets[].weight` + `sets[].reps` | Each `weightxreps` token becomes a set            |

### JEFIT's Export Format

Unlike Strong and Hevy (which export flat CSV with one row per set), JEFIT exports a **multi-section
composite file**:

```
### WORKOUT SESSIONS ###
_id,mydate,starttime,starttimie,total_time
1,2024-01-15,1705305000,,3600
###########################

### EXERCISE LOGS ###
belongsession,ename,logs
1,"Barbell Bench Press","100x5,100x5,100x3"
###########################
```

The converter joins sessions and exercise logs by session ID, unpacks the packed set data, and
produces standard openweight workout logs.

### Date Resolution

JEFIT exports contain multiple date fields (including a known typo in the column name). The
converter uses this fallback chain:

1. `starttime` — Unix timestamp (preferred)
2. `starttimie` — typo variant of starttime (used when starttime is empty)
3. `mydate` — date string fallback (e.g., `2024-01-15`)

### Bodyweight Exercises

JEFIT records bodyweight exercises (pull-ups, dips, push-ups) with `weight=0`. The converter treats
these as bodyweight — the weight field is omitted, and only reps are recorded.

### Exercise Name Normalization

Common JEFIT exercise names are mapped to canonical names:

| JEFIT name             | openweight name |
|------------------------|-----------------|
| Barbell Bench Press    | Bench Press     |
| Barbell Squat          | Squat           |
| Barbell Overhead Press | Overhead Press  |
| Barbell Row            | Bent Over Row   |
| Dumbbell Curl          | Bicep Curl      |
| Dumbbell Lateral Raise | Lateral Raise   |
| Pull Up                | Pull-up         |
| Barbell Hip Thrust     | Hip Thrust      |

Exercises that don't have a known mapping are kept as-is and flagged in the report.

## Full CLI Reference

```
npx @openweight/cli convert <file> [options]

Options:
  -f, --format <format>       Source format (auto-detected from section markers)
  -u, --weight-unit <unit>    Weight unit: kg or lb (required for JEFIT)
  -o, --output <file>         Output file (default: stdout)
  --pretty                    Pretty-print JSON output
  --report                    Print conversion report to stderr
```

## Example Output

A single JEFIT workout converts to:

```json
{
  "date": "2024-01-15T07:30:00Z",
  "durationSeconds": 3600,
  "exercises": [
    {
      "exercise": {
        "name": "Bench Press"
      },
      "sets": [
        {
          "reps": 5,
          "weight": 100,
          "unit": "kg"
        },
        {
          "reps": 5,
          "weight": 100,
          "unit": "kg"
        },
        {
          "reps": 3,
          "weight": 100,
          "unit": "kg"
        }
      ]
    },
    {
      "exercise": {
        "name": "Pull-up"
      },
      "sets": [
        {
          "reps": 10
        },
        {
          "reps": 8
        },
        {
          "reps": 6
        }
      ]
    }
  ]
}
```

Multiple workouts are output as a JSON array.

## Troubleshooting

### "Weight unit is required for JEFIT format"

JEFIT's export doesn't include units. Add `--weight-unit kg` or `--weight-unit lb` to match your
JEFIT app settings.

### Exercises show as "unmapped"

This is normal. The converter has mappings for ~80 common exercises. Anything not in the mapping
table is kept exactly as it appears in JEFIT. Check the `--report` output to see which exercises
were unmapped.

### Some exercises have 0 sets

If JEFIT exported an exercise with an empty `logs` field, it will be skipped and a warning will
appear in the report. This usually means the exercise was added to a session but no sets were
actually logged.

### Duplicate session IDs

If the export contains duplicate session IDs (rare), the converter uses the first occurrence and
warns about duplicates in the report.
