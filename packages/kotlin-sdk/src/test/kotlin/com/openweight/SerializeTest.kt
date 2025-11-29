package com.openweight

import com.openweight.model.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class SerializeTest {

    @Test
    fun `serializeWorkoutLog produces valid JSON`() {
        val workout = WorkoutLog(
            date = "2024-01-15T09:00:00Z",
            exercises = listOf(
                ExerciseLog(
                    exercise = Exercise(name = "Squat"),
                    sets = listOf(SetLog(reps = 5, weight = 100.0, unit = WeightUnit.KG))
                )
            )
        )

        val json = serializeWorkoutLog(workout)
        assertTrue(json.contains("2024-01-15T09:00:00Z"))
        assertTrue(json.contains("Squat"))
        assertTrue(json.contains("100"))
    }

    @Test
    fun `serializeWorkoutLogPretty produces formatted JSON`() {
        val workout = WorkoutLog(
            date = "2024-01-15T09:00:00Z",
            exercises = listOf(
                ExerciseLog(
                    exercise = Exercise(name = "Squat"),
                    sets = listOf(SetLog(reps = 5))
                )
            )
        )

        val json = serializeWorkoutLogPretty(workout)
        assertTrue(json.contains("\n"))
        assertTrue(json.contains("  "))
    }

    @Test
    fun `serializeWorkoutLog omits null fields`() {
        val workout = WorkoutLog(
            date = "2024-01-15T09:00:00Z",
            exercises = listOf(
                ExerciseLog(
                    exercise = Exercise(name = "Squat"),
                    sets = listOf(SetLog(reps = 5))
                )
            )
        )

        val json = serializeWorkoutLog(workout)
        assertTrue(!json.contains("notes"))
        assertTrue(!json.contains("durationSeconds"))
    }

    @Test
    fun `serializeWorkoutTemplate produces valid JSON`() {
        val template = WorkoutTemplate(
            name = "Push Day",
            exercises = listOf(
                ExerciseTemplate(
                    exercise = Exercise(name = "Bench Press"),
                    sets = listOf(SetTemplate(targetReps = 5))
                )
            )
        )

        val json = serializeWorkoutTemplate(template)
        assertTrue(json.contains("Push Day"))
        assertTrue(json.contains("Bench Press"))
    }

    @Test
    fun `serializeWorkoutTemplatePretty produces formatted JSON`() {
        val template = WorkoutTemplate(
            name = "Push Day",
            exercises = listOf(
                ExerciseTemplate(
                    exercise = Exercise(name = "Bench Press"),
                    sets = listOf(SetTemplate(targetReps = 5))
                )
            )
        )

        val json = serializeWorkoutTemplatePretty(template)
        assertTrue(json.contains("\n"))
    }

    @Test
    fun `serializeProgram produces valid JSON`() {
        val program = Program(
            name = "Simple Program",
            weeks = listOf(
                ProgramWeek(
                    workouts = listOf(
                        WorkoutTemplate(
                            name = "Day 1",
                            exercises = listOf(
                                ExerciseTemplate(
                                    exercise = Exercise(name = "Squat"),
                                    sets = listOf(SetTemplate(targetReps = 5))
                                )
                            )
                        )
                    )
                )
            )
        )

        val json = serializeProgram(program)
        assertTrue(json.contains("Simple Program"))
        assertTrue(json.contains("Day 1"))
    }

    @Test
    fun `serializeProgramPretty produces formatted JSON`() {
        val program = Program(
            name = "Simple Program",
            weeks = listOf(
                ProgramWeek(
                    workouts = listOf(
                        WorkoutTemplate(
                            name = "Day 1",
                            exercises = listOf(
                                ExerciseTemplate(
                                    exercise = Exercise(name = "Squat"),
                                    sets = listOf(SetTemplate(targetReps = 5))
                                )
                            )
                        )
                    )
                )
            )
        )

        val json = serializeProgramPretty(program)
        assertTrue(json.contains("\n"))
    }

    @Test
    fun `roundtrip workout log preserves data`() {
        val original = WorkoutLog(
            date = "2024-01-15T09:00:00Z",
            exercises = listOf(
                ExerciseLog(
                    exercise = Exercise(name = "Squat", equipment = "Barbell"),
                    sets = listOf(SetLog(reps = 5, weight = 100.0, unit = WeightUnit.KG))
                )
            ),
            name = "Morning Workout"
        )

        val json = serializeWorkoutLog(original)
        val parsed = parseWorkoutLog(json)

        assertEquals(original.date, parsed.date)
        assertEquals(original.name, parsed.name)
        assertEquals(original.exercises.size, parsed.exercises.size)
        assertEquals(original.exercises[0].exercise.name, parsed.exercises[0].exercise.name)
    }

    @Test
    fun `roundtrip workout template preserves data`() {
        val original = WorkoutTemplate(
            name = "Push Day",
            exercises = listOf(
                ExerciseTemplate(
                    exercise = Exercise(name = "Bench Press"),
                    sets = listOf(SetTemplate(targetReps = 5, percentage = 85.0, percentageOf = "1RM"))
                )
            ),
            day = 1
        )

        val json = serializeWorkoutTemplate(original)
        val parsed = parseWorkoutTemplate(json)

        assertEquals(original.name, parsed.name)
        assertEquals(original.day, parsed.day)
        assertEquals(original.exercises[0].sets[0].percentage, parsed.exercises[0].sets[0].percentage)
    }

    @Test
    fun `roundtrip program preserves data`() {
        val original = Program(
            name = "Simple Program",
            weeks = listOf(
                ProgramWeek(
                    workouts = listOf(
                        WorkoutTemplate(
                            name = "Day 1",
                            exercises = listOf(
                                ExerciseTemplate(
                                    exercise = Exercise(name = "Squat"),
                                    sets = listOf(SetTemplate(targetReps = 5))
                                )
                            )
                        )
                    ),
                    name = "Week 1"
                )
            ),
            description = "A simple program",
            author = "Test Author"
        )

        val json = serializeProgram(original)
        val parsed = parseProgram(json)

        assertEquals(original.name, parsed.name)
        assertEquals(original.description, parsed.description)
        assertEquals(original.author, parsed.author)
        assertEquals(original.weeks[0].name, parsed.weeks[0].name)
    }
}
