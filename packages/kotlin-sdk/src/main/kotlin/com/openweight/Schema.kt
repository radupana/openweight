package com.openweight

internal object Schemas {
    val workoutLog: String by lazy { loadSchema("workout-log.schema.json") }
    val workoutTemplate: String by lazy { loadSchema("workout-template.schema.json") }
    val program: String by lazy { loadSchema("program.schema.json") }

    private fun loadSchema(filename: String): String {
        return Schemas::class.java.getResourceAsStream("/schemas/$filename")
            ?.bufferedReader()
            ?.readText()
            ?: throw IllegalStateException("Schema not found: $filename")
    }
}
