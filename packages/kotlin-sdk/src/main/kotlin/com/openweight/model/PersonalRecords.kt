package com.openweight.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class Sex {
    @SerialName("male") MALE,
    @SerialName("female") FEMALE,
    @SerialName("mx") MX
}

@Serializable
enum class E1RMFormula {
    @SerialName("brzycki") BRZYCKI,
    @SerialName("epley") EPLEY,
    @SerialName("lombardi") LOMBARDI,
    @SerialName("mayhew") MAYHEW,
    @SerialName("oconner") OCONNER,
    @SerialName("wathan") WATHAN
}

@Serializable
enum class RepMaxType {
    @SerialName("actual") ACTUAL,
    @SerialName("estimated") ESTIMATED
}

@Serializable
data class Athlete(
    val bodyweightKg: Double? = null,
    val sex: Sex? = null
)

@Serializable
data class RepMax(
    val reps: Int,
    val weight: Double,
    val unit: WeightUnit,
    val date: String,
    val type: RepMaxType? = null,
    val bodyweightKg: Double? = null,
    val workoutId: String? = null,
    val rpe: Double? = null,
    val notes: String? = null
)

@Serializable
data class Estimated1RM(
    val value: Double,
    val unit: WeightUnit,
    val formula: E1RMFormula,
    val basedOnReps: Int,
    val basedOnWeight: Double,
    val date: String? = null
)

@Serializable
data class VolumePR(
    val value: Double,
    val unit: WeightUnit,
    val date: String,
    val notes: String? = null
)

@Serializable
data class DurationPR(
    val seconds: Int,
    val date: String,
    val weight: Double? = null,
    val unit: WeightUnit? = null,
    val notes: String? = null
)

@Serializable
data class ExerciseRecord(
    val exercise: Exercise,
    val repMaxes: List<RepMax>? = null,
    val estimated1RM: Estimated1RM? = null,
    val volumePR: VolumePR? = null,
    val durationPR: DurationPR? = null
)

@Serializable
data class LiftScores(
    val wilks: Double? = null,
    val dots: Double? = null,
    val ipfGl: Double? = null,
    val glossbrenner: Double? = null
)

@Serializable
data class NormalizedScores(
    val squat: LiftScores? = null,
    val bench: LiftScores? = null,
    val deadlift: LiftScores? = null,
    val total: LiftScores? = null
)

@Serializable
data class PersonalRecords(
    val exportedAt: String,
    val records: List<ExerciseRecord>,
    val athlete: Athlete? = null,
    val normalizedScores: NormalizedScores? = null
)
