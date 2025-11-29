package com.openweight

data class ValidationError(
    val path: String,
    val message: String
)

data class ValidationResult(
    val valid: Boolean,
    val errors: List<ValidationError>
)

class ParseException(
    message: String,
    val errors: List<ValidationError> = emptyList()
) : Exception(message)
