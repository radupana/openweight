package com.openweight

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource
import kotlin.test.Test

class ExampleFilesTest {

    private fun loadResource(path: String): String {
        return ExampleFilesTest::class.java.getResourceAsStream(path)
            ?.bufferedReader()
            ?.readText()
            ?: throw IllegalStateException("Resource not found: $path")
    }

    @ParameterizedTest(name = "workout-log {0} should be valid")
    @ValueSource(strings = [
        "minimal",
        "simple-strength",
        "full-featured",
        "superset-workout",
        "hypertrophy-session",
        "timed-exercises",
        "carries-and-distance",
        "tempo-training",
        "bodyweight-workout"
    ])
    fun `valid workout-log examples`(filename: String) {
        val json = loadResource("/examples/workout-logs/$filename.json")
        val result = validateWorkoutLog(json)
        assertTrue(result.valid, "Expected $filename.json to be valid: ${result.errors}")
    }

    @ParameterizedTest(name = "workout-template {0} should be valid")
    @ValueSource(strings = [
        "minimal",
        "full-featured",
        "percentage-based"
    ])
    fun `valid workout-template examples`(filename: String) {
        val json = loadResource("/examples/workout-templates/$filename.json")
        val result = validateWorkoutTemplate(json)
        assertTrue(result.valid, "Expected $filename.json to be valid: ${result.errors}")
    }

    @ParameterizedTest(name = "program {0} should be valid")
    @ValueSource(strings = [
        "minimal",
        "531-bbb"
    ])
    fun `valid program examples`(filename: String) {
        val json = loadResource("/examples/programs/$filename.json")
        val result = validateProgram(json)
        assertTrue(result.valid, "Expected $filename.json to be valid: ${result.errors}")
    }

    @ParameterizedTest(name = "invalid workout-log {0} should fail validation")
    @ValueSource(strings = [
        "missing-date",
        "missing-exercises",
        "missing-exercise-name",
        "empty-exercises",
        "empty-sets",
        "weight-without-unit",
        "distance-without-unit",
        "invalid-unit"
    ])
    fun `invalid workout-log examples`(filename: String) {
        val json = loadResource("/examples/invalid/$filename.json")
        val result = validateWorkoutLog(json)
        assertFalse(result.valid, "Expected $filename.json to be invalid")
    }

    @ParameterizedTest(name = "invalid workout-template {0} should fail validation")
    @ValueSource(strings = [
        "template-missing-name",
        "template-empty-exercises",
        "template-weight-without-unit"
    ])
    fun `invalid workout-template examples`(filename: String) {
        val json = loadResource("/examples/invalid/$filename.json")
        val result = validateWorkoutTemplate(json)
        assertFalse(result.valid, "Expected $filename.json to be invalid")
    }

    @ParameterizedTest(name = "invalid program {0} should fail validation")
    @ValueSource(strings = [
        "program-missing-weeks",
        "program-empty-weeks"
    ])
    fun `invalid program examples`(filename: String) {
        val json = loadResource("/examples/invalid/$filename.json")
        val result = validateProgram(json)
        assertFalse(result.valid, "Expected $filename.json to be invalid")
    }

    @ParameterizedTest(name = "workout-log {0} roundtrip")
    @ValueSource(strings = [
        "minimal",
        "simple-strength"
    ])
    fun `workout-log roundtrip`(filename: String) {
        val json = loadResource("/examples/workout-logs/$filename.json")
        val parsed = parseWorkoutLog(json)
        val serialized = serializeWorkoutLog(parsed)
        assertTrue(validateWorkoutLog(serialized).valid, "Roundtrip of $filename.json should be valid")
    }

    @Test
    fun `workout-template roundtrip`() {
        val json = loadResource("/examples/workout-templates/minimal.json")
        val parsed = parseWorkoutTemplate(json)
        val serialized = serializeWorkoutTemplate(parsed)
        assertTrue(validateWorkoutTemplate(serialized).valid, "Roundtrip should be valid")
    }

    @Test
    fun `program roundtrip`() {
        val json = loadResource("/examples/programs/minimal.json")
        val parsed = parseProgram(json)
        val serialized = serializeProgram(parsed)
        assertTrue(validateProgram(serialized).valid, "Roundtrip should be valid")
    }

    @ParameterizedTest(name = "lifter-profile {0} should be valid")
    @ValueSource(strings = [
        "minimal",
        "full-featured",
        "imperial-units"
    ])
    fun `valid lifter-profile examples`(filename: String) {
        val json = loadResource("/examples/lifter-profiles/$filename.json")
        val result = validateLifterProfile(json)
        assertTrue(result.valid, "Expected $filename.json to be valid: ${result.errors}")
    }

    @ParameterizedTest(name = "invalid lifter-profile {0} should fail validation")
    @ValueSource(strings = [
        "profile-missing-exported-at",
        "profile-invalid-rep-max",
        "profile-invalid-formula",
        "profile-invalid-sex",
        "profile-invalid-height-unit"
    ])
    fun `invalid lifter-profile examples`(filename: String) {
        val json = loadResource("/examples/invalid/$filename.json")
        val result = validateLifterProfile(json)
        assertFalse(result.valid, "Expected $filename.json to be invalid")
    }

    @ParameterizedTest(name = "lifter-profile {0} roundtrip")
    @ValueSource(strings = [
        "minimal",
        "full-featured"
    ])
    fun `lifter-profile roundtrip`(filename: String) {
        val json = loadResource("/examples/lifter-profiles/$filename.json")
        val parsed = parseLifterProfile(json)
        val serialized = serializeLifterProfile(parsed)
        assertTrue(validateLifterProfile(serialized).valid, "Roundtrip of $filename.json should be valid")
    }
}
