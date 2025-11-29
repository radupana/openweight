package com.openweight.model

import kotlinx.serialization.Serializable

@Serializable
data class SetLog(
    val reps: Int? = null,
    val weight: Double? = null,
    val unit: WeightUnit? = null,
    val durationSeconds: Int? = null,
    val distance: Double? = null,
    val distanceUnit: DistanceUnit? = null,
    val rpe: Double? = null,
    val rir: Int? = null,
    val toFailure: Boolean? = null,
    val type: String? = null,
    val restSeconds: Int? = null,
    val tempo: String? = null,
    val notes: String? = null
)
