#!/usr/bin/env node

/**
 * Generates src/schema.ts from the canonical JSON schemas in ../../schemas/
 * This ensures the TypeScript SDK uses the same schemas as the root definitions.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const schemasDir = join(__dirname, '../../../schemas')
const outputFile = join(__dirname, '../src/schema.ts')

// Map schema filenames to export names
const schemaMap = {
  'workout-log.schema.json': 'workoutLogSchema',
  'workout-template.schema.json': 'workoutTemplateSchema',
  'program.schema.json': 'programSchema',
}

function generate() {
  const schemas = readdirSync(schemasDir)
    .filter((f) => f.endsWith('.schema.json'))
    .sort()

  let output = `// AUTO-GENERATED FILE - DO NOT EDIT
// Generated from schemas/ by scripts/generate-schemas.js
// Run: npm run generate:schemas

`

  for (const filename of schemas) {
    const exportName = schemaMap[filename]
    if (!exportName) {
      console.warn(`Warning: No export name mapped for ${filename}, skipping`)
      continue
    }

    const schemaPath = join(schemasDir, filename)
    const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'))
    const schemaJson = JSON.stringify(schema, null, 2)

    output += `export const ${exportName} = ${schemaJson} as const\n\n`
  }

  writeFileSync(outputFile, output.trimEnd() + '\n')
  console.log(`Generated ${outputFile}`)
}

generate()
