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

// Program schema uses JsonSchemaLoader instead of JsonSchema.fromDefinition because
// program.schema.json contains a $ref to workout-template.schema.json. The loader
// allows us to register the workout template schema first so the $ref can be resolved.
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

/**
 * Validates a [JsonElement] against the workout log schema.
 *
 * @param data The JSON element to validate
 * @return A [ValidationResult] containing validity status and any errors
 */
fun validateWorkoutLog(data: JsonElement): ValidationResult {
    val errors = mutableListOf<SchemaValidationError>()
    val valid = workoutLogSchema.validate(data, errors::add)
    return ValidationResult(
        valid = valid,
        errors = errors.map { it.toValidationError() }
    )
}

/**
 * Validates a JSON string against the workout log schema.
 *
 * @param json The JSON string to validate
 * @return A [ValidationResult] containing validity status and any errors
 */
fun validateWorkoutLog(json: String): ValidationResult {
    val element = Json.parseToJsonElement(json)
    return validateWorkoutLog(element)
}

/**
 * Checks if a [JsonElement] is a valid workout log.
 *
 * @param data The JSON element to check
 * @return true if valid, false otherwise
 */
fun isValidWorkoutLog(data: JsonElement): Boolean {
    return workoutLogSchema.validate(data) { }
}

/**
 * Validates a [JsonElement] against the workout template schema.
 *
 * @param data The JSON element to validate
 * @return A [ValidationResult] containing validity status and any errors
 */
fun validateWorkoutTemplate(data: JsonElement): ValidationResult {
    val errors = mutableListOf<SchemaValidationError>()
    val valid = workoutTemplateSchema.validate(data, errors::add)
    return ValidationResult(
        valid = valid,
        errors = errors.map { it.toValidationError() }
    )
}

/**
 * Validates a JSON string against the workout template schema.
 *
 * @param json The JSON string to validate
 * @return A [ValidationResult] containing validity status and any errors
 */
fun validateWorkoutTemplate(json: String): ValidationResult {
    val element = Json.parseToJsonElement(json)
    return validateWorkoutTemplate(element)
}

/**
 * Checks if a [JsonElement] is a valid workout template.
 *
 * @param data The JSON element to check
 * @return true if valid, false otherwise
 */
fun isValidWorkoutTemplate(data: JsonElement): Boolean {
    return workoutTemplateSchema.validate(data) { }
}

/**
 * Validates a [JsonElement] against the program schema.
 *
 * @param data The JSON element to validate
 * @return A [ValidationResult] containing validity status and any errors
 */
fun validateProgram(data: JsonElement): ValidationResult {
    val errors = mutableListOf<SchemaValidationError>()
    val valid = programSchema.validate(data, errors::add)
    return ValidationResult(
        valid = valid,
        errors = errors.map { it.toValidationError() }
    )
}

/**
 * Validates a JSON string against the program schema.
 *
 * @param json The JSON string to validate
 * @return A [ValidationResult] containing validity status and any errors
 */
fun validateProgram(json: String): ValidationResult {
    val element = Json.parseToJsonElement(json)
    return validateProgram(element)
}

/**
 * Checks if a [JsonElement] is a valid program.
 *
 * @param data The JSON element to check
 * @return true if valid, false otherwise
 */
fun isValidProgram(data: JsonElement): Boolean {
    return programSchema.validate(data) { }
}
