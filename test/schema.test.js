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
  const schemaPath = join(rootDir, 'schemas', 'workout-log.schema.json');
  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  return ajv.compile(schema);
}

describe('workout-log schema', () => {
  const validate = createValidator();

  describe('valid examples', () => {
    const validDir = join(rootDir, 'examples', 'workout-logs');
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
    const invalidFiles = readdirSync(invalidDir).filter(f => f.endsWith('.json'));

    for (const file of invalidFiles) {
      test(`${file} should be invalid`, () => {
        const filePath = join(invalidDir, file);
        const data = JSON.parse(readFileSync(filePath, 'utf-8'));
        const valid = validate(data);
        assert.strictEqual(valid, false, `Expected ${file} to be invalid but it passed`);
      });
    }
  });

  describe('required fields', () => {
    test('date is required', () => {
      const data = {
        exercises: [{ exercise: { name: 'Squat' }, sets: [{ reps: 5 }] }]
      };
      assert.strictEqual(validate(data), false);
      assert.ok(validate.errors.some(e => e.params?.missingProperty === 'date'));
    });

    test('exercises array is required', () => {
      const data = { date: '2024-01-15T10:00:00Z' };
      assert.strictEqual(validate(data), false);
      assert.ok(validate.errors.some(e => e.params?.missingProperty === 'exercises'));
    });

    test('exercise.name is required', () => {
      const data = {
        date: '2024-01-15T10:00:00Z',
        exercises: [{ exercise: {}, sets: [{ reps: 5 }] }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('sets array is required', () => {
      const data = {
        date: '2024-01-15T10:00:00Z',
        exercises: [{ exercise: { name: 'Squat' } }]
      };
      assert.strictEqual(validate(data), false);
    });
  });

  describe('array constraints', () => {
    test('exercises cannot be empty', () => {
      const data = { date: '2024-01-15T10:00:00Z', exercises: [] };
      assert.strictEqual(validate(data), false);
    });

    test('sets cannot be empty', () => {
      const data = {
        date: '2024-01-15T10:00:00Z',
        exercises: [{ exercise: { name: 'Squat' }, sets: [] }]
      };
      assert.strictEqual(validate(data), false);
    });
  });

  describe('field constraints', () => {
    test('rpe must be between 0 and 10', () => {
      const data = {
        date: '2024-01-15T10:00:00Z',
        exercises: [{
          exercise: { name: 'Squat' },
          sets: [{ reps: 5, rpe: 11 }]
        }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('rpe allows decimals', () => {
      const data = {
        date: '2024-01-15T10:00:00Z',
        exercises: [{
          exercise: { name: 'Squat' },
          sets: [{ reps: 5, rpe: 7.5 }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });

    test('unit must be kg or lb', () => {
      const data = {
        date: '2024-01-15T10:00:00Z',
        exercises: [{
          exercise: { name: 'Squat' },
          sets: [{ reps: 5, weight: 100, unit: 'pounds' }]
        }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('distanceUnit must be valid', () => {
      const data = {
        date: '2024-01-15T10:00:00Z',
        exercises: [{
          exercise: { name: 'Farmer Walk' },
          sets: [{ distance: 40, distanceUnit: 'meters' }]
        }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('tempo must match pattern', () => {
      const data = {
        date: '2024-01-15T10:00:00Z',
        exercises: [{
          exercise: { name: 'Squat' },
          sets: [{ reps: 5, tempo: '3-1-2-0' }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });

    test('tempo with X for explosive is valid', () => {
      const data = {
        date: '2024-01-15T10:00:00Z',
        exercises: [{
          exercise: { name: 'Squat' },
          sets: [{ reps: 5, tempo: '2-0-X-0' }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });

    test('invalid tempo format is rejected', () => {
      const data = {
        date: '2024-01-15T10:00:00Z',
        exercises: [{
          exercise: { name: 'Squat' },
          sets: [{ reps: 5, tempo: '3110' }]
        }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('order must be at least 1', () => {
      const data = {
        date: '2024-01-15T10:00:00Z',
        exercises: [{
          exercise: { name: 'Squat' },
          order: 0,
          sets: [{ reps: 5 }]
        }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('supersetId must be at least 1', () => {
      const data = {
        date: '2024-01-15T10:00:00Z',
        exercises: [{
          exercise: { name: 'Squat' },
          supersetId: 0,
          sets: [{ reps: 5 }]
        }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('weight requires unit', () => {
      const data = {
        date: '2024-01-15T10:00:00Z',
        exercises: [{
          exercise: { name: 'Squat' },
          sets: [{ reps: 5, weight: 100 }]
        }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('weight with unit is valid', () => {
      const data = {
        date: '2024-01-15T10:00:00Z',
        exercises: [{
          exercise: { name: 'Squat' },
          sets: [{ reps: 5, weight: 100, unit: 'kg' }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });

    test('distance requires distanceUnit', () => {
      const data = {
        date: '2024-01-15T10:00:00Z',
        exercises: [{
          exercise: { name: 'Farmer Walk' },
          sets: [{ distance: 40 }]
        }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('distance with distanceUnit is valid', () => {
      const data = {
        date: '2024-01-15T10:00:00Z',
        exercises: [{
          exercise: { name: 'Farmer Walk' },
          sets: [{ distance: 40, distanceUnit: 'm' }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });
  });

  describe('extensibility', () => {
    test('additionalProperties are allowed at root', () => {
      const data = {
        date: '2024-01-15T10:00:00Z',
        exercises: [{ exercise: { name: 'Squat' }, sets: [{ reps: 5 }] }],
        'featherweight:templateId': 'abc123'
      };
      assert.strictEqual(validate(data), true);
    });

    test('additionalProperties are allowed on exercise', () => {
      const data = {
        date: '2024-01-15T10:00:00Z',
        exercises: [{
          exercise: { name: 'Squat', 'app:customField': 'value' },
          sets: [{ reps: 5 }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });

    test('additionalProperties are allowed on set', () => {
      const data = {
        date: '2024-01-15T10:00:00Z',
        exercises: [{
          exercise: { name: 'Squat' },
          sets: [{ reps: 5, 'app:videoUrl': 'https://example.com' }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });
  });
});
