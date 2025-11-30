# openweight — Open Strength Training Data Standard

> A vendor-neutral, JSON-based format for representing strength training programs, workouts, and logs.

---

## 1. Vision

Strength training data is trapped in silos. Each app has its own export format, its own idea of what a "program", "
workout", or "set" means, and no reliable way to move training history between tools.

**openweight** defines an open, implementation-agnostic data format for strength training that:

- Lets users **export their training history and programs** in a human-readable, archival-quality format
- Provides **SDKs** that apps can integrate to read and write the format
- Enables **data portability** — your training data belongs to you, not to any one app

---

## 2. Goals & Non-Goals

### 2.1 Primary Goals

1. **Define a clean data format** rooted in the ubiquitous language of strength training (workouts, exercises, sets,
   reps, weight, RPE, programs, etc.)
2. **Build SDKs** (TypeScript, Kotlin) that apps can use to serialize/deserialize the format
3. **Enable [Featherweight](https://github.com/radupana/featherweight)** (the reference app) to export and import
   training data
4. **Keep it open** — if others want to adopt the format, they can

### 2.2 Non-Goals (for now)

- **Driving adoption** — we're not trying to convince other apps to adopt this; that may happen organically later
- **Nutrition, bodyweight, sleep** — out of scope
- **Cardio / GPS formats** — GPX/TCX/FIT already exist
- **Replacing Apple Health / Google Fit** — we complement, not replace

---

## 3. Design Principles

1. **Domain-first** — the schema represents strength training concepts, not any app's internal data model
2. **Simple and minimal** — only include fields that are universal and meaningful
3. **JSON Schema as source of truth** — the schema *is* the spec, with rich descriptions
4. **SDK-driven** — apps integrate via SDKs, not by hand-rolling JSON
5. **Extensible** — optional fields and extension namespaces for app-specific data

---

## 4. Artifacts

| Artifact           | Purpose                                                                                       | Location               |
|--------------------|-----------------------------------------------------------------------------------------------|------------------------|
| **JSON Schema**    | Canonical spec with validation rules and documentation                                        | `schemas/`             |
| **TypeScript SDK** | Parse, validate, serialize openweight JSON                                                    | `packages/ts-sdk/`     |
| **Kotlin SDK**     | For Android/JVM apps ([Featherweight](https://github.com/radupana/featherweight) integration) | `packages/kotlin-sdk/` |
| **Validation CLI** | Command-line tool to validate files                                                           | `tools/cli/`           |
| **Examples**       | Sample files for testing and illustration                                                     | `examples/`            |
| **Converters**     | Transform other formats (Strong CSV, etc.) into openweight                                    | `tools/converters/`    |

---

## 5. Milestones

### Milestone 1 — Core Workout Log Schema ✓

Define the schema for completed workouts.

- [x] Design data model from first principles (Workout → Exercise → Set)
- [x] Create JSON Schema with full documentation (`schemas/workout-log.schema.json`)
- [x] Write example files (`examples/workout-logs/`)
- [x] Basic validation script

### Milestone 2 — TypeScript SDK ✓

- [x] Generate or write TypeScript types from schema
- [x] Parse/serialize functions
- [x] Validation helpers (wrapping AJV or similar)
- [x] Publish as npm package (`@openweight/sdk`)

### Milestone 3 — Program & Template Schema ✓

- [x] Design program/template data model
- [x] Create JSON Schema (`schemas/workout-template.schema.json`, `schemas/program.schema.json`)
- [x] Update TypeScript SDK
- [x] Example program files

### Milestone 4 — Kotlin SDK ✓

- [x] Generate or write Kotlin data classes from schema
- [x] Parse/serialize functions (kotlinx.serialization)
- [x] Publish to Maven Central (`io.github.radupana:openweight-sdk`)
- [ ] Integrate into [Featherweight](https://github.com/radupana/featherweight) for export/import

### Milestone 5 — Converters

- [ ] Strong CSV → openweight converter
- [ ] Other app converters as needed

### Milestone 6 — Polish & Documentation

- [ ] CLI tool (`openweight validate`, `openweight convert`)
- [x] Documentation site or comprehensive README
- [ ] v1.0 release

---

## 6. Reference Implementation

**[Featherweight](https://github.com/radupana/featherweight)** serves as the reference implementation. The openweight
format is designed to support Featherweight's data model while remaining app-agnostic.

This means:

- Featherweight's needs inform the schema design
- But the schema uses domain terminology, not Featherweight internals
- Other apps should be able to adopt the format without knowing anything about Featherweight

