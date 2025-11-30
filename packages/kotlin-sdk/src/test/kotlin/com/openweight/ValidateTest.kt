package com.openweight

import kotlinx.serialization.json.Json
import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class ValidateTest {

    @Test
    fun `validateWorkoutLog returns valid for correct workout`() {
        val json = """
        {
            "date": "2024-01-15T09:00:00Z",
            "exercises": [{
                "exercise": { "name": "Squat" },
                "sets": [{ "reps": 5, "weight": 100, "unit": "kg" }]
            }]
        }
        """.trimIndent()

        val result = validateWorkoutLog(json)
        assertTrue(result.valid)
        assertTrue(result.errors.isEmpty())
    }

    @Test
    fun `validateWorkoutLog returns valid for minimal workout`() {
        val json = """
        {
            "date": "2024-01-15T09:00:00Z",
            "exercises": [{
                "exercise": { "name": "Push-up" },
                "sets": [{ "reps": 10 }]
            }]
        }
        """.trimIndent()

        val result = validateWorkoutLog(json)
        assertTrue(result.valid)
    }

    @Test
    fun `validateWorkoutLog returns invalid when date is missing`() {
        val json = """
        {
            "exercises": [{
                "exercise": { "name": "Squat" },
                "sets": [{ "reps": 5 }]
            }]
        }
        """.trimIndent()

        val result = validateWorkoutLog(json)
        assertFalse(result.valid)
    }

    @Test
    fun `validateWorkoutLog returns invalid when exercises is missing`() {
        val json = """{"date": "2024-01-15T09:00:00Z"}"""

        val result = validateWorkoutLog(json)
        assertFalse(result.valid)
    }

    @Test
    fun `validateWorkoutLog returns invalid when exercises is empty`() {
        val json = """
        {
            "date": "2024-01-15T09:00:00Z",
            "exercises": []
        }
        """.trimIndent()

        val result = validateWorkoutLog(json)
        assertFalse(result.valid)
    }

    @Test
    fun `validateWorkoutLog returns invalid when weight provided without unit`() {
        val json = """
        {
            "date": "2024-01-15T09:00:00Z",
            "exercises": [{
                "exercise": { "name": "Squat" },
                "sets": [{ "reps": 5, "weight": 100 }]
            }]
        }
        """.trimIndent()

        val result = validateWorkoutLog(json)
        assertFalse(result.valid)
    }

    @Test
    fun `validateWorkoutLog returns invalid when distance provided without distanceUnit`() {
        val json = """
        {
            "date": "2024-01-15T09:00:00Z",
            "exercises": [{
                "exercise": { "name": "Farmer Walk" },
                "sets": [{ "distance": 40 }]
            }]
        }
        """.trimIndent()

        val result = validateWorkoutLog(json)
        assertFalse(result.valid)
    }

    @Test
    fun `validateWorkoutLog returns invalid for invalid unit enum`() {
        val json = """
        {
            "date": "2024-01-15T09:00:00Z",
            "exercises": [{
                "exercise": { "name": "Squat" },
                "sets": [{ "reps": 5, "weight": 100, "unit": "stones" }]
            }]
        }
        """.trimIndent()

        val result = validateWorkoutLog(json)
        assertFalse(result.valid)
    }

    @Test
    fun `isValidWorkoutLog returns true for valid workout`() {
        val element = Json.parseToJsonElement("""
        {
            "date": "2024-01-15T09:00:00Z",
            "exercises": [{
                "exercise": { "name": "Squat" },
                "sets": [{ "reps": 5 }]
            }]
        }
        """.trimIndent())

        assertTrue(isValidWorkoutLog(element))
    }

    @Test
    fun `isValidWorkoutLog returns false for invalid workout`() {
        val element = Json.parseToJsonElement("{}")
        assertFalse(isValidWorkoutLog(element))
    }

    @Test
    fun `validateWorkoutTemplate returns valid for correct template`() {
        val json = """
        {
            "name": "Push Day",
            "exercises": [{
                "exercise": { "name": "Bench Press" },
                "sets": [{ "targetReps": 5 }]
            }]
        }
        """.trimIndent()

        val result = validateWorkoutTemplate(json)
        assertTrue(result.valid)
        assertTrue(result.errors.isEmpty())
    }

    @Test
    fun `validateWorkoutTemplate returns invalid when name is missing`() {
        val json = """
        {
            "exercises": [{
                "exercise": { "name": "Squat" },
                "sets": [{ "targetReps": 5 }]
            }]
        }
        """.trimIndent()

        val result = validateWorkoutTemplate(json)
        assertFalse(result.valid)
    }

    @Test
    fun `validateWorkoutTemplate returns invalid when exercises is missing`() {
        val json = """{"name": "Test"}"""

        val result = validateWorkoutTemplate(json)
        assertFalse(result.valid)
    }

    @Test
    fun `validateWorkoutTemplate returns invalid when targetWeight provided without unit`() {
        val json = """
        {
            "name": "Test",
            "exercises": [{
                "exercise": { "name": "Squat" },
                "sets": [{ "targetWeight": 100 }]
            }]
        }
        """.trimIndent()

        val result = validateWorkoutTemplate(json)
        assertFalse(result.valid)
    }

    @Test
    fun `validateWorkoutTemplate returns invalid when percentage provided without percentageOf`() {
        val json = """
        {
            "name": "Test",
            "exercises": [{
                "exercise": { "name": "Squat" },
                "sets": [{ "percentage": 85 }]
            }]
        }
        """.trimIndent()

        val result = validateWorkoutTemplate(json)
        assertFalse(result.valid)
    }

    @Test
    fun `validateWorkoutTemplate returns valid for percentage with percentageOf`() {
        val json = """
        {
            "name": "Test",
            "exercises": [{
                "exercise": { "name": "Squat" },
                "sets": [{ "percentage": 85, "percentageOf": "1RM" }]
            }]
        }
        """.trimIndent()

        val result = validateWorkoutTemplate(json)
        assertTrue(result.valid)
    }

    @Test
    fun `validateWorkoutTemplate validates day field range`() {
        val validDayJson = """
        {
            "name": "Push Day",
            "exercises": [{
                "exercise": { "name": "Bench" },
                "sets": [{ "targetReps": 5 }]
            }],
            "day": 1
        }
        """.trimIndent()
        assertTrue(validateWorkoutTemplate(validDayJson).valid)

        val invalidDayJson = """
        {
            "name": "Push Day",
            "exercises": [{
                "exercise": { "name": "Bench" },
                "sets": [{ "targetReps": 5 }]
            }],
            "day": 8
        }
        """.trimIndent()
        assertFalse(validateWorkoutTemplate(invalidDayJson).valid)
    }

    @Test
    fun `isValidWorkoutTemplate returns true for valid template`() {
        val element = Json.parseToJsonElement("""
        {
            "name": "Push Day",
            "exercises": [{
                "exercise": { "name": "Bench" },
                "sets": [{ "targetReps": 5 }]
            }]
        }
        """.trimIndent())

        assertTrue(isValidWorkoutTemplate(element))
    }

    @Test
    fun `isValidWorkoutTemplate returns false for invalid template`() {
        val element = Json.parseToJsonElement("{}")
        assertFalse(isValidWorkoutTemplate(element))
    }

    @Test
    fun `validateProgram returns valid for correct program`() {
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

        val result = validateProgram(json)
        assertTrue(result.valid)
        assertTrue(result.errors.isEmpty())
    }

    @Test
    fun `validateProgram returns invalid when name is missing`() {
        val json = """
        {
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

        val result = validateProgram(json)
        assertFalse(result.valid)
    }

    @Test
    fun `validateProgram returns invalid when weeks is missing`() {
        val json = """{"name": "Test Program"}"""

        val result = validateProgram(json)
        assertFalse(result.valid)
    }

    @Test
    fun `validateProgram returns invalid when weeks is empty`() {
        val json = """{"name": "Test Program", "weeks": []}"""

        val result = validateProgram(json)
        assertFalse(result.valid)
    }

    @Test
    fun `validateProgram returns invalid when week workouts is empty`() {
        val json = """
        {
            "name": "Test Program",
            "weeks": [{ "workouts": [] }]
        }
        """.trimIndent()

        val result = validateProgram(json)
        assertFalse(result.valid)
    }

    @Test
    fun `validateProgram validates nested workout templates`() {
        val json = """
        {
            "name": "Test Program",
            "weeks": [{
                "workouts": [{
                    "name": "Day 1",
                    "exercises": [{
                        "exercise": { "name": "Squat" },
                        "sets": [{ "targetWeight": 100 }]
                    }]
                }]
            }]
        }
        """.trimIndent()

        val result = validateProgram(json)
        assertFalse(result.valid)
    }

    @Test
    fun `validateProgram allows optional fields`() {
        val json = """
        {
            "name": "Test Program",
            "weeks": [{
                "workouts": [{
                    "name": "Day 1",
                    "exercises": [{
                        "exercise": { "name": "Squat" },
                        "sets": [{ "targetReps": 5 }]
                    }]
                }]
            }],
            "description": "A great program",
            "author": "John Doe",
            "tags": ["strength", "beginner"]
        }
        """.trimIndent()

        val result = validateProgram(json)
        assertTrue(result.valid)
    }

    @Test
    fun `isValidProgram returns true for valid program`() {
        val element = Json.parseToJsonElement("""
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
        """.trimIndent())

        assertTrue(isValidProgram(element))
    }

    @Test
    fun `isValidProgram returns false for invalid program`() {
        val element = Json.parseToJsonElement("{}")
        assertFalse(isValidProgram(element))
    }

    @Test
    fun `validatePersonalRecords returns valid for correct personal records`() {
        val json = """
        {
            "exportedAt": "2024-01-15T10:00:00Z",
            "records": [{
                "exercise": { "name": "Squat" },
                "repMaxes": [{
                    "reps": 1,
                    "weight": 180,
                    "unit": "kg",
                    "date": "2024-01-15"
                }]
            }]
        }
        """.trimIndent()

        val result = validatePersonalRecords(json)
        assertTrue(result.valid)
        assertTrue(result.errors.isEmpty())
    }

    @Test
    fun `validatePersonalRecords returns invalid when exportedAt is missing`() {
        val json = """
        {
            "records": [{
                "exercise": { "name": "Squat" },
                "repMaxes": [{ "reps": 1, "weight": 180, "unit": "kg", "date": "2024-01-15" }]
            }]
        }
        """.trimIndent()

        val result = validatePersonalRecords(json)
        assertFalse(result.valid)
    }

    @Test
    fun `validatePersonalRecords returns invalid when records is missing`() {
        val json = """{"exportedAt": "2024-01-15T10:00:00Z"}"""

        val result = validatePersonalRecords(json)
        assertFalse(result.valid)
    }

    @Test
    fun `validatePersonalRecords returns invalid for invalid rep max`() {
        val json = """
        {
            "exportedAt": "2024-01-15T10:00:00Z",
            "records": [{
                "exercise": { "name": "Squat" },
                "repMaxes": [{ "reps": 1 }]
            }]
        }
        """.trimIndent()

        val result = validatePersonalRecords(json)
        assertFalse(result.valid)
    }

    @Test
    fun `validatePersonalRecords returns invalid for invalid formula`() {
        val json = """
        {
            "exportedAt": "2024-01-15T10:00:00Z",
            "records": [{
                "exercise": { "name": "Squat" },
                "estimated1RM": {
                    "value": 180,
                    "unit": "kg",
                    "formula": "invalid_formula",
                    "basedOnReps": 5,
                    "basedOnWeight": 155
                }
            }]
        }
        """.trimIndent()

        val result = validatePersonalRecords(json)
        assertFalse(result.valid)
    }

    @Test
    fun `validatePersonalRecords returns valid with athlete data`() {
        val json = """
        {
            "exportedAt": "2024-01-15T10:00:00Z",
            "athlete": { "bodyweightKg": 82.5, "sex": "male" },
            "records": [{
                "exercise": { "name": "Squat" },
                "repMaxes": [{ "reps": 1, "weight": 180, "unit": "kg", "date": "2024-01-15" }]
            }]
        }
        """.trimIndent()

        val result = validatePersonalRecords(json)
        assertTrue(result.valid)
    }

    @Test
    fun `validatePersonalRecords returns invalid for invalid sex`() {
        val json = """
        {
            "exportedAt": "2024-01-15T10:00:00Z",
            "athlete": { "sex": "invalid" },
            "records": [{
                "exercise": { "name": "Squat" },
                "repMaxes": [{ "reps": 1, "weight": 180, "unit": "kg", "date": "2024-01-15" }]
            }]
        }
        """.trimIndent()

        val result = validatePersonalRecords(json)
        assertFalse(result.valid)
    }

    @Test
    fun `isValidPersonalRecords returns true for valid personal records`() {
        val element = Json.parseToJsonElement("""
        {
            "exportedAt": "2024-01-15T10:00:00Z",
            "records": [{
                "exercise": { "name": "Squat" },
                "repMaxes": [{ "reps": 1, "weight": 180, "unit": "kg", "date": "2024-01-15" }]
            }]
        }
        """.trimIndent())

        assertTrue(isValidPersonalRecords(element))
    }

    @Test
    fun `isValidPersonalRecords returns false for invalid personal records`() {
        val element = Json.parseToJsonElement("{}")
        assertFalse(isValidPersonalRecords(element))
    }
}
