import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const schemaPath = join(rootDir, 'schemas', 'workout-log.schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
const validate = ajv.compile(schema);

const validDir = join(rootDir, 'examples', 'workout-logs');
const invalidDir = join(rootDir, 'examples', 'invalid');

let exitCode = 0;

console.log('Validating valid examples...\n');

const validFiles = readdirSync(validDir).filter(f => f.endsWith('.json'));
for (const file of validFiles) {
  const filePath = join(validDir, file);
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  const valid = validate(data);

  if (valid) {
    console.log(`✓ ${file}`);
  } else {
    console.log(`✗ ${file} - SHOULD BE VALID`);
    console.log(`  Errors: ${JSON.stringify(validate.errors, null, 2)}`);
    exitCode = 1;
  }
}

console.log('\nValidating invalid examples (should fail)...\n');

const invalidFiles = readdirSync(invalidDir).filter(f => f.endsWith('.json'));
for (const file of invalidFiles) {
  const filePath = join(invalidDir, file);
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  const valid = validate(data);

  if (!valid) {
    console.log(`✓ ${file} - correctly rejected`);
  } else {
    console.log(`✗ ${file} - SHOULD BE INVALID but passed`);
    exitCode = 1;
  }
}

console.log('');
process.exit(exitCode);
