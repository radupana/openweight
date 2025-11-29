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
  const schemaPath = join(rootDir, 'schemas', 'workout-template.schema.json');
  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  return ajv.compile(schema);
}

describe('workout-template schema', () => {
  const validate = createValidator();

  describe('valid examples', () => {
    const validDir = join(rootDir, 'examples', 'workout-templates');
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
    const templateInvalidFiles = readdirSync(invalidDir)
      .filter(f => f.startsWith('template-') && f.endsWith('.json'));

    for (const file of templateInvalidFiles) {
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
        exercises: [{ exercise: { name: 'Squat' }, sets: [{ targetReps: 5 }] }]
      };
      assert.strictEqual(validate(data), false);
      assert.ok(validate.errors.some(e => e.params?.missingProperty === 'name'));
    });

    test('exercises array is required', () => {
      const data = { name: 'Test Template' };
      assert.strictEqual(validate(data), false);
      assert.ok(validate.errors.some(e => e.params?.missingProperty === 'exercises'));
    });

    test('exercise.name is required', () => {
      const data = {
        name: 'Test Template',
        exercises: [{ exercise: {}, sets: [{ targetReps: 5 }] }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('sets array is required in exercise template', () => {
      const data = {
        name: 'Test Template',
        exercises: [{ exercise: { name: 'Squat' } }]
      };
      assert.strictEqual(validate(data), false);
    });
  });

  describe('array constraints', () => {
    test('exercises cannot be empty', () => {
      const data = { name: 'Empty Template', exercises: [] };
      assert.strictEqual(validate(data), false);
    });

    test('sets cannot be empty', () => {
      const data = {
        name: 'Test Template',
        exercises: [{ exercise: { name: 'Squat' }, sets: [] }]
      };
      assert.strictEqual(validate(data), false);
    });
  });

  describe('set template fields', () => {
    test('targetReps is valid', () => {
      const data = {
        name: 'Test',
        exercises: [{
          exercise: { name: 'Squat' },
          sets: [{ targetReps: 5 }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });

    test('rep range (targetRepsMin/Max) is valid', () => {
      const data = {
        name: 'Test',
        exercises: [{
          exercise: { name: 'Squat' },
          sets: [{ targetRepsMin: 8, targetRepsMax: 12 }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });

    test('targetWeight requires unit', () => {
      const data = {
        name: 'Test',
        exercises: [{
          exercise: { name: 'Squat' },
          sets: [{ targetWeight: 100 }]
        }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('targetWeight with unit is valid', () => {
      const data = {
        name: 'Test',
        exercises: [{
          exercise: { name: 'Squat' },
          sets: [{ targetWeight: 100, unit: 'kg' }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });

    test('percentage requires percentageOf', () => {
      const data = {
        name: 'Test',
        exercises: [{
          exercise: { name: 'Squat' },
          sets: [{ percentage: 85 }]
        }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('percentage with percentageOf is valid', () => {
      const data = {
        name: 'Test',
        exercises: [{
          exercise: { name: 'Squat' },
          sets: [{ percentage: 85, percentageOf: '1RM' }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });

    test('targetRPE must be between 0 and 10', () => {
      const data = {
        name: 'Test',
        exercises: [{
          exercise: { name: 'Squat' },
          sets: [{ targetReps: 5, targetRPE: 11 }]
        }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('targetRPE allows decimals', () => {
      const data = {
        name: 'Test',
        exercises: [{
          exercise: { name: 'Squat' },
          sets: [{ targetReps: 5, targetRPE: 7.5 }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });

    test('tempo must match pattern', () => {
      const data = {
        name: 'Test',
        exercises: [{
          exercise: { name: 'Squat' },
          sets: [{ targetReps: 5, tempo: '3-1-2-0' }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });

    test('invalid tempo format is rejected', () => {
      const data = {
        name: 'Test',
        exercises: [{
          exercise: { name: 'Squat' },
          sets: [{ targetReps: 5, tempo: '3110' }]
        }]
      };
      assert.strictEqual(validate(data), false);
    });
  });

  describe('day field', () => {
    test('day must be between 1 and 7', () => {
      const data = {
        name: 'Test',
        day: 8,
        exercises: [{ exercise: { name: 'Squat' }, sets: [{ targetReps: 5 }] }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('day 0 is invalid', () => {
      const data = {
        name: 'Test',
        day: 0,
        exercises: [{ exercise: { name: 'Squat' }, sets: [{ targetReps: 5 }] }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('day 1-7 are valid', () => {
      for (let day = 1; day <= 7; day++) {
        const data = {
          name: 'Test',
          day,
          exercises: [{ exercise: { name: 'Squat' }, sets: [{ targetReps: 5 }] }]
        };
        assert.strictEqual(validate(data), true, `Day ${day} should be valid`);
      }
    });
  });

  describe('superset support', () => {
    test('supersetId groups exercises', () => {
      const data = {
        name: 'Superset Test',
        exercises: [
          { exercise: { name: 'Bench Press' }, supersetId: 1, sets: [{ targetReps: 10 }] },
          { exercise: { name: 'Bent Over Row' }, supersetId: 1, sets: [{ targetReps: 10 }] }
        ]
      };
      assert.strictEqual(validate(data), true);
    });

    test('supersetId must be at least 1', () => {
      const data = {
        name: 'Test',
        exercises: [{
          exercise: { name: 'Squat' },
          supersetId: 0,
          sets: [{ targetReps: 5 }]
        }]
      };
      assert.strictEqual(validate(data), false);
    });
  });

  describe('extensibility', () => {
    test('additionalProperties are allowed at root', () => {
      const data = {
        name: 'Test',
        exercises: [{ exercise: { name: 'Squat' }, sets: [{ targetReps: 5 }] }],
        'app:templateId': 'abc123'
      };
      assert.strictEqual(validate(data), true);
    });

    test('additionalProperties are allowed on set template', () => {
      const data = {
        name: 'Test',
        exercises: [{
          exercise: { name: 'Squat' },
          sets: [{ targetReps: 5, 'app:videoDemo': 'https://example.com' }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });
  });
});
