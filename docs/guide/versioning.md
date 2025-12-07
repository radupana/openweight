# Versioning and Stability

## Current Status: Alpha (Pre-1.0)

openweight is currently in **alpha** development. The schema and SDKs are actively evolving based on real-world usage in [Featherweight](https://github.com/radupana/featherweight), the reference implementation.

::: warning Pre-1.0 Notice
**Breaking changes may occur** in any release before version 1.0.0. We follow semantic versioning, but during the alpha phase (0.x.x), minor version bumps may include breaking changes.
:::

## What This Means for You

### If You're Evaluating openweight

- The core concepts (workouts, exercises, sets, programs) are stable
- The TypeScript and Kotlin SDKs are functional and tested
- You can start building with openweight today, but plan for potential schema updates

### If You're Building an App

- Pin your SDK dependency to a specific version
- Subscribe to [GitHub releases](https://github.com/radupana/openweight/releases) for change notifications
- Breaking changes will be clearly documented in release notes

## Semantic Versioning

openweight follows [Semantic Versioning](https://semver.org/):

| Version | Meaning |
|---------|---------|
| `0.x.x` | Alpha — breaking changes possible in any release |
| `1.0.0` | Stable release — schema and core API are frozen |
| `1.x.x` | Minor/patch — backwards-compatible additions and fixes |
| `2.0.0` | Major — breaking changes with migration guide |

## Handling Version Differences

### During Alpha (Current)

Since we're pre-1.0, there's no formal migration system yet. If you encounter data from a different openweight version:

1. **Try parsing it** — The SDK will validate against the current schema
2. **Check for validation errors** — Missing required fields or type mismatches indicate version differences
3. **Graceful degradation** — Ignore unrecognized fields (they may be from a newer version or custom extensions)

```typescript
import { parseWorkoutLog, isValidWorkoutLog, ParseError } from '@openweight/sdk'

function importWithFallback(json: string) {
  try {
    // Try strict parsing first
    return parseWorkoutLog(json)
  } catch (error) {
    if (error instanceof ParseError) {
      console.warn('Data may be from a different version:', error.message)

      // Attempt lenient import - parse as JSON and extract what we can
      const data = JSON.parse(json)
      if (data.date && Array.isArray(data.exercises)) {
        // Has minimum required structure
        return data
      }
    }
    throw error
  }
}
```

### After 1.0 (Future)

Once we reach 1.0, we plan to:

- Add a `schemaVersion` field to all objects
- Provide migration utilities in the SDK
- Maintain backwards compatibility within major versions
- Publish detailed migration guides for major version upgrades

## Data Interchange Recommendations

When exchanging data between apps that may use different SDK versions:

1. **Include version metadata** (optional but recommended):
   ```json
   {
     "date": "2024-01-15T09:30:00Z",
     "exercises": [...],
     "openweight:version": "0.2.0"
   }
   ```

2. **Use validation before import**:
   ```typescript
   import { isValidWorkoutLog, validateWorkoutLog } from '@openweight/sdk'

   if (isValidWorkoutLog(data)) {
     // Safe to use with full type guarantees
   } else {
     const result = validateWorkoutLog(data)
     console.log('Validation issues:', result.errors)
     // Decide whether to import with warnings or reject
   }
   ```

3. **Preserve unknown fields** — Don't strip fields you don't recognize; they may be from a newer schema version or another app's extensions

## Roadmap to 1.0

Before releasing 1.0, we plan to:

- [ ] Stabilize all four core schemas (WorkoutLog, WorkoutTemplate, Program, LifterProfile)
- [ ] Complete SDK feature parity (TypeScript and Kotlin)
- [ ] Add schema version field
- [ ] Document all edge cases and validation rules
- [ ] Battle-test with multiple real-world applications

## Getting Help

- **GitHub Issues**: Report bugs or suggest improvements at [github.com/radupana/openweight](https://github.com/radupana/openweight/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/radupana/openweight/discussions)

## Changelog

See the [GitHub Releases](https://github.com/radupana/openweight/releases) page for detailed changelogs of each version.
