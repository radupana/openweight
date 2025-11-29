package com.openweight

import com.openweight.model.Program
import com.openweight.model.WorkoutLog
import com.openweight.model.WorkoutTemplate
import kotlinx.serialization.json.Json

private val jsonParser = Json { ignoreUnknownKeys = true }

fun parseWorkoutLog(jsonString: String): WorkoutLog {
    val element = try {
        Json.parseToJsonElement(jsonString)
    } catch (e: Exception) {
        throw ParseException("Invalid JSON: ${e.message}")
    }

    val result = validateWorkoutLog(element)
    if (!result.valid) {
        throw ParseException("Schema validation failed", result.errors)
    }

    return jsonParser.decodeFromString<WorkoutLog>(jsonString)
}

fun parseWorkoutTemplate(jsonString: String): WorkoutTemplate {
    val element = try {
        Json.parseToJsonElement(jsonString)
    } catch (e: Exception) {
        throw ParseException("Invalid JSON: ${e.message}")
    }

    val result = validateWorkoutTemplate(element)
    if (!result.valid) {
        throw ParseException("Schema validation failed", result.errors)
    }

    return jsonParser.decodeFromString<WorkoutTemplate>(jsonString)
}

fun parseProgram(jsonString: String): Program {
    val element = try {
        Json.parseToJsonElement(jsonString)
    } catch (e: Exception) {
        throw ParseException("Invalid JSON: ${e.message}")
    }

    val result = validateProgram(element)
    if (!result.valid) {
        throw ParseException("Schema validation failed", result.errors)
    }

    return jsonParser.decodeFromString<Program>(jsonString)
}
