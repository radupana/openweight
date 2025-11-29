import { test, describe } from 'node:test';
import assert from 'node:assert';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

function createValidator() {
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);

  // Load and add the workout-template schema first (referenced by program schema)
  const templateSchemaPath = join(rootDir, 'schemas', 'workout-template.schema.json');
  const templateSchema = JSON.parse(readFileSync(templateSchemaPath, 'utf-8'));
  ajv.addSchema(templateSchema);

  // Load the program schema
  const programSchemaPath = join(rootDir, 'schemas', 'program.schema.json');
  const programSchema = JSON.parse(readFileSync(programSchemaPath, 'utf-8'));
  return ajv.compile(programSchema);
}

describe('program schema', () => {
  const validate = createValidator();

  describe('valid examples', () => {
    const validDir = join(rootDir, 'examples', 'programs');
    const validFiles = readdirSync(validDir).filter(f => f.endsWith('.json'));

    for (const file of validFiles) {
      test(`${file} should be valid`, () => {
        const filePath = join(validDir, file);
        const data = JSON.parse(readFileSync(filePath, 'utf-8'));
        const valid = validate(data);
        assert.strictEqual(valid, true, `Validation errors: ${JSON.stringify(validate.errors)}`);
      });
    }
  });

  describe('invalid examples', () => {
    const invalidDir = join(rootDir, 'examples', 'invalid');
    const programInvalidFiles = readdirSync(invalidDir)
      .filter(f => f.startsWith('program-') && f.endsWith('.json'));

    for (const file of programInvalidFiles) {
      test(`${file} should be invalid`, () => {
        const filePath = join(invalidDir, file);
        const data = JSON.parse(readFileSync(filePath, 'utf-8'));
        const valid = validate(data);
        assert.strictEqual(valid, false, `Expected ${file} to be invalid but it passed`);
      });
    }
  });

  describe('required fields', () => {
    test('name is required', () => {
      const data = {
        weeks: [{
          workouts: [{
            name: 'Workout A',
            exercises: [{ exercise: { name: 'Squat' }, sets: [{ targetReps: 5 }] }]
          }]
        }]
      };
      assert.strictEqual(validate(data), false);
      assert.ok(validate.errors.some(e => e.params?.missingProperty === 'name'));
    });

    test('weeks array is required', () => {
      const data = { name: 'Test Program' };
      assert.strictEqual(validate(data), false);
      assert.ok(validate.errors.some(e => e.params?.missingProperty === 'weeks'));
    });

    test('week.workouts is required', () => {
      const data = {
        name: 'Test Program',
        weeks: [{ name: 'Week 1' }]
      };
      assert.strictEqual(validate(data), false);
    });
  });

  describe('array constraints', () => {
    test('weeks cannot be empty', () => {
      const data = { name: 'Empty Program', weeks: [] };
      assert.strictEqual(validate(data), false);
    });

    test('week.workouts cannot be empty', () => {
      const data = {
        name: 'Test Program',
        weeks: [{ workouts: [] }]
      };
      assert.strictEqual(validate(data), false);
    });
  });

  describe('program fields', () => {
    test('description is valid', () => {
      const data = {
        name: 'Test Program',
        description: 'A detailed description of the program',
        weeks: [{
          workouts: [{
            name: 'Day 1',
            exercises: [{ exercise: { name: 'Squat' }, sets: [{ targetReps: 5 }] }]
          }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });

    test('author is valid', () => {
      const data = {
        name: 'Test Program',
        author: 'John Doe',
        weeks: [{
          workouts: [{
            name: 'Day 1',
            exercises: [{ exercise: { name: 'Squat' }, sets: [{ targetReps: 5 }] }]
          }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });

    test('tags array is valid', () => {
      const data = {
        name: 'Test Program',
        tags: ['strength', 'beginner', 'powerlifting'],
        weeks: [{
          workouts: [{
            name: 'Day 1',
            exercises: [{ exercise: { name: 'Squat' }, sets: [{ targetReps: 5 }] }]
          }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });
  });

  describe('program week fields', () => {
    test('week name is valid', () => {
      const data = {
        name: 'Test Program',
        weeks: [{
          name: 'Week 1 - Introduction',
          workouts: [{
            name: 'Day 1',
            exercises: [{ exercise: { name: 'Squat' }, sets: [{ targetReps: 5 }] }]
          }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });

    test('week notes are valid', () => {
      const data = {
        name: 'Test Program',
        weeks: [{
          notes: 'Focus on form this week',
          workouts: [{
            name: 'Day 1',
            exercises: [{ exercise: { name: 'Squat' }, sets: [{ targetReps: 5 }] }]
          }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });
  });

  describe('multi-week programs', () => {
    test('multiple weeks are valid', () => {
      const data = {
        name: '4-Week Program',
        weeks: [
          {
            name: 'Week 1',
            workouts: [{
              name: 'Day 1',
              exercises: [{ exercise: { name: 'Squat' }, sets: [{ targetReps: 5 }] }]
            }]
          },
          {
            name: 'Week 2',
            workouts: [{
              name: 'Day 1',
              exercises: [{ exercise: { name: 'Squat' }, sets: [{ targetReps: 5 }] }]
            }]
          },
          {
            name: 'Week 3',
            workouts: [{
              name: 'Day 1',
              exercises: [{ exercise: { name: 'Squat' }, sets: [{ targetReps: 3 }] }]
            }]
          },
          {
            name: 'Week 4 - Deload',
            workouts: [{
              name: 'Day 1',
              exercises: [{ exercise: { name: 'Squat' }, sets: [{ targetReps: 5 }] }]
            }]
          }
        ]
      };
      assert.strictEqual(validate(data), true);
    });

    test('multiple workouts per week are valid', () => {
      const data = {
        name: 'Full Body 3x/Week',
        weeks: [{
          workouts: [
            {
              name: 'Monday',
              day: 1,
              exercises: [{ exercise: { name: 'Squat' }, sets: [{ targetReps: 5 }] }]
            },
            {
              name: 'Wednesday',
              day: 3,
              exercises: [{ exercise: { name: 'Bench Press' }, sets: [{ targetReps: 5 }] }]
            },
            {
              name: 'Friday',
              day: 5,
              exercises: [{ exercise: { name: 'Deadlift' }, sets: [{ targetReps: 5 }] }]
            }
          ]
        }]
      };
      assert.strictEqual(validate(data), true);
    });
  });

  describe('workout template validation in program', () => {
    test('workout templates are validated', () => {
      const data = {
        name: 'Test Program',
        weeks: [{
          workouts: [{
            name: 'Day 1',
            exercises: [{ exercise: { name: 'Squat' }, sets: [] }] // Empty sets should fail
          }]
        }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('targetWeight requires unit in program workouts', () => {
      const data = {
        name: 'Test Program',
        weeks: [{
          workouts: [{
            name: 'Day 1',
            exercises: [{
              exercise: { name: 'Squat' },
              sets: [{ targetWeight: 100 }] // Missing unit
            }]
          }]
        }]
      };
      assert.strictEqual(validate(data), false);
    });
  });

  describe('extensibility', () => {
    test('additionalProperties are allowed at program level', () => {
      const data = {
        name: 'Test Program',
        'app:programId': 'abc123',
        weeks: [{
          workouts: [{
            name: 'Day 1',
            exercises: [{ exercise: { name: 'Squat' }, sets: [{ targetReps: 5 }] }]
          }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });

    test('additionalProperties are allowed at week level', () => {
      const data = {
        name: 'Test Program',
        weeks: [{
          'app:weekNumber': 1,
          workouts: [{
            name: 'Day 1',
            exercises: [{ exercise: { name: 'Squat' }, sets: [{ targetReps: 5 }] }]
          }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });
  });
});
