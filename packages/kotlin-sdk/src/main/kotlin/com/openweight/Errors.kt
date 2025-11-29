package com.openweight

/**
 * Represents a single validation error with its JSON path location and message.
 *
 * @property path The JSON path where the error occurred (e.g., "/exercises/0/sets")
 * @property message A description of the validation error
 */
data class ValidationError(
    val path: String,
    val message: String
)

/**
 * The result of a validation operation.
 *
 * @property valid Whether the data passed validation
 * @property errors List of validation errors (empty if valid)
 */
data class ValidationResult(
    val valid: Boolean,
    val errors: List<ValidationError>
)

/**
 * Exception thrown when parsing fails due to invalid JSON or schema validation errors.
 *
 * @property errors List of validation errors that caused the parse to fail (empty for JSON syntax errors)
 */
class ParseException(
    message: String,
    val errors: List<ValidationError> = emptyList()
) : Exception(message)
