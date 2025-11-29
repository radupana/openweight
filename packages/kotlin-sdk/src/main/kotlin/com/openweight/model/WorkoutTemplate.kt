package com.openweight.model

import kotlinx.serialization.Serializable

@Serializable
data class WorkoutTemplate(
    val name: String,
    val exercises: List<ExerciseTemplate>,
    val notes: String? = null,
    val day: Int? = null
)
