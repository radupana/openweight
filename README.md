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
implementation("io.github.radupana:openweight-sdk:0.2.0")
```

```kotlin
import org.openweight.sdk.parseWorkoutLog

val log = parseWorkoutLog(jsonString)
println(log.exercises[0].exercise.name) // "Squat"
```

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
