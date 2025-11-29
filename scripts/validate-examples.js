import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

function loadSchema(name) {
  const schemaPath = join(rootDir, 'schemas', `${name}.schema.json`);
  return JSON.parse(readFileSync(schemaPath, 'utf-8'));
}

function createValidators() {
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);

  // Load workout-template schema first (referenced by program)
  const templateSchema = loadSchema('workout-template');
  ajv.addSchema(templateSchema);

  // Load workout-log schema
  const workoutLogSchema = loadSchema('workout-log');

  // Load program schema
  const programSchema = loadSchema('program');

  return {
    'workout-log': ajv.compile(workoutLogSchema),
    'workout-template': ajv.compile(templateSchema),
    'program': ajv.compile(programSchema)
  };
}

const validators = createValidators();

let exitCode = 0;

// Validate workout-logs
const workoutLogsDir = join(rootDir, 'examples', 'workout-logs');
console.log('Validating workout-logs...\n');

const workoutLogFiles = readdirSync(workoutLogsDir).filter(f => f.endsWith('.json'));
for (const file of workoutLogFiles) {
  const filePath = join(workoutLogsDir, file);
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  const valid = validators['workout-log'](data);

  if (valid) {
    console.log(`✓ ${file}`);
  } else {
    console.log(`✗ ${file} - SHOULD BE VALID`);
    console.log(`  Errors: ${JSON.stringify(validators['workout-log'].errors, null, 2)}`);
    exitCode = 1;
  }
}

// Validate workout-templates
const templatesDir = join(rootDir, 'examples', 'workout-templates');
if (existsSync(templatesDir)) {
  console.log('\nValidating workout-templates...\n');

  const templateFiles = readdirSync(templatesDir).filter(f => f.endsWith('.json'));
  for (const file of templateFiles) {
    const filePath = join(templatesDir, file);
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    const valid = validators['workout-template'](data);

    if (valid) {
      console.log(`✓ ${file}`);
    } else {
      console.log(`✗ ${file} - SHOULD BE VALID`);
      console.log(`  Errors: ${JSON.stringify(validators['workout-template'].errors, null, 2)}`);
      exitCode = 1;
    }
  }
}

// Validate programs
const programsDir = join(rootDir, 'examples', 'programs');
if (existsSync(programsDir)) {
  console.log('\nValidating programs...\n');

  const programFiles = readdirSync(programsDir).filter(f => f.endsWith('.json'));
  for (const file of programFiles) {
    const filePath = join(programsDir, file);
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    const valid = validators['program'](data);

    if (valid) {
      console.log(`✓ ${file}`);
    } else {
      console.log(`✗ ${file} - SHOULD BE VALID`);
      console.log(`  Errors: ${JSON.stringify(validators['program'].errors, null, 2)}`);
      exitCode = 1;
    }
  }
}

// Validate invalid examples
const invalidDir = join(rootDir, 'examples', 'invalid');
console.log('\nValidating invalid examples (should fail)...\n');

const invalidFiles = readdirSync(invalidDir).filter(f => f.endsWith('.json'));
for (const file of invalidFiles) {
  const filePath = join(invalidDir, file);
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));

  // Determine which validator to use based on filename
  let validator;
  let schemaName;
  if (file.startsWith('template-')) {
    validator = validators['workout-template'];
    schemaName = 'workout-template';
  } else if (file.startsWith('program-')) {
    validator = validators['program'];
    schemaName = 'program';
  } else {
    validator = validators['workout-log'];
    schemaName = 'workout-log';
  }

  const valid = validator(data);

  if (!valid) {
    console.log(`✓ ${file} - correctly rejected (${schemaName})`);
  } else {
    console.log(`✗ ${file} - SHOULD BE INVALID but passed (${schemaName})`);
    exitCode = 1;
  }
}

console.log('');
process.exit(exitCode);
