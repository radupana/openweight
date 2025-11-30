import { test, describe } from 'node:test';
import assert from 'node:assert';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

function createValidator(schemaName) {
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  const schemaPath = join(rootDir, 'schemas', `${schemaName}.schema.json`);
  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  return ajv.compile(schema);
}

describe('workout-log schema', () => {
  const validate = createValidator('workout-log');

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

describe('personal-records schema', () => {
  const validate = createValidator('personal-records');

  describe('valid examples', () => {
    const validDir = join(rootDir, 'examples', 'personal-records');
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
    const invalidFiles = readdirSync(invalidDir).filter(f => f.startsWith('pr-') && f.endsWith('.json'));

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
    test('exportedAt is required', () => {
      const data = { records: [] };
      assert.strictEqual(validate(data), false);
      assert.ok(validate.errors.some(e => e.params?.missingProperty === 'exportedAt'));
    });

    test('records array is required', () => {
      const data = { exportedAt: '2024-01-15T10:00:00Z' };
      assert.strictEqual(validate(data), false);
      assert.ok(validate.errors.some(e => e.params?.missingProperty === 'records'));
    });

    test('exercise.name is required in records', () => {
      const data = {
        exportedAt: '2024-01-15T10:00:00Z',
        records: [{ exercise: {} }]
      };
      assert.strictEqual(validate(data), false);
    });
  });

  describe('repMax validation', () => {
    test('repMax requires reps, weight, unit, date', () => {
      const data = {
        exportedAt: '2024-01-15T10:00:00Z',
        records: [{
          exercise: { name: 'Squat' },
          repMaxes: [{ reps: 1, weight: 180 }]
        }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('valid repMax passes', () => {
      const data = {
        exportedAt: '2024-01-15T10:00:00Z',
        records: [{
          exercise: { name: 'Squat' },
          repMaxes: [{ reps: 1, weight: 180, unit: 'kg', date: '2024-01-15' }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });

    test('reps must be at least 1', () => {
      const data = {
        exportedAt: '2024-01-15T10:00:00Z',
        records: [{
          exercise: { name: 'Squat' },
          repMaxes: [{ reps: 0, weight: 180, unit: 'kg', date: '2024-01-15' }]
        }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('type must be actual or estimated', () => {
      const data = {
        exportedAt: '2024-01-15T10:00:00Z',
        records: [{
          exercise: { name: 'Squat' },
          repMaxes: [{ reps: 1, weight: 180, unit: 'kg', date: '2024-01-15', type: 'guess' }]
        }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('rpe must be between 0 and 10', () => {
      const data = {
        exportedAt: '2024-01-15T10:00:00Z',
        records: [{
          exercise: { name: 'Squat' },
          repMaxes: [{ reps: 1, weight: 180, unit: 'kg', date: '2024-01-15', rpe: 11 }]
        }]
      };
      assert.strictEqual(validate(data), false);
    });
  });

  describe('estimated1RM validation', () => {
    test('estimated1RM requires value, unit, formula, basedOnReps, basedOnWeight', () => {
      const data = {
        exportedAt: '2024-01-15T10:00:00Z',
        records: [{
          exercise: { name: 'Squat' },
          estimated1RM: { value: 185, unit: 'kg' }
        }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('formula must be valid enum', () => {
      const data = {
        exportedAt: '2024-01-15T10:00:00Z',
        records: [{
          exercise: { name: 'Squat' },
          estimated1RM: {
            value: 185,
            unit: 'kg',
            formula: 'invalid',
            basedOnReps: 5,
            basedOnWeight: 160
          }
        }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('valid estimated1RM passes', () => {
      const data = {
        exportedAt: '2024-01-15T10:00:00Z',
        records: [{
          exercise: { name: 'Squat' },
          estimated1RM: {
            value: 185,
            unit: 'kg',
            formula: 'brzycki',
            basedOnReps: 5,
            basedOnWeight: 160
          }
        }]
      };
      assert.strictEqual(validate(data), true);
    });
  });

  describe('volumePR validation', () => {
    test('volumePR requires value, unit, date', () => {
      const data = {
        exportedAt: '2024-01-15T10:00:00Z',
        records: [{
          exercise: { name: 'Squat' },
          volumePR: { value: 8500 }
        }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('valid volumePR passes', () => {
      const data = {
        exportedAt: '2024-01-15T10:00:00Z',
        records: [{
          exercise: { name: 'Squat' },
          volumePR: { value: 8500, unit: 'kg', date: '2024-01-15' }
        }]
      };
      assert.strictEqual(validate(data), true);
    });
  });

  describe('durationPR validation', () => {
    test('durationPR requires seconds and date', () => {
      const data = {
        exportedAt: '2024-01-15T10:00:00Z',
        records: [{
          exercise: { name: 'Plank' },
          durationPR: { seconds: 180 }
        }]
      };
      assert.strictEqual(validate(data), false);
    });

    test('valid durationPR passes', () => {
      const data = {
        exportedAt: '2024-01-15T10:00:00Z',
        records: [{
          exercise: { name: 'Plank' },
          durationPR: { seconds: 180, date: '2024-01-15' }
        }]
      };
      assert.strictEqual(validate(data), true);
    });

    test('durationPR with weight requires unit', () => {
      const data = {
        exportedAt: '2024-01-15T10:00:00Z',
        records: [{
          exercise: { name: 'Weighted Plank' },
          durationPR: { seconds: 60, date: '2024-01-15', weight: 20 }
        }]
      };
      assert.strictEqual(validate(data), true);
    });
  });

  describe('athlete validation', () => {
    test('sex must be valid enum', () => {
      const data = {
        exportedAt: '2024-01-15T10:00:00Z',
        athlete: { sex: 'other' },
        records: []
      };
      assert.strictEqual(validate(data), false);
    });

    test('valid sex values pass', () => {
      for (const sex of ['male', 'female', 'mx']) {
        const data = {
          exportedAt: '2024-01-15T10:00:00Z',
          athlete: { sex },
          records: []
        };
        assert.strictEqual(validate(data), true, `sex: ${sex} should be valid`);
      }
    });

    test('bodyweightKg must be non-negative', () => {
      const data = {
        exportedAt: '2024-01-15T10:00:00Z',
        athlete: { bodyweightKg: -5 },
        records: []
      };
      assert.strictEqual(validate(data), false);
    });
  });

  describe('normalizedScores validation', () => {
    test('normalized scores accept wilks and dots', () => {
      const data = {
        exportedAt: '2024-01-15T10:00:00Z',
        records: [],
        normalizedScores: {
          squat: { wilks: 145.2, dots: 148.5 },
          total: { wilks: 406.2, dots: 414.6 }
        }
      };
      assert.strictEqual(validate(data), true);
    });

    test('normalized scores accept ipfGl and glossbrenner', () => {
      const data = {
        exportedAt: '2024-01-15T10:00:00Z',
        records: [],
        normalizedScores: {
          squat: { ipfGl: 150, glossbrenner: 148 }
        }
      };
      assert.strictEqual(validate(data), true);
    });
  });

  describe('extensibility', () => {
    test('additionalProperties allowed at root', () => {
      const data = {
        exportedAt: '2024-01-15T10:00:00Z',
        records: [],
        'app:customField': 'value'
      };
      assert.strictEqual(validate(data), true);
    });

    test('additionalProperties allowed on exercise', () => {
      const data = {
        exportedAt: '2024-01-15T10:00:00Z',
        records: [{
          exercise: { name: 'Squat', 'app:id': '123' }
        }]
      };
      assert.strictEqual(validate(data), true);
    });

    test('additionalProperties allowed on repMax', () => {
      const data = {
        exportedAt: '2024-01-15T10:00:00Z',
        records: [{
          exercise: { name: 'Squat' },
          repMaxes: [{
            reps: 1,
            weight: 180,
            unit: 'kg',
            date: '2024-01-15',
            'app:videoUrl': 'https://example.com'
          }]
        }]
      };
      assert.strictEqual(validate(data), true);
    });
  });
});
