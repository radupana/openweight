package com.openweight

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class ParseTest {

    @Test
    fun `parseWorkoutLog parses valid JSON`() {
        val json = """
        {
            "date": "2024-01-15T09:00:00Z",
            "exercises": [{
                "exercise": { "name": "Squat" },
                "sets": [{ "reps": 5, "weight": 100, "unit": "kg" }]
            }]
        }
        """.trimIndent()

        val result = parseWorkoutLog(json)
        assertEquals("2024-01-15T09:00:00Z", result.date)
        assertEquals(1, result.exercises.size)
        assertEquals("Squat", result.exercises[0].exercise.name)
    }

    @Test
    fun `parseWorkoutLog throws ParseException for invalid JSON`() {
        val exception = assertFailsWith<ParseException> {
            parseWorkoutLog("not json")
        }
        assertTrue(exception.message!!.contains("Invalid JSON"))
    }

    @Test
    fun `parseWorkoutLog throws ParseException for schema validation failures`() {
        val json = """{"date": "2024-01-15T09:00:00Z"}"""
        val exception = assertFailsWith<ParseException> {
            parseWorkoutLog(json)
        }
        assertTrue(exception.errors.isNotEmpty())
    }

    @Test
    fun `parseWorkoutLog includes validation errors in ParseException`() {
        val json = """{"date": "2024-01-15T09:00:00Z"}"""
        val exception = assertFailsWith<ParseException> {
            parseWorkoutLog(json)
        }
        assertTrue(exception.errors.isNotEmpty())
        assertTrue(exception.errors.any { it.message.contains("exercises") })
    }

    @Test
    fun `parseWorkoutTemplate parses valid template JSON`() {
        val json = """
        {
            "name": "Push Day",
            "exercises": [{
                "exercise": { "name": "Bench Press" },
                "sets": [{ "targetReps": 5 }]
            }]
        }
        """.trimIndent()

        val result = parseWorkoutTemplate(json)
        assertEquals("Push Day", result.name)
        assertEquals(1, result.exercises.size)
        assertEquals("Bench Press", result.exercises[0].exercise.name)
    }

    @Test
    fun `parseWorkoutTemplate throws ParseException for invalid JSON`() {
        assertFailsWith<ParseException> {
            parseWorkoutTemplate("not json")
        }
    }

    @Test
    fun `parseWorkoutTemplate throws ParseException for schema validation failures`() {
        val json = """{"name": "Test"}"""
        val exception = assertFailsWith<ParseException> {
            parseWorkoutTemplate(json)
        }
        assertTrue(exception.errors.isNotEmpty())
    }

    @Test
    fun `parseProgram parses valid program JSON`() {
        val json = """
        {
            "name": "Simple Program",
            "weeks": [{
                "workouts": [{
                    "name": "Day 1",
                    "exercises": [{
                        "exercise": { "name": "Squat" },
                        "sets": [{ "targetReps": 5 }]
                    }]
                }]
            }]
        }
        """.trimIndent()

        val result = parseProgram(json)
        assertEquals("Simple Program", result.name)
        assertEquals(1, result.weeks.size)
        assertEquals(1, result.weeks[0].workouts.size)
        assertEquals("Day 1", result.weeks[0].workouts[0].name)
    }

    @Test
    fun `parseProgram throws ParseException for invalid JSON`() {
        assertFailsWith<ParseException> {
            parseProgram("not json")
        }
    }

    @Test
    fun `parseProgram throws ParseException for schema validation failures`() {
        val json = """{"name": "Test"}"""
        val exception = assertFailsWith<ParseException> {
            parseProgram(json)
        }
        assertTrue(exception.errors.isNotEmpty())
    }
}
