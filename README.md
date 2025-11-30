# openweight

Open standard for exchanging strength-training programs, workouts, and logs between fitness apps.

## SDKs

| SDK        | Package                                                          | Status    |
|------------|------------------------------------------------------------------|-----------|
| TypeScript | [@openweight/sdk](https://www.npmjs.com/package/@openweight/sdk) | Published |
| Kotlin     | `io.github.radupana:openweight-sdk`                              | Published |

## Releasing

Both SDKs share the same version number. The version bump script updates all locations.

### Version Types

| Command                 | When to use                        | Example       |
|-------------------------|------------------------------------|---------------|
| `npm run version:patch` | Bug fixes, docs, internal changes  | 0.1.0 → 0.1.1 |
| `npm run version:minor` | New features (backward-compatible) | 0.1.0 → 0.2.0 |
| `npm run version:major` | Breaking changes                   | 0.1.0 → 1.0.0 |

### Steps

```bash
# 1. Create a release branch
git checkout main && git pull
git checkout -b release/vX.Y.Z

# 2. Bump version (updates version.json, ts-sdk, and kotlin-sdk)
npm run version:patch   # or version:minor or version:major

# 3. Commit the version change
git commit -am "chore: release vX.Y.Z"

# 4. Push and create PR
git push -u origin release/vX.Y.Z
```

Then:
1. Create and merge the PR to main
2. Go to [Releases](https://github.com/radupana/openweight/releases) → **Draft a new release**
3. Click **Choose a tag** → type the version (e.g., `v0.1.1`) → **Create new tag on: main**
4. Set the **Release title** to the same version
5. Click **Publish release**

The workflow automatically:
- Detects which SDKs have changes since the last release
- Only publishes SDKs that changed (avoids duplicate version errors)
- TypeScript → npm (via OIDC, no tokens)
- Kotlin → Maven Central (via GPG signing)

### SDK Usage

**TypeScript/JavaScript:**
```bash
npm install @openweight/sdk
```

**Kotlin/JVM:**
```kotlin
implementation("io.github.radupana:openweight-sdk:0.1.0")
```

## License

Apache-2.0
