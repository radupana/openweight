package com.openweight.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class Sex {
    @SerialName("male") MALE,
    @SerialName("female") FEMALE
}

@Serializable
enum class HeightUnit {
    @SerialName("cm") CM,
    @SerialName("in") IN
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
data class Height(
    val value: Double,
    val unit: HeightUnit
)

@Serializable
data class Bodyweight(
    val value: Double,
    val unit: WeightUnit,
    val date: String? = null
)

@Serializable
data class BodyweightEntry(
    val value: Double,
    val unit: WeightUnit,
    val date: String,
    val notes: String? = null
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
data class LifterProfile(
    val exportedAt: String,
    val name: String? = null,
    val sex: Sex? = null,
    val birthDate: String? = null,
    val height: Height? = null,
    val bodyweight: Bodyweight? = null,
    val bodyweightHistory: List<BodyweightEntry>? = null,
    val records: List<ExerciseRecord>? = null,
    val normalizedScores: NormalizedScores? = null
)
