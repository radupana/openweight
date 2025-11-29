package com.openweight.model

import kotlinx.serialization.Serializable

@Serializable
data class ExerciseLog(
    val exercise: Exercise,
    val sets: List<SetLog>,
    val order: Int? = null,
    val notes: String? = null,
    val supersetId: Int? = null
)
