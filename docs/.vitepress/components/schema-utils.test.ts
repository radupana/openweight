import { describe, it, expect } from 'vitest'
import {
  resolveRef,
  isExternalRef,
  getRefName,
  getPropertyType,
  getConstraints,
  getConditionalRequirements,
  shouldExpandByDefault,
  type JSONSchema
} from './schema-utils'

const mockSchema: JSONSchema = {
  $id: 'test-schema',
  type: 'object',
  definitions: {
    Exercise: {
      title: 'Exercise',
      type: 'object',
      properties: {
        name: { type: 'string' }
      }
    },
    SetLog: {
      title: 'SetLog',
      type: 'object',
      properties: {
        reps: { type: 'integer', minimum: 0 }
      }
    }
  }
}

describe('resolveRef', () => {
  it('resolves local definition references', () => {
    const result = resolveRef(mockSchema, '#/definitions/Exercise')
    expect(result).toEqual(mockSchema.definitions?.Exercise)
  })

  it('resolves another local definition', () => {
    const result = resolveRef(mockSchema, '#/definitions/SetLog')
    expect(result).toEqual(mockSchema.definitions?.SetLog)
  })

  it('returns null for non-existent definitions', () => {
    const result = resolveRef(mockSchema, '#/definitions/NonExistent')
    expect(result).toBeNull()
  })

  it('returns null for external references', () => {
    const result = resolveRef(mockSchema, 'workout-template.schema.json')
    expect(result).toBeNull()
  })

  it('returns null for schema without definitions', () => {
    const result = resolveRef({ type: 'object' }, '#/definitions/Exercise')
    expect(result).toBeNull()
  })
})

describe('isExternalRef', () => {
  it('returns false for local references', () => {
    expect(isExternalRef('#/definitions/Exercise')).toBe(false)
  })

  it('returns true for external schema references', () => {
    expect(isExternalRef('workout-template.schema.json')).toBe(true)
  })

  it('returns true for relative path references', () => {
    expect(isExternalRef('./other-schema.json')).toBe(true)
  })
})

describe('getRefName', () => {
  it('extracts name from local definition ref', () => {
    expect(getRefName('#/definitions/Exercise')).toBe('Exercise')
  })

  it('extracts name from external schema ref', () => {
    expect(getRefName('workout-template.schema.json')).toBe('workout-template')
  })

  it('handles refs without .schema.json suffix', () => {
    expect(getRefName('other-file.json')).toBe('other-file.json')
  })
})

describe('getPropertyType', () => {
  it('returns ref for $ref properties', () => {
    expect(getPropertyType({ $ref: '#/definitions/Exercise' })).toBe('ref')
  })

  it('returns the type for simple types', () => {
    expect(getPropertyType({ type: 'string' })).toBe('string')
    expect(getPropertyType({ type: 'integer' })).toBe('integer')
    expect(getPropertyType({ type: 'number' })).toBe('number')
    expect(getPropertyType({ type: 'boolean' })).toBe('boolean')
    expect(getPropertyType({ type: 'array' })).toBe('array')
    expect(getPropertyType({ type: 'object' })).toBe('object')
  })

  it('handles union types', () => {
    expect(getPropertyType({ type: ['string', 'null'] })).toBe('string | null')
  })

  it('returns unknown for missing type', () => {
    expect(getPropertyType({})).toBe('unknown')
  })
})

describe('getConstraints', () => {
  it('returns empty array for property with no constraints', () => {
    expect(getConstraints({ type: 'string' })).toEqual([])
  })

  it('extracts format constraint', () => {
    const constraints = getConstraints({ type: 'string', format: 'date-time' })
    expect(constraints).toContainEqual({ label: 'format', value: 'date-time' })
  })

  it('extracts enum constraint', () => {
    const constraints = getConstraints({ type: 'string', enum: ['kg', 'lb'] })
    expect(constraints).toContainEqual({ label: 'enum', value: ['kg', 'lb'] })
  })

  it('extracts pattern constraint', () => {
    const constraints = getConstraints({ type: 'string', pattern: '^[0-9X]-[0-9X]-[0-9X]-[0-9X]$' })
    expect(constraints).toContainEqual({ label: 'pattern', value: '^[0-9X]-[0-9X]-[0-9X]-[0-9X]$' })
  })

  it('extracts numeric constraints', () => {
    const constraints = getConstraints({ type: 'number', minimum: 0, maximum: 10 })
    expect(constraints).toContainEqual({ label: 'min', value: 0 })
    expect(constraints).toContainEqual({ label: 'max', value: 10 })
  })

  it('extracts string length constraints', () => {
    const constraints = getConstraints({ type: 'string', minLength: 1, maxLength: 200 })
    expect(constraints).toContainEqual({ label: 'minLength', value: 1 })
    expect(constraints).toContainEqual({ label: 'maxLength', value: 200 })
  })

  it('extracts array item constraints', () => {
    const constraints = getConstraints({ type: 'array', minItems: 1, maxItems: 10 })
    expect(constraints).toContainEqual({ label: 'minItems', value: 1 })
    expect(constraints).toContainEqual({ label: 'maxItems', value: 10 })
  })

  it('extracts multiple constraints', () => {
    const constraints = getConstraints({
      type: 'integer',
      minimum: 0,
      maximum: 100,
      format: 'int32'
    })
    expect(constraints).toHaveLength(3)
  })
})

describe('getConditionalRequirements', () => {
  it('returns empty array for property without allOf', () => {
    expect(getConditionalRequirements({ type: 'object' })).toEqual([])
  })

  it('extracts if/then conditional requirements', () => {
    const schema: JSONSchema = {
      type: 'object',
      allOf: [
        {
          if: { required: ['weight'] },
          then: { required: ['unit'] }
        }
      ]
    }
    const conditionals = getConditionalRequirements(schema)
    expect(conditionals).toHaveLength(1)
    expect(conditionals[0]).toEqual({
      condition: 'weight',
      required: ['unit']
    })
  })

  it('extracts multiple conditional requirements', () => {
    const schema: JSONSchema = {
      type: 'object',
      allOf: [
        {
          if: { required: ['weight'] },
          then: { required: ['unit'] }
        },
        {
          if: { required: ['distance'] },
          then: { required: ['distanceUnit'] }
        }
      ]
    }
    const conditionals = getConditionalRequirements(schema)
    expect(conditionals).toHaveLength(2)
  })

  it('ignores allOf items without if/then', () => {
    const schema: JSONSchema = {
      type: 'object',
      allOf: [
        { type: 'object' },
        {
          if: { required: ['weight'] },
          then: { required: ['unit'] }
        }
      ]
    }
    const conditionals = getConditionalRequirements(schema)
    expect(conditionals).toHaveLength(1)
  })
})

describe('shouldExpandByDefault', () => {
  it('expands root level when level is 1', () => {
    expect(shouldExpandByDefault('root', 1)).toBe(true)
  })

  it('does not expand nested paths when level is 1', () => {
    expect(shouldExpandByDefault('root.exercises', 1)).toBe(false)
  })

  it('expands two levels deep when level is 2', () => {
    expect(shouldExpandByDefault('root', 2)).toBe(true)
    expect(shouldExpandByDefault('root.exercises', 2)).toBe(true)
  })

  it('does not expand third level when level is 2', () => {
    expect(shouldExpandByDefault('root.exercises.items', 2)).toBe(false)
  })

  it('expands deeply when level is high', () => {
    expect(shouldExpandByDefault('root.a.b.c.d', 5)).toBe(true)
    expect(shouldExpandByDefault('root.a.b.c.d.e', 5)).toBe(false)
  })
})
