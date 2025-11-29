package com.openweight

import com.openweight.model.Program
import com.openweight.model.WorkoutLog
import com.openweight.model.WorkoutTemplate
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

private val jsonCompact = Json { encodeDefaults = false }

@OptIn(ExperimentalSerializationApi::class)
private val jsonPretty = Json {
    encodeDefaults = false
    prettyPrint = true
    prettyPrintIndent = "  "
}

/**
 * Serializes a [WorkoutLog] to a compact JSON string.
 *
 * @param workout The workout log to serialize
 * @return A compact JSON string representation
 */
fun serializeWorkoutLog(workout: WorkoutLog): String = jsonCompact.encodeToString(workout)

/**
 * Serializes a [WorkoutLog] to a formatted JSON string with indentation.
 *
 * @param workout The workout log to serialize
 * @return A pretty-printed JSON string representation
 */
fun serializeWorkoutLogPretty(workout: WorkoutLog): String = jsonPretty.encodeToString(workout)

/**
 * Serializes a [WorkoutTemplate] to a compact JSON string.
 *
 * @param template The workout template to serialize
 * @return A compact JSON string representation
 */
fun serializeWorkoutTemplate(template: WorkoutTemplate): String = jsonCompact.encodeToString(template)

/**
 * Serializes a [WorkoutTemplate] to a formatted JSON string with indentation.
 *
 * @param template The workout template to serialize
 * @return A pretty-printed JSON string representation
 */
fun serializeWorkoutTemplatePretty(template: WorkoutTemplate): String = jsonPretty.encodeToString(template)

/**
 * Serializes a [Program] to a compact JSON string.
 *
 * @param program The program to serialize
 * @return A compact JSON string representation
 */
fun serializeProgram(program: Program): String = jsonCompact.encodeToString(program)

/**
 * Serializes a [Program] to a formatted JSON string with indentation.
 *
 * @param program The program to serialize
 * @return A pretty-printed JSON string representation
 */
fun serializeProgramPretty(program: Program): String = jsonPretty.encodeToString(program)
