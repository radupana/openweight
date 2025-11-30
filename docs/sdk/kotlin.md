# Kotlin SDK

The Kotlin SDK provides type-safe parsing, validation, and serialization for openweight data on Android and JVM platforms.

## Installation

Add the dependency to your `build.gradle.kts`:

```kotlin
dependencies {
    implementation("com.openweight:openweight-sdk:0.1.0")
}
```

::: warning Not Yet Published
The Kotlin SDK is not yet published to Maven Central. For now, you must include the source directly from the [openweight repository](https://github.com/radupana/openweight/tree/main/packages/kotlin-sdk).
:::

## Requirements

- JDK 21+
- Kotlin 2.0+

## Data Classes

The SDK provides Kotlin data classes for all schema types:

```kotlin
import com.openweight.model.*

// Workout Log types
val workout: WorkoutLog
val exercise: ExerciseLog
val set: SetLog

// Template types
val template: WorkoutTemplate
val exerciseTemplate: ExerciseTemplate
val setTemplate: SetTemplate

// Program types
val program: Program
val week: ProgramWeek

// Personal Records types
val records: PersonalRecords
val exerciseRecord: ExerciseRecord
val repMax: RepMax
val estimated1RM: Estimated1RM
val volumePR: VolumePR
val durationPR: DurationPR
val athlete: Athlete
val normalizedScores: NormalizedScores
val liftScores: LiftScores
```

### Enums

```kotlin
enum class WeightUnit {
    KG, LB
}

enum class DistanceUnit {
    M, KM, FT, MI, YD
}

enum class Sex {
    MALE, FEMALE, MX
}

enum class E1RMFormula {
    BRZYCKI, EPLEY, LOMBARDI, MAYHEW, OCONNER, WATHAN
}

enum class RepMaxType {
    ACTUAL, ESTIMATED
}
```

## Parsing

Parse JSON strings into data classes:

```kotlin
import com.openweight.parseWorkoutLog
import com.openweight.parseWorkoutTemplate
import com.openweight.parseProgram
import com.openweight.parsePersonalRecords

val workout = parseWorkoutLog(jsonString)
val template = parseWorkoutTemplate(jsonString)
val program = parseProgram(jsonString)
val records = parsePersonalRecords(jsonString)
```

### Error Handling

```kotlin
import com.openweight.parseWorkoutLog
import com.openweight.ParseException

try {
    val workout = parseWorkoutLog(invalidJson)
} catch (e: ParseException) {
    println("Parse failed: ${e.message}")
    e.errors.forEach { error ->
        println("  ${error.path}: ${error.message}")
    }
}
```

## Validation

### Predicates

Simple boolean validation:

```kotlin
import com.openweight.isValidWorkoutLog
import com.openweight.isValidWorkoutTemplate
import com.openweight.isValidProgram
import com.openweight.isValidPersonalRecords
import kotlinx.serialization.json.JsonElement

if (isValidWorkoutLog(jsonElement)) {
    println("Valid workout!")
}

if (isValidPersonalRecords(jsonElement)) {
    println("Valid personal records!")
}
```

### Detailed Validation

Get detailed error information:

```kotlin
import com.openweight.validateWorkoutLog
import com.openweight.validatePersonalRecords
import com.openweight.ValidationResult

val result: ValidationResult = validateWorkoutLog(jsonElement)

if (result.valid) {
    println("Data is valid")
} else {
    result.errors.forEach { error ->
        println("${error.path}: ${error.message}")
    }
}

// Same pattern for personal records
val prResult = validatePersonalRecords(jsonElement)
```

### Validation from String

You can also validate directly from a JSON string:

```kotlin
val result = validateWorkoutLog(jsonString)
```

## Serialization

Convert data classes to JSON strings:

```kotlin
import com.openweight.serializeWorkoutLog
import com.openweight.serializeWorkoutLogPretty
import com.openweight.serializePersonalRecords
import com.openweight.serializePersonalRecordsPretty
import com.openweight.model.WorkoutLog

val workout = WorkoutLog(
    date = "2024-01-15T09:30:00Z",
    exercises = listOf(
        ExerciseLog(
            exercise = Exercise(name = "Squat"),
            sets = listOf(
                SetLog(reps = 5, weight = 100.0, unit = WeightUnit.KG)
            )
        )
    )
)

// Compact JSON
val compact = serializeWorkoutLog(workout)

// Pretty-printed JSON
val pretty = serializeWorkoutLogPretty(workout)
```

## Complete Example

```kotlin
import com.openweight.*
import com.openweight.model.*

fun main() {
    val json = """
    {
      "date": "2024-01-15T09:30:00Z",
      "name": "Morning Workout",
      "exercises": [
        {
          "exercise": {
            "name": "Barbell Back Squat",
            "equipment": "barbell",
            "category": "legs"
          },
          "sets": [
            { "reps": 5, "weight": 100, "unit": "kg", "rpe": 7 },
            { "reps": 5, "weight": 100, "unit": "kg", "rpe": 8 },
            { "reps": 5, "weight": 100, "unit": "kg", "rpe": 8.5 }
          ]
        }
      ]
    }
    """.trimIndent()

    try {
        val workout = parseWorkoutLog(json)

        // Access typed data
        println("Workout: ${workout.name}")
        println("Date: ${workout.date}")

        workout.exercises.forEach { ex ->
            println("\nExercise: ${ex.exercise.name}")
            ex.sets.forEach { set ->
                println("  ${set.reps} reps @ ${set.weight}${set.unit?.name?.lowercase()}")
            }
        }

        // Serialize back to JSON
        val output = serializeWorkoutLogPretty(workout)
        println("\nSerialized:\n$output")

    } catch (e: ParseException) {
        println("Invalid workout: ${e.message}")
        e.errors.forEach { println("  ${it.path}: ${it.message}") }
    }
}
```

## Android Integration

The SDK works seamlessly with Android projects:

```kotlin
// In your ViewModel or Repository
class WorkoutRepository {
    fun loadWorkout(file: File): WorkoutLog {
        val json = file.readText()
        return parseWorkoutLog(json)
    }

    fun saveWorkout(workout: WorkoutLog, file: File) {
        val json = serializeWorkoutLogPretty(workout)
        file.writeText(json)
    }
}
```

## Dependencies

The Kotlin SDK uses:
- **kotlinx-serialization** for JSON parsing
- **json-schema-validator** for schema validation

These are included transitively when you add the SDK dependency.
