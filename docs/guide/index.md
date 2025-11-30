# What is openweight?

**openweight** is an open, vendor-neutral data format for strength training. It defines how workouts, programs, and
training logs should be structured so they can be shared between apps, archived for the long term, and analyzed with any
tool.

## The Problem

Strength training data is trapped in silos. Each app has its own export format, its own idea of what a "program", "
workout", or "set" means, and no reliable way to move training history between tools.

When you switch apps, you lose years of training data. When an app shuts down, your history disappears. Your training
data belongs to app vendors, not to you.

## The Solution

openweight provides:

- **A clean JSON Schema** that represents strength training concepts using domain terminology (workouts, exercises,
  sets, reps, RPE)
- **SDKs for TypeScript and Kotlin** that apps can use to read and write the format
- **A path to data portability** where you can export from one app and import to another

## Design Principles

1. **Domain-first** — The schema represents strength training concepts, not any app's internal data model
2. **Simple and minimal** — Only include fields that are universal and meaningful
3. **JSON Schema as source of truth** — The schema *is* the spec, with rich descriptions
4. **SDK-driven** — Apps integrate via SDKs, not by hand-rolling JSON
5. **Extensible** — Optional fields and extension namespaces for app-specific data

## Three Core Schemas

| Schema              | Purpose                                                  |
|---------------------|----------------------------------------------------------|
| **WorkoutLog**      | A completed workout session with actual performance data |
| **WorkoutTemplate** | A planned workout with target reps, weights, and RPE     |
| **Program**         | A multi-week training program containing templates       |

## Next Steps

- [Getting Started](/guide/getting-started) — Install the SDK and parse your first workout
- [Core Concepts](/guide/concepts) — Understand the data model
- [Schema Reference](/schema/) — Explore the full schema specification
