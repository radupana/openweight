# Migrate Your Data

You've spent years tracking workouts. Every rep, every PR, every grind session — logged.

But right now, that data is locked inside one app. If you switch apps, it's gone. If the app shuts down, it's gone.

**One command changes that.**

```bash
npx @openweight/cli convert strong-export.csv -o my-training.json --pretty
```

Your entire training history — converted to an open format that you own forever.

## Supported Apps

| App | Format | Command |
|-----|--------|---------|
| **Strong** | CSV | `npx @openweight/cli convert --weight-unit kg strong.csv -o workouts.json` |
| **Hevy** | CSV | `npx @openweight/cli convert hevy.csv -o workouts.json` |

More converters coming soon. [Request one on GitHub](https://github.com/radupana/openweight/issues).

## How It Works

### 1. Export from your app

Every major training app lets you export your data as CSV. Find the export option in your app's settings.

### 2. Convert to openweight

Run a single command. The converter auto-detects your app's format from the CSV headers and handles all the mapping — exercise names, set types, units, supersets, everything.

```bash
npx @openweight/cli convert export.csv -o workouts.json --pretty --report
```

### 3. You're done

Your training data is now standard JSON that works everywhere:
- **Import into another app** that supports openweight
- **Analyze with any tool** — Python, R, Excel, custom scripts
- **Archive forever** — JSON doesn't expire, doesn't need a subscription, doesn't need a server

## What Gets Converted

The converter preserves everything that matters:

| Data | Supported |
|------|-----------|
| Exercise names | Normalized to standard names |
| Sets, reps, weight | With correct units (kg/lb) |
| RPE | When tracked |
| Set types | Warm-up, working, drop sets, to-failure |
| Supersets | Groupings preserved |
| Workout duration | Calculated from timestamps |
| Workout notes | Per-workout and per-exercise |

After conversion, every workout is validated against the openweight schema. You get clean, spec-compliant data — not a raw dump.

## Conversion Report

Add `--report` to see exactly what happened:

```
--- Conversion Report ---
Source:     strong
Rows:       2841/2841 converted, 0 skipped
Workouts:   147
Exercises:  23

Unmapped exercises (kept as-is):
  - Reverse Hyperextension
  - Hip Thrust (Smith Machine)
```

No silent failures. No mystery transformations. You see exactly what was converted and what wasn't.

### AI-Assisted Mapping

Got unmapped exercises or columns from an unusual CSV format? Add `--ai-assist` to let an LLM help:

```bash
npx @openweight/cli convert export.csv -o workouts.json --ai-assist --report
```

The AI suggests mappings for unknown columns and canonical names for unrecognized exercises. You review and approve each suggestion before it's applied. Confirmed mappings are cached locally so you only approve once.

Works with OpenAI (`OPENAI_API_KEY`) or any local model via Ollama (`OPENWEIGHT_AI_URL=http://localhost:11434/v1`).

## Next Steps

Ready to migrate? Pick your app:

- [Migrate from Strong](/migrate/strong) — Step-by-step guide
- [Migrate from Hevy](/migrate/hevy) — Step-by-step guide

## For App Developers

Building a fitness app? Adding openweight import is straightforward:

```typescript
import { parseWorkoutLog } from '@openweight/sdk'

// Accept openweight JSON from users
const workouts = JSON.parse(uploadedFile)
for (const workout of workouts) {
  const validated = parseWorkoutLog(JSON.stringify(workout))
  // Import into your app's database
  await importWorkout(validated)
}
```

Users who've already converted their data can bring it straight into your app. That's a powerful onboarding story — "bring your training history with you."

See the [TypeScript SDK docs](/sdk/typescript) or [Kotlin SDK docs](/sdk/kotlin) for the full API.
