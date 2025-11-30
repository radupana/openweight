# SDK Overview

openweight provides official SDKs for TypeScript and Kotlin, making it easy to integrate the format into your
applications.

## Available SDKs

| SDK                           | Package           | Platform          |
|-------------------------------|-------------------|-------------------|
| [TypeScript](/sdk/typescript) | `@openweight/sdk` | Node.js, Browsers |
| [Kotlin](/sdk/kotlin)         | `com.openweight`  | Android, JVM      |

## Shared Patterns

Both SDKs follow the same patterns:

### Parse

Convert JSON strings to typed objects with validation:

::: code-group

```typescript [TypeScript]
import {parseWorkoutLog} from '@openweight/sdk'

const workout = parseWorkoutLog(jsonString)
```

```kotlin [Kotlin]
import com.openweight.parseWorkoutLog

val workout = parseWorkoutLog(jsonString)
```

:::

### Validate

Check data against the schema:

::: code-group

```typescript [TypeScript]
import {validateWorkoutLog, isValidWorkoutLog} from '@openweight/sdk'

// Type guard
if (isValidWorkoutLog(data)) {
    // data is WorkoutLog
}

// Detailed validation
const result = validateWorkoutLog(data)
if (!result.valid) {
    console.log(result.errors)
}
```

```kotlin [Kotlin]
import com.openweight.validateWorkoutLog
import com.openweight.isValidWorkoutLog

// Predicate
if (isValidWorkoutLog(jsonElement)) {
    // valid
}

// Detailed validation
val result = validateWorkoutLog(jsonElement)
if (!result.valid) {
    result.errors.forEach { println(it) }
}
```

:::

### Serialize

Convert objects back to JSON:

::: code-group

```typescript [TypeScript]
import {serializeWorkoutLog, serializeWorkoutLogPretty} from '@openweight/sdk'

const compact = serializeWorkoutLog(workout)
const pretty = serializeWorkoutLogPretty(workout)
```

```kotlin [Kotlin]
import com.openweight.serializeWorkoutLog
import com.openweight.serializeWorkoutLogPretty

val compact = serializeWorkoutLog(workout)
val pretty = serializeWorkoutLogPretty(workout)
```

:::

## Error Handling

Both SDKs throw typed exceptions on parse errors:

::: code-group

```typescript [TypeScript]
import {parseWorkoutLog, ParseError} from '@openweight/sdk'

try {
    const workout = parseWorkoutLog(invalidJson)
} catch (error) {
    if (error instanceof ParseError) {
        console.log(error.message)
        console.log(error.errors) // ValidationError[]
    }
}
```

```kotlin [Kotlin]
import com.openweight.parseWorkoutLog
import com.openweight.ParseException

try {
    val workout = parseWorkoutLog(invalidJson)
} catch (e: ParseException) {
    println(e.message)
    e.errors.forEach { println(it) }
}
```

:::

## Supported Types

Both SDKs support all three schema types:

| Type            | Parse                  | Validate                  | Serialize                  |
|-----------------|------------------------|---------------------------|----------------------------|
| WorkoutLog      | `parseWorkoutLog`      | `validateWorkoutLog`      | `serializeWorkoutLog`      |
| WorkoutTemplate | `parseWorkoutTemplate` | `validateWorkoutTemplate` | `serializeWorkoutTemplate` |
| Program         | `parseProgram`         | `validateProgram`         | `serializeProgram`         |
