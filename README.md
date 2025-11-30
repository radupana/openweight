# openweight

Open standard for exchanging strength-training programs, workouts, and logs between fitness apps.

## SDKs

| SDK | Package | Status |
|-----|---------|--------|
| TypeScript | [@openweight/sdk](https://www.npmjs.com/package/@openweight/sdk) | Published |
| Kotlin | `io.github.radupana:openweight-sdk` | Published |

## Releasing

### TypeScript SDK (npm)

#### Version Types

| Command | When to use | Example |
|---------|-------------|---------|
| `npm run version:patch` | Bug fixes, docs, internal changes | 0.1.0 → 0.1.1 |
| `npm run version:minor` | New features (backward-compatible) | 0.1.0 → 0.2.0 |
| `npm run version:major` | Breaking changes | 0.1.0 → 1.0.0 |

#### Steps

```bash
# 1. Make sure you're on main and up to date
git checkout main && git pull

# 2. Bump version (pick one)
npm run version:patch   # or version:minor or version:major

# 3. Commit the version change
git commit -am "chore: release @openweight/sdk vX.Y.Z"

# 4. Push to main
git push
```

Then on GitHub:
1. Go to [Releases](https://github.com/radupana/openweight/releases) → **Draft a new release**
2. Click **Choose a tag** → type the version (e.g., `v0.1.1`) → **Create new tag**
3. Set the **Release title** to the same version (e.g., `v0.1.1`)
4. Click **Publish release**

The workflow automatically builds, tests, and publishes to npm via OIDC.

### Kotlin SDK (Maven Central)

#### Steps

```bash
# 1. Make sure you're on main and up to date
git checkout main && git pull

# 2. Update version in packages/kotlin-sdk/build.gradle.kts
# Edit: version = "X.Y.Z"

# 3. Commit the version change
git commit -am "chore: release openweight-sdk vX.Y.Z (Kotlin)"

# 4. Push to main
git push
```

Then on GitHub:
1. Go to [Releases](https://github.com/radupana/openweight/releases) → **Draft a new release**
2. Click **Choose a tag** → type the version (e.g., `v0.1.1`) → **Create new tag**
3. Set the **Release title** to the same version (e.g., `v0.1.1`)
4. Click **Publish release**

The workflow automatically builds, tests, signs, and publishes to Maven Central.

#### Usage in Gradle

```kotlin
implementation("io.github.radupana:openweight-sdk:0.1.0")
```

## License

Apache-2.0
