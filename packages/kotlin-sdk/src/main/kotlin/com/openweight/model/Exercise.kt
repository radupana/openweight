package com.openweight.model

import kotlinx.serialization.Serializable

@Serializable
data class Exercise(
    val name: String,
    val equipment: String? = null,
    val category: String? = null,
    val musclesWorked: List<String>? = null
)
