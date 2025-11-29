package com.openweight.model

import kotlinx.serialization.Serializable

@Serializable
data class ProgramWeek(
    val workouts: List<WorkoutTemplate>,
    val name: String? = null,
    val notes: String? = null
)
