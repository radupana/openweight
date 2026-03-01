# CLI

The openweight CLI validates and converts workout data from the command line. No installation required — run it directly with `npx`.

## Quick Start

```bash
# Convert a Strong export to openweight JSON
npx @openweight/cli convert --weight-unit kg strong.csv -o workouts.json --pretty

# Convert a Hevy export
npx @openweight/cli convert hevy.csv -o workouts.json --pretty

# Validate an openweight file
npx @openweight/cli validate workout.json
```

## Commands

### `convert`

Convert CSV exports from fitness apps to openweight JSON.

```
npx @openweight/cli convert <file> [options]
```

| Option | Description |
|--------|-------------|
| `-f, --format <format>` | Source format: `strong`, `hevy` (auto-detected from headers) |
| `-u, --weight-unit <unit>` | Weight unit: `kg` or `lb` (required for Strong) |
| `-o, --output <file>` | Output file (default: stdout) |
| `--pretty` | Pretty-print JSON output |
| `--report` | Print conversion report to stderr |

**Examples:**

```bash
# Auto-detect format, output to file
npx @openweight/cli convert export.csv -o workouts.json --pretty

# Explicit format with report
npx @openweight/cli convert --format strong --weight-unit lb export.csv --report

# Pipe to another tool
npx @openweight/cli convert export.csv | jq '.[] | .exercises | length'
```

### `validate`

Validate openweight JSON files against the schema.

```
npx @openweight/cli validate <file> [options]
```

| Option | Description |
|--------|-------------|
| `-s, --schema <type>` | Schema type: `workout-log`, `workout-template`, `program`, `lifter-profile` (auto-detected) |

The validator auto-detects the schema type from the JSON structure. Use `--schema` to override.

**Examples:**

```bash
# Auto-detect schema type
npx @openweight/cli validate workout.json

# Explicit schema type
npx @openweight/cli validate --schema program my-program.json

# Validate from stdin
cat workout.json | npx @openweight/cli validate -
```

## Format Auto-Detection

The CLI auto-detects the source format by inspecting CSV column headers:

| Headers detected | Format |
|---|---|
| `Date`, `Exercise Name`, `Set Order`, `Weight`, `Reps` | Strong |
| `title`, `start_time`, `exercise_title`, `set_index` | Hevy |

To override, use `--format strong` or `--format hevy`.

## Programmatic Usage

The conversion engine is also available as a library:

```typescript
import { convert, detectFormat } from '@openweight/converters'

const csv = fs.readFileSync('export.csv', 'utf-8')

const result = convert({
  format: detectFormat(csv),
  csv,
  weightUnit: 'kg',
})

console.log(`Converted ${result.workouts.length} workouts`)
console.log(`Warnings: ${result.report.warnings.length}`)
```

See the [TypeScript SDK docs](/sdk/typescript) for working with the converted data.
