export interface JSONSchema {
  $ref?: string
  $id?: string
  title?: string
  description?: string
  type?: string | string[]
  properties?: Record<string, JSONSchema>
  items?: JSONSchema
  definitions?: Record<string, JSONSchema>
  required?: string[]
  additionalProperties?: boolean
  enum?: (string | number | boolean)[]
  format?: string
  pattern?: string
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  minItems?: number
  maxItems?: number
  examples?: unknown[]
  allOf?: JSONSchema[]
  if?: JSONSchema
  then?: JSONSchema
}

export interface Constraint {
  label: string
  value: string | number | boolean | (string | number | boolean)[]
}

export interface ConditionalRequirement {
  condition: string
  required: string[]
}

export function resolveRef(rootSchema: JSONSchema, ref: string): JSONSchema | null {
  if (ref.startsWith('#/definitions/')) {
    const defName = ref.replace('#/definitions/', '')
    return rootSchema.definitions?.[defName] ?? null
  }
  return null
}

export function isExternalRef(ref: string): boolean {
  return !ref.startsWith('#')
}

export function getRefName(ref: string): string {
  if (ref.startsWith('#/definitions/')) {
    return ref.replace('#/definitions/', '')
  }
  return ref.replace('.schema.json', '')
}

export function getPropertyType(prop: JSONSchema): string {
  if (prop.$ref) return 'ref'
  if (Array.isArray(prop.type)) return prop.type.join(' | ')
  return prop.type ?? 'unknown'
}

export function getConstraints(prop: JSONSchema): Constraint[] {
  const constraints: Constraint[] = []

  if (prop.format !== undefined) {
    constraints.push({ label: 'format', value: prop.format })
  }
  if (prop.enum !== undefined) {
    constraints.push({ label: 'enum', value: prop.enum })
  }
  if (prop.pattern !== undefined) {
    constraints.push({ label: 'pattern', value: prop.pattern })
  }
  if (prop.minimum !== undefined) {
    constraints.push({ label: 'min', value: prop.minimum })
  }
  if (prop.maximum !== undefined) {
    constraints.push({ label: 'max', value: prop.maximum })
  }
  if (prop.minLength !== undefined) {
    constraints.push({ label: 'minLength', value: prop.minLength })
  }
  if (prop.maxLength !== undefined) {
    constraints.push({ label: 'maxLength', value: prop.maxLength })
  }
  if (prop.minItems !== undefined) {
    constraints.push({ label: 'minItems', value: prop.minItems })
  }
  if (prop.maxItems !== undefined) {
    constraints.push({ label: 'maxItems', value: prop.maxItems })
  }

  return constraints
}

export function getConditionalRequirements(prop: JSONSchema): ConditionalRequirement[] {
  const conditionals: ConditionalRequirement[] = []

  if (!prop.allOf) return conditionals

  for (const item of prop.allOf) {
    if (item.if?.required && item.then?.required) {
      conditionals.push({
        condition: item.if.required.join(', '),
        required: item.then.required
      })
    }
  }

  return conditionals
}

export function shouldExpandByDefault(path: string, level: number): boolean {
  const depth = path.split('.').length - 1
  return depth < level
}
