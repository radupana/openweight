plugins {
    kotlin("jvm") version "2.2.0"
    kotlin("plugin.serialization") version "2.2.0"
}

group = "com.openweight"
version = "0.1.0"

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.9.0")
    implementation("io.github.optimumcode:json-schema-validator:0.5.3")

    testImplementation(kotlin("test"))
    testImplementation("org.junit.jupiter:junit-jupiter:5.11.3")
    testImplementation("org.junit.jupiter:junit-jupiter-params:5.11.3")
}

// Copy schemas from root schemas/ directory to resources at build time
// This ensures the Kotlin SDK uses the canonical schema definitions
val copySchemas by tasks.registering(Copy::class) {
    from("${projectDir}/../../schemas")
    into("${layout.buildDirectory.get()}/resources/main/schemas")
    include("*.schema.json")
}

tasks.processResources {
    dependsOn(copySchemas)
}

tasks.test {
    useJUnitPlatform()
}

kotlin {
    jvmToolchain(21)
}
