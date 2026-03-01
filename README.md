# openweight

**Open data format for strength training.**

Your training data belongs to you, not to any one app.

## Why openweight?

Strength training data is trapped in silos. Each app has its own export format, its own idea of what a "workout"
or "set" means, and no reliable way to move your history between tools. When you switch apps, you lose years of data.
When
an app shuts down, your history disappears.

**openweight** is a vendor-neutral JSON format that solves this:

- **Export from one app, import to another** — no more lock-in
- **Archive your training history** — in a format that will outlast any app
- **Analyze with any tool** — standard JSON that works everywhere

## Core Schemas

| Schema              | Purpose                                                            |
|---------------------|--------------------------------------------------------------------|
| **WorkoutLog**      | Completed workouts with actual reps, weight, RPE                   |
| **WorkoutTemplate** | Planned workouts with targets (reps, percentage-based weight, RPE) |
| **Program**         | Multi-week training programs composed of templates                 |
| **LifterProfile**   | Athlete data, PRs, 1RMs, height, bodyweight history                |

## Quick Example

```json
{
  "$schema": "https://openweight.dev/schemas/workout-log.schema.json",
  "date": "2024-01-15T09:00:00Z",
  "exercises": [
    {
      "exercise": {
        "name": "Squat"
      },
      "sets": [
        {
          "reps": 5,
          "weight": 140,
          "unit": "kg",
          "rpe": 7
        },
        {
          "reps": 5,
          "weight": 140,
          "unit": "kg",
          "rpe": 8
        },
        {
          "reps": 5,
          "weight": 140,
          "unit": "kg",
          "rpe": 8.5
        }
      ]
    }
  ]
}
```

## Getting Started

**TypeScript/JavaScript:**

```bash
npm install @openweight/sdk
```

```typescript
import {parseWorkoutLog, isValidWorkoutLog} from '@openweight/sdk';

const log = parseWorkoutLog(jsonString);
console.log(log.exercises[0].exercise.name); // "Squat"
```

**Kotlin/JVM:**

```kotlin
implementation("io.github.radupana:openweight-sdk:0.4.0")
```

```kotlin
val log = parseWorkoutLog(jsonString)
println(log.exercises[0].exercise.name) // "Squat"
```

## CLI

### Convert your workout data

Export your data from your app, then convert it to openweight JSON:

**From Strong:**
1. Strong app → Settings → Export Workout Data → CSV
2. Run:
```bash
npx @openweight/cli convert --weight-unit kg strong.csv -o workouts.json --pretty
```

**From Hevy:**
1. Hevy app → Profile → Settings → Export & Import Data
2. Run:
```bash
npx @openweight/cli convert hevy.csv -o workouts.json --pretty
```

The source format is auto-detected from CSV headers. Use `--format strong` or `--format hevy` to override.

### Validate openweight files

```bash
# Auto-detects schema type (workout-log, program, etc.)
npx @openweight/cli validate workout.json

# Explicit schema type
npx @openweight/cli validate --schema workout-log workout.json
```

### AI-Assisted Conversion

When the converter encounters unknown CSV columns or exercise names, you can use `--ai-assist` to let an LLM help map them:

```bash
# Requires OPENAI_API_KEY environment variable
npx @openweight/cli convert export.csv --ai-assist --pretty

# Or use a local model via Ollama
OPENWEIGHT_AI_URL=http://localhost:11434/v1 npx @openweight/cli convert export.csv --ai-assist
```

AI suggestions are shown for your approval before being applied. Confirmed mappings are cached locally (`~/.openweight/mapping-cache.json`) so the same columns/exercises resolve instantly next time.

### All CLI options

```
openweight convert <file>
  -f, --format <format>       Source format: strong, hevy (auto-detected)
  -u, --weight-unit <unit>    Weight unit: kg or lb (required for Strong)
  -o, --output <file>         Output file (default: stdout)
  --pretty                    Pretty-print JSON
  --report                    Print conversion report to stderr
  --ai-assist                 Use AI to map unknown columns and exercise names
  --ai-model <model>          AI model to use (default: gpt-4o-mini)
  --auto-approve              Skip confirmation prompts for AI suggestions

openweight validate <file>
  -s, --schema <type>         Schema: workout-log, workout-template, program, lifter-profile
```

### Supported formats

| App        | Format | Notes                                    |
|------------|--------|------------------------------------------|
| **Strong** | CSV    | Requires `--weight-unit` (kg or lb)      |
| **Hevy**   | CSV    | Auto-detects units from kg/lbs columns   |

## Documentation

Full documentation, schema reference, and interactive playground at **[openweight.dev](https://openweight.dev)**

## SDKs

| SDK        | Package                                                                                                      | Status    |
|------------|--------------------------------------------------------------------------------------------------------------|-----------|
| TypeScript | [@openweight/sdk](https://www.npmjs.com/package/@openweight/sdk)                                             | Published |
| Kotlin     | [io.github.radupana:openweight-sdk](https://central.sonatype.com/artifact/io.github.radupana/openweight-sdk) | Published |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup.

### Releasing

Both SDKs share the same version. Releases are automated via GitHub Actions:

1. Merge a PR with a [Conventional Commit](https://www.conventionalcommits.org/) title:
    - `feat:` → minor bump
    - `fix:` → patch bump
    - `feat!:` or `BREAKING CHANGE:` → major bump
2. The workflow creates a GitHub release and publishes to npm + Maven Central

## License

Apache-2.0
