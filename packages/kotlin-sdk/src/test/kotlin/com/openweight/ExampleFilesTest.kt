package com.openweight

import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class ExampleFilesTest {

    private fun loadResource(path: String): String {
        return ExampleFilesTest::class.java.getResourceAsStream(path)
            ?.bufferedReader()
            ?.readText()
            ?: throw IllegalStateException("Resource not found: $path")
    }

    @Test
    fun `minimal workout-log example is valid`() {
        val json = loadResource("/examples/workout-logs/minimal.json")
        val result = validateWorkoutLog(json)
        assertTrue(result.valid, "Expected minimal.json to be valid: ${result.errors}")
    }

    @Test
    fun `simple-strength workout-log example is valid`() {
        val json = loadResource("/examples/workout-logs/simple-strength.json")
        val result = validateWorkoutLog(json)
        assertTrue(result.valid, "Expected simple-strength.json to be valid: ${result.errors}")
    }

    @Test
    fun `full-featured workout-log example is valid`() {
        val json = loadResource("/examples/workout-logs/full-featured.json")
        val result = validateWorkoutLog(json)
        assertTrue(result.valid, "Expected full-featured.json to be valid: ${result.errors}")
    }

    @Test
    fun `superset-workout example is valid`() {
        val json = loadResource("/examples/workout-logs/superset-workout.json")
        val result = validateWorkoutLog(json)
        assertTrue(result.valid, "Expected superset-workout.json to be valid: ${result.errors}")
    }

    @Test
    fun `hypertrophy-session example is valid`() {
        val json = loadResource("/examples/workout-logs/hypertrophy-session.json")
        val result = validateWorkoutLog(json)
        assertTrue(result.valid, "Expected hypertrophy-session.json to be valid: ${result.errors}")
    }

    @Test
    fun `timed-exercises example is valid`() {
        val json = loadResource("/examples/workout-logs/timed-exercises.json")
        val result = validateWorkoutLog(json)
        assertTrue(result.valid, "Expected timed-exercises.json to be valid: ${result.errors}")
    }

    @Test
    fun `carries-and-distance example is valid`() {
        val json = loadResource("/examples/workout-logs/carries-and-distance.json")
        val result = validateWorkoutLog(json)
        assertTrue(result.valid, "Expected carries-and-distance.json to be valid: ${result.errors}")
    }

    @Test
    fun `tempo-training example is valid`() {
        val json = loadResource("/examples/workout-logs/tempo-training.json")
        val result = validateWorkoutLog(json)
        assertTrue(result.valid, "Expected tempo-training.json to be valid: ${result.errors}")
    }

    @Test
    fun `minimal workout-template example is valid`() {
        val json = loadResource("/examples/workout-templates/minimal.json")
        val result = validateWorkoutTemplate(json)
        assertTrue(result.valid, "Expected minimal.json to be valid: ${result.errors}")
    }

    @Test
    fun `full-featured workout-template example is valid`() {
        val json = loadResource("/examples/workout-templates/full-featured.json")
        val result = validateWorkoutTemplate(json)
        assertTrue(result.valid, "Expected full-featured.json to be valid: ${result.errors}")
    }

    @Test
    fun `percentage-based workout-template example is valid`() {
        val json = loadResource("/examples/workout-templates/percentage-based.json")
        val result = validateWorkoutTemplate(json)
        assertTrue(result.valid, "Expected percentage-based.json to be valid: ${result.errors}")
    }

    @Test
    fun `minimal program example is valid`() {
        val json = loadResource("/examples/programs/minimal.json")
        val result = validateProgram(json)
        assertTrue(result.valid, "Expected minimal.json to be valid: ${result.errors}")
    }

    @Test
    fun `531-bbb program example is valid`() {
        val json = loadResource("/examples/programs/531-bbb.json")
        val result = validateProgram(json)
        assertTrue(result.valid, "Expected 531-bbb.json to be valid: ${result.errors}")
    }

    @Test
    fun `missing-date example is invalid`() {
        val json = loadResource("/examples/invalid/missing-date.json")
        val result = validateWorkoutLog(json)
        assertFalse(result.valid, "Expected missing-date.json to be invalid")
    }

    @Test
    fun `missing-exercises example is invalid`() {
        val json = loadResource("/examples/invalid/missing-exercises.json")
        val result = validateWorkoutLog(json)
        assertFalse(result.valid, "Expected missing-exercises.json to be invalid")
    }

    @Test
    fun `missing-exercise-name example is invalid`() {
        val json = loadResource("/examples/invalid/missing-exercise-name.json")
        val result = validateWorkoutLog(json)
        assertFalse(result.valid, "Expected missing-exercise-name.json to be invalid")
    }

    @Test
    fun `empty-exercises example is invalid`() {
        val json = loadResource("/examples/invalid/empty-exercises.json")
        val result = validateWorkoutLog(json)
        assertFalse(result.valid, "Expected empty-exercises.json to be invalid")
    }

    @Test
    fun `empty-sets example is invalid`() {
        val json = loadResource("/examples/invalid/empty-sets.json")
        val result = validateWorkoutLog(json)
        assertFalse(result.valid, "Expected empty-sets.json to be invalid")
    }

    @Test
    fun `weight-without-unit example is invalid`() {
        val json = loadResource("/examples/invalid/weight-without-unit.json")
        val result = validateWorkoutLog(json)
        assertFalse(result.valid, "Expected weight-without-unit.json to be invalid")
    }

    @Test
    fun `distance-without-unit example is invalid`() {
        val json = loadResource("/examples/invalid/distance-without-unit.json")
        val result = validateWorkoutLog(json)
        assertFalse(result.valid, "Expected distance-without-unit.json to be invalid")
    }

    @Test
    fun `invalid-unit example is invalid`() {
        val json = loadResource("/examples/invalid/invalid-unit.json")
        val result = validateWorkoutLog(json)
        assertFalse(result.valid, "Expected invalid-unit.json to be invalid")
    }

    @Test
    fun `template-missing-name example is invalid`() {
        val json = loadResource("/examples/invalid/template-missing-name.json")
        val result = validateWorkoutTemplate(json)
        assertFalse(result.valid, "Expected template-missing-name.json to be invalid")
    }

    @Test
    fun `template-empty-exercises example is invalid`() {
        val json = loadResource("/examples/invalid/template-empty-exercises.json")
        val result = validateWorkoutTemplate(json)
        assertFalse(result.valid, "Expected template-empty-exercises.json to be invalid")
    }

    @Test
    fun `template-weight-without-unit example is invalid`() {
        val json = loadResource("/examples/invalid/template-weight-without-unit.json")
        val result = validateWorkoutTemplate(json)
        assertFalse(result.valid, "Expected template-weight-without-unit.json to be invalid")
    }

    @Test
    fun `program-missing-weeks example is invalid`() {
        val json = loadResource("/examples/invalid/program-missing-weeks.json")
        val result = validateProgram(json)
        assertFalse(result.valid, "Expected program-missing-weeks.json to be invalid")
    }

    @Test
    fun `program-empty-weeks example is invalid`() {
        val json = loadResource("/examples/invalid/program-empty-weeks.json")
        val result = validateProgram(json)
        assertFalse(result.valid, "Expected program-empty-weeks.json to be invalid")
    }

    @Test
    fun `valid workout-log examples can be parsed and roundtripped`() {
        val examples = listOf(
            "/examples/workout-logs/minimal.json",
            "/examples/workout-logs/simple-strength.json"
        )

        for (path in examples) {
            val json = loadResource(path)
            val parsed = parseWorkoutLog(json)
            val serialized = serializeWorkoutLog(parsed)
            val reparsed = parseWorkoutLog(serialized)
            assertTrue(validateWorkoutLog(serialized).valid, "Roundtrip of $path should be valid")
        }
    }

    @Test
    fun `valid workout-template examples can be parsed and roundtripped`() {
        val examples = listOf(
            "/examples/workout-templates/minimal.json"
        )

        for (path in examples) {
            val json = loadResource(path)
            val parsed = parseWorkoutTemplate(json)
            val serialized = serializeWorkoutTemplate(parsed)
            assertTrue(validateWorkoutTemplate(serialized).valid, "Roundtrip of $path should be valid")
        }
    }

    @Test
    fun `valid program examples can be parsed and roundtripped`() {
        val examples = listOf(
            "/examples/programs/minimal.json"
        )

        for (path in examples) {
            val json = loadResource(path)
            val parsed = parseProgram(json)
            val serialized = serializeProgram(parsed)
            assertTrue(validateProgram(serialized).valid, "Roundtrip of $path should be valid")
        }
    }
}
