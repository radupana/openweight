package com.openweight

import com.openweight.model.LifterProfile
import com.openweight.model.Program
import com.openweight.model.WorkoutLog
import com.openweight.model.WorkoutTemplate
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement

private val jsonParser = Json { ignoreUnknownKeys = true }

private inline fun <reified T> parse(
    jsonString: String,
    validate: (JsonElement) -> ValidationResult
): T {
    val element = try {
        Json.parseToJsonElement(jsonString)
    } catch (e: Exception) {
        throw ParseException("Invalid JSON: ${e.message}")
    }

    val result = validate(element)
    if (!result.valid) {
        throw ParseException("Schema validation failed", result.errors)
    }

    return jsonParser.decodeFromString<T>(jsonString)
}

/**
 * Parses a JSON string into a [WorkoutLog], validating against the schema.
 *
 * @param jsonString The JSON string to parse
 * @return The parsed [WorkoutLog]
 * @throws ParseException if the JSON is invalid or fails schema validation
 */
fun parseWorkoutLog(jsonString: String): WorkoutLog =
    parse(jsonString, ::validateWorkoutLog)

/**
 * Parses a JSON string into a [WorkoutTemplate], validating against the schema.
 *
 * @param jsonString The JSON string to parse
 * @return The parsed [WorkoutTemplate]
 * @throws ParseException if the JSON is invalid or fails schema validation
 */
fun parseWorkoutTemplate(jsonString: String): WorkoutTemplate =
    parse(jsonString, ::validateWorkoutTemplate)

/**
 * Parses a JSON string into a [Program], validating against the schema.
 *
 * @param jsonString The JSON string to parse
 * @return The parsed [Program]
 * @throws ParseException if the JSON is invalid or fails schema validation
 */
fun parseProgram(jsonString: String): Program =
    parse(jsonString, ::validateProgram)

/**
 * Parses a JSON string into a [LifterProfile], validating against the schema.
 *
 * @param jsonString The JSON string to parse
 * @return The parsed [LifterProfile]
 * @throws ParseException if the JSON is invalid or fails schema validation
 */
fun parseLifterProfile(jsonString: String): LifterProfile =
    parse(jsonString, ::validateLifterProfile)
