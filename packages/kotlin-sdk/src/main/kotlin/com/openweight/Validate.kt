package com.openweight

import io.github.optimumcode.json.schema.JsonSchema
import io.github.optimumcode.json.schema.JsonSchemaLoader
import io.github.optimumcode.json.schema.ValidationError as SchemaValidationError
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement

private val workoutLogSchema: JsonSchema by lazy {
    JsonSchema.fromDefinition(Schemas.workoutLog)
}

private val workoutTemplateSchema: JsonSchema by lazy {
    JsonSchema.fromDefinition(Schemas.workoutTemplate)
}

private val programSchema: JsonSchema by lazy {
    JsonSchemaLoader.create()
        .register(Schemas.workoutTemplate)
        .fromDefinition(Schemas.program)
}

private fun SchemaValidationError.toValidationError(): ValidationError {
    return ValidationError(
        path = objectPath.toString(),
        message = message
    )
}

fun validateWorkoutLog(data: JsonElement): ValidationResult {
    val errors = mutableListOf<SchemaValidationError>()
    val valid = workoutLogSchema.validate(data, errors::add)
    return ValidationResult(
        valid = valid,
        errors = errors.map { it.toValidationError() }
    )
}

fun validateWorkoutLog(json: String): ValidationResult {
    val element = Json.parseToJsonElement(json)
    return validateWorkoutLog(element)
}

fun isValidWorkoutLog(data: JsonElement): Boolean {
    return workoutLogSchema.validate(data) { }
}

fun validateWorkoutTemplate(data: JsonElement): ValidationResult {
    val errors = mutableListOf<SchemaValidationError>()
    val valid = workoutTemplateSchema.validate(data, errors::add)
    return ValidationResult(
        valid = valid,
        errors = errors.map { it.toValidationError() }
    )
}

fun validateWorkoutTemplate(json: String): ValidationResult {
    val element = Json.parseToJsonElement(json)
    return validateWorkoutTemplate(element)
}

fun isValidWorkoutTemplate(data: JsonElement): Boolean {
    return workoutTemplateSchema.validate(data) { }
}

fun validateProgram(data: JsonElement): ValidationResult {
    val errors = mutableListOf<SchemaValidationError>()
    val valid = programSchema.validate(data, errors::add)
    return ValidationResult(
        valid = valid,
        errors = errors.map { it.toValidationError() }
    )
}

fun validateProgram(json: String): ValidationResult {
    val element = Json.parseToJsonElement(json)
    return validateProgram(element)
}

fun isValidProgram(data: JsonElement): Boolean {
    return programSchema.validate(data) { }
}
