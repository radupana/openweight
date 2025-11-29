package com.openweight.model

import kotlinx.serialization.Serializable

@Serializable
data class Program(
    val name: String,
    val weeks: List<ProgramWeek>,
    val description: String? = null,
    val author: String? = null,
    val tags: List<String>? = null
)
