# Examples Overview

Browse example files to understand how openweight data is structured.

## Example Categories

| Category                                       | Description                      |
|------------------------------------------------|----------------------------------|
| [Workout Logs](/examples/workout-logs)         | Completed workout sessions       |
| [Templates](/examples/workout-templates)       | Planned workout prescriptions    |
| [Programs](/examples/programs)                 | Multi-week training programs     |
| [Personal Records](/examples/personal-records) | Personal records and 1RM exports |

## Progression

The examples are organized from simple to complex:

1. **Minimal** — The smallest valid file, showing only required fields
2. **Simple** — Typical real-world usage
3. **Full-featured** — All fields and advanced features

## Using Examples

### Validate Locally

Clone the repository and run validation:

```bash
git clone https://github.com/radupana/openweight.git
cd openweight
npm install
npm run validate-examples
```

### Parse with SDK

```typescript
import {parseWorkoutLog} from '@openweight/sdk'
import fs from 'fs'

const json = fs.readFileSync('examples/workout-logs/minimal.json', 'utf-8')
const workout = parseWorkoutLog(json)
```

## Raw Files

All example files are available in the repository:

- [examples/workout-logs/](https://github.com/radupana/openweight/tree/main/examples/workout-logs)
- [examples/workout-templates/](https://github.com/radupana/openweight/tree/main/examples/workout-templates)
- [examples/programs/](https://github.com/radupana/openweight/tree/main/examples/programs)
- [examples/personal-records/](https://github.com/radupana/openweight/tree/main/examples/personal-records)
