# CLI

The openweight CLI validates and converts workout data from the command line. No installation
required — run it directly with `npx`.

## Quick Start

```bash
# Convert a Strong export to openweight JSON
npx @openweight/cli convert --weight-unit kg strong.csv -o workouts.json --pretty

# Convert a Hevy export
npx @openweight/cli convert hevy.csv -o workouts.json --pretty

# Convert a JEFIT export
npx @openweight/cli convert --weight-unit kg jefit.csv -o workouts.json --pretty

# Validate an openweight file
npx @openweight/cli validate workout.json
```

## Commands

### `convert`

Convert CSV exports from fitness apps to openweight JSON.

```
npx @openweight/cli convert <file> [options]
```

| Option                     | Description                                                  |
|----------------------------|--------------------------------------------------------------|
| `-f, --format <format>`    | Source format: `strong`, `hevy`, `jefit` (auto-detected)     |
| `-u, --weight-unit <unit>` | Weight unit: `kg` or `lb` (required for Strong)              |
| `-o, --output <file>`      | Output file (default: stdout)                                |
| `--pretty`                 | Pretty-print JSON output                                     |
| `--report`                 | Print conversion report to stderr                            |
| `--ai-assist`              | Use AI to map unknown columns and normalize exercise names   |
| `--ai-model <model>`       | AI model to use (default: `gpt-4.1-mini`)                    |
| `--auto-approve`           | Skip confirmation prompts for AI suggestions                 |

**Examples:**

```bash
# Auto-detect format, output to file
npx @openweight/cli convert export.csv -o workouts.json --pretty

# Explicit format with report
npx @openweight/cli convert --format strong --weight-unit lb export.csv --report

# Pipe to another tool
npx @openweight/cli convert export.csv | jq '.[] | .exercises | length'

# AI-assisted conversion (requires OPENAI_API_KEY or OPENWEIGHT_AI_URL)
OPENAI_API_KEY=sk-... npx @openweight/cli convert export.csv --ai-assist --pretty

# AI-assisted with a local Ollama model
OPENWEIGHT_AI_URL=http://localhost:11434/v1 npx @openweight/cli convert export.csv --ai-assist
```

### AI-Assisted Conversion

The converter uses a 3-tier column mapping engine:

1. **Exact match** — known column names from supported apps
2. **Fuzzy match** — case-insensitive aliases
3. **AI inference** (opt-in) — an LLM maps remaining unknown columns and normalizes exercise names

When `--ai-assist` is enabled:

- Unknown CSV columns are sent to the AI with sample data for context
- Unrecognized exercise names are matched to standard strength training terminology
- All AI suggestions are shown for your approval before being applied (unless `--auto-approve` is
  set)
- Confirmed mappings are cached at `~/.openweight/mapping-cache.json` for instant reuse

**Supported AI backends:**

- **OpenAI** — set `OPENAI_API_KEY` environment variable
- **Ollama / vLLM / any OpenAI-compatible API** — set `OPENWEIGHT_AI_URL` (e.g.,
  `http://localhost:11434/v1`)

The `openai` npm package is required for AI features: `npm install openai`

### `validate`

Validate openweight JSON files against the schema.

```
npx @openweight/cli validate <file> [options]
```

| Option                | Description                                                                                 |
|-----------------------|---------------------------------------------------------------------------------------------|
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

| Headers detected                                       | Format |
|--------------------------------------------------------|--------|
| `Date`, `Exercise Name`, `Set Order`, `Weight`, `Reps` | Strong |
| `title`, `start_time`, `exercise_title`, `set_index`   | Hevy   |
| `### WORKOUT SESSIONS ###` + `### EXERCISE LOGS ###` section markers | JEFIT |

To override, use `--format strong`, `--format hevy`, or `--format jefit`.

## Programmatic Usage

The conversion engine is also available as a library:

```typescript
import { convert, detectFormat } from '@openweight/converters'

const csv = fs.readFileSync('export.csv', 'utf-8')

const result = await convert({
  format: detectFormat(csv),
  csv,
  weightUnit: 'kg',
})

console.log(`Converted ${result.workouts.length} workouts`)
console.log(`Warnings: ${result.report.warnings.length}`)
```

With AI-assisted conversion:

```typescript
import { convert, detectFormat, createAIProvider } from '@openweight/converters'

const csv = fs.readFileSync('export.csv', 'utf-8')
const ai = await createAIProvider() // uses OPENAI_API_KEY or OPENWEIGHT_AI_URL

const result = await convert({
  format: detectFormat(csv),
  csv,
  weightUnit: 'kg',
  ai,
})

// AI suggestions are in the report (not auto-applied)
if (result.report.aiExerciseSuggestions?.length) {
  console.log('AI exercise suggestions:', result.report.aiExerciseSuggestions)
}
```

See the [TypeScript SDK docs](/sdk/typescript) for working with the converted data.
