package com.openweight.model

import kotlinx.serialization.Serializable

@Serializable
data class WorkoutLog(
    val date: String,
    val exercises: List<ExerciseLog>,
    val name: String? = null,
    val notes: String? = null,
    val durationSeconds: Int? = null,
    val templateId: String? = null
)
