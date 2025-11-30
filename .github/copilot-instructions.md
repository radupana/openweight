# Copilot Code Review Instructions

## Project Context

openweight is an open data format for strength training. The repository contains:
- JSON Schema definitions (the canonical spec in `schemas/`)
- TypeScript SDK (`packages/ts-sdk`)
- Kotlin SDK (`packages/kotlin-sdk`)
- VitePress documentation site (`docs/`)

## General Principles

- Run `npm test` and `npm run docs:build` before committing
- If SDK functionality changes, update the corresponding documentation in `docs/sdk/`
- Keep changes focused and minimal - avoid unrelated refactoring

## Code Review Priorities

### Schema Changes
- Every field must have a `title` and `description`
- Use `required` only for truly universal fields (e.g., every workout has a date)
- Set `additionalProperties: true` for extensibility
- Add example files in `examples/` to exercise new fields
- Include both valid and invalid examples for validation testing

### TypeScript Code (`packages/ts-sdk`)
- Avoid `any` - use specific types or `unknown` with type guards
- All functions must have explicit return type annotations
- Use `try/catch` for async error handling
- Prefer `const` over `let` where possible

### Vue Components (`docs/`)
- Use Composition API with `<script setup>`
- Prefer `computed` over methods for derived state
- Type all props with `defineProps<T>()`
- Use `ref()` for reactive primitives, `reactive()` for objects

### Kotlin Code (`packages/kotlin-sdk`)
- Use `data class` for DTOs
- Prefer immutable collections (`listOf`, `mapOf`)
- Ensure null safety with `?` and smart casts
- Verify `@Serializable` annotations for JSON mapping

## Testing Requirements

- New functionality requires corresponding tests
- Tests must exercise actual code, not just mocks
- Schema changes need validation tests with valid and invalid examples
- Run full test suite: `npm test && npm run test:sdk`

## Security

- No secrets or credentials in code
- Validate external input before processing
