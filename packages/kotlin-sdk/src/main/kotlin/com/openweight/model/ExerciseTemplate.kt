package com.openweight.model

import kotlinx.serialization.Serializable

@Serializable
data class ExerciseTemplate(
    val exercise: Exercise,
    val sets: List<SetTemplate>,
    val order: Int? = null,
    val notes: String? = null,
    val supersetId: Int? = null
)
