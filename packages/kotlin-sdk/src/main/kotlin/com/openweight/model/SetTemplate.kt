package com.openweight.model

import kotlinx.serialization.Serializable

@Serializable
data class SetTemplate(
    val targetReps: Int? = null,
    val targetRepsMin: Int? = null,
    val targetRepsMax: Int? = null,
    val targetWeight: Double? = null,
    val unit: WeightUnit? = null,
    val percentage: Double? = null,
    val percentageOf: String? = null,
    val targetRPE: Double? = null,
    val targetRIR: Int? = null,
    val restSeconds: Int? = null,
    val tempo: String? = null,
    val type: String? = null,
    val notes: String? = null
)
