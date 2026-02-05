# Contributing to openweight

Thank you for your interest in contributing to openweight!

## Development Setup

### Prerequisites

- Node.js 18+
- JDK 21+ (for Kotlin SDK)

### Getting Started

```bash
# Clone the repository
git clone https://github.com/radupana/openweight.git
cd openweight

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

## Project Structure

```
schemas/              # JSON Schema files (source of truth)
packages/
  ts-sdk/             # TypeScript SDK
  kotlin-sdk/         # Kotlin SDK
docs/                 # VitePress documentation site
examples/             # Example JSON files
  workout-logs/
  workout-templates/
  programs/
  lifter-profiles/
  invalid/            # Invalid examples for testing
```

## Making Changes

### Schema Changes

1. Edit the relevant schema in `schemas/`
2. Add or update example files in `examples/`
3. Run `npm run validate-examples` to verify
4. Update SDK types and tests in both TypeScript and Kotlin SDKs
5. Update documentation in `docs/`

### SDK Changes

**TypeScript:**

```bash
cd packages/ts-sdk
npm test
npm run build
```

**Kotlin:**

```bash
cd packages/kotlin-sdk
./gradlew test
./gradlew build
```

### Documentation Changes

```bash
cd docs
npm run dev      # Local dev server
npm run build    # Production build
```

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/). PR titles must follow this format:

- `feat:` - New features (triggers minor version bump)
- `fix:` - Bug fixes (triggers patch version bump)
- `feat!:` or `BREAKING CHANGE:` - Breaking changes (triggers major version bump)
- `docs:` - Documentation only
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring
- `test:` - Test changes

Examples:
- `feat: Add bodyweight tracking to LifterProfile`
- `fix: Handle missing unit in RepMax validation`
- `docs: Update TypeScript SDK examples`

## Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Ensure tests pass (`npm test`)
5. Commit with a conventional commit message
6. Push to your fork
7. Open a pull request

## Code Style

- **TypeScript:** Follow existing patterns, use TypeScript strict mode
- **Kotlin:** Follow Kotlin coding conventions
- **Schemas:** Include `title` and `description` for all fields

## Testing

All changes should include appropriate tests:

- Schema validation tests for new fields
- SDK unit tests for new functions
- Example files for new features

## Questions?

Open an issue for discussion before making large changes.
