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

fun serializeWorkoutLog(workout: WorkoutLog): String = jsonCompact.encodeToString(workout)

fun serializeWorkoutLogPretty(workout: WorkoutLog): String = jsonPretty.encodeToString(workout)

fun serializeWorkoutTemplate(template: WorkoutTemplate): String = jsonCompact.encodeToString(template)

fun serializeWorkoutTemplatePretty(template: WorkoutTemplate): String = jsonPretty.encodeToString(template)

fun serializeProgram(program: Program): String = jsonCompact.encodeToString(program)

fun serializeProgramPretty(program: Program): String = jsonPretty.encodeToString(program)
