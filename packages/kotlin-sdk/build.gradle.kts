plugins {
    kotlin("jvm") version "2.2.0"
    kotlin("plugin.serialization") version "2.2.21"
    id("com.vanniktech.maven.publish") version "0.30.0"
}

group = "io.github.radupana"
version = "0.1.1"

mavenPublishing {
    publishToMavenCentral(com.vanniktech.maven.publish.SonatypeHost.CENTRAL_PORTAL)
    signAllPublications()

    coordinates("io.github.radupana", "openweight-sdk", version.toString())

    pom {
        name.set("openweight-sdk")
        description.set("Kotlin SDK for openweight - parse, validate, and serialize workout data")
        url.set("https://github.com/radupana/openweight")

        licenses {
            license {
                name.set("Apache-2.0")
                url.set("https://www.apache.org/licenses/LICENSE-2.0")
            }
        }

        developers {
            developer {
                id.set("radupana")
                name.set("Radu Pana")
                url.set("https://github.com/radupana")
            }
        }

        scm {
            url.set("https://github.com/radupana/openweight")
            connection.set("scm:git:git://github.com/radupana/openweight.git")
            developerConnection.set("scm:git:ssh://github.com/radupana/openweight.git")
        }
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.9.0")
    implementation("io.github.optimumcode:json-schema-validator:0.5.3")

    testImplementation(kotlin("test"))
    testImplementation("org.junit.jupiter:junit-jupiter:6.0.1")
    testImplementation("org.junit.jupiter:junit-jupiter-params:6.0.1")
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
