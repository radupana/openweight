<script setup lang="ts">
import { computed, inject, provide, type Ref } from 'vue'
import type { JSONSchema, Constraint, ConditionalRequirement } from './schema-utils'
import {
  resolveRef,
  isExternalRef,
  getRefName,
  getPropertyType,
  getConstraints,
  getConditionalRequirements,
  shouldExpandByDefault
} from './schema-utils'

const props = defineProps<{
  name: string
  schema: JSONSchema
  path: string
  isRequired: boolean
  isArrayItem?: boolean
}>()

const rootSchemaRef = inject<Ref<JSONSchema | null>>('rootSchema')!
const expansionLevel = inject<number>('expansionLevel', 2)
const parentVisitedRefs = inject<Set<string>>('visitedRefs')!

const visitedRefs = computed(() => {
  const newSet = new Set(parentVisitedRefs)
  if (props.schema.$ref) {
    newSet.add(props.schema.$ref)
  }
  return newSet
})

provide('visitedRefs', visitedRefs.value)

const isExpanded = computed(() => shouldExpandByDefault(props.path, expansionLevel))

const resolved = computed<JSONSchema | null>(() => {
  if (!props.schema.$ref) return props.schema
  if (isExternalRef(props.schema.$ref)) return null
  if (parentVisitedRefs.has(props.schema.$ref)) return null
  const root = rootSchemaRef.value
  if (!root) return null
  return resolveRef(root, props.schema.$ref)
})

const displaySchema = computed<JSONSchema>(() => resolved.value || props.schema)

const typeDisplay = computed(() => {
  if (props.schema.$ref) {
    return getRefName(props.schema.$ref)
  }
  return getPropertyType(displaySchema.value)
})

const constraints = computed<Constraint[]>(() => getConstraints(displaySchema.value))

const conditionalRequirements = computed<ConditionalRequirement[]>(() =>
  getConditionalRequirements(displaySchema.value)
)

const hasChildren = computed(() => {
  const s = displaySchema.value
  return !!(s.properties || (s.type === 'array' && s.items))
})

const childProperties = computed<[string, JSONSchema][]>(() => {
  const s = displaySchema.value
  if (!s.properties) return []
  return Object.entries(s.properties)
})

const requiredFields = computed<Set<string>>(() =>
  new Set(displaySchema.value.required || [])
)

const arrayItemSchema = computed<JSONSchema | null>(() => {
  const s = displaySchema.value
  if (s.type === 'array' && s.items) return s.items
  return null
})

const isCircularRef = computed(() => {
  if (!props.schema.$ref) return false
  return parentVisitedRefs.has(props.schema.$ref)
})

function formatConstraintValue(value: string | number | boolean | (string | number | boolean)[]): string {
  if (Array.isArray(value)) {
    return value.map(v => String(v)).join(' | ')
  }
  return String(value)
}
</script>

<template>
  <div class="schema-node">
    <details :open="isExpanded" v-if="hasChildren && !isCircularRef">
      <summary class="node-header">
        <span class="node-name">{{ isArrayItem ? '[items]' : name }}</span>
        <span class="node-type" :class="{ 'is-ref': schema.$ref }">{{ typeDisplay }}</span>
        <span v-if="isRequired" class="required-badge">*</span>
        <span v-for="c in constraints" :key="c.label" class="constraint-badge">
          {{ c.label }}: {{ formatConstraintValue(c.value) }}
        </span>
      </summary>
      <div class="node-content">
        <p v-if="displaySchema.description" class="description">{{ displaySchema.description }}</p>
        <div v-for="cr in conditionalRequirements" :key="cr.condition" class="conditional-req">
          When {{ cr.condition }} is present: {{ cr.required.join(', ') }} required
        </div>
        <div class="children">
          <SchemaNode
            v-for="[childName, childSchema] in childProperties"
            :key="childName"
            :name="childName"
            :schema="childSchema"
            :path="`${path}.${childName}`"
            :is-required="requiredFields.has(childName)"
          />
          <SchemaNode
            v-if="arrayItemSchema"
            name="items"
            :schema="arrayItemSchema"
            :path="`${path}.items`"
            :is-required="false"
            :is-array-item="true"
          />
        </div>
      </div>
    </details>
    <div v-else class="node-header leaf">
      <span class="node-name">{{ isArrayItem ? '[items]' : name }}</span>
      <span class="node-type" :class="{ 'is-ref': schema.$ref, 'is-circular': isCircularRef }">
        {{ typeDisplay }}
        <span v-if="isCircularRef">(circular)</span>
      </span>
      <span v-if="isRequired" class="required-badge">*</span>
      <span v-for="c in constraints" :key="c.label" class="constraint-badge">
        {{ c.label }}: {{ formatConstraintValue(c.value) }}
      </span>
      <p v-if="displaySchema.description" class="description inline">{{ displaySchema.description }}</p>
    </div>
  </div>
</template>

<style scoped>
.schema-node {
  font-family: var(--vp-font-family-mono);
  font-size: 0.875rem;
  line-height: 1.5;
}

.node-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  cursor: pointer;
}

.node-header.leaf {
  cursor: default;
}

.node-name {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.node-type {
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
}

.node-type.is-ref {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-dark);
}

.node-type.is-circular {
  background: var(--vp-c-warning-soft);
  color: var(--vp-c-warning-dark);
}

.required-badge {
  color: var(--vp-c-danger);
  font-weight: bold;
}

.constraint-badge {
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-3);
  font-size: 0.75rem;
}

.node-content {
  padding-left: 1.5rem;
  border-left: 1px solid var(--vp-c-border);
  margin-left: 0.5rem;
}

.description {
  margin: 0.25rem 0;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-base);
  font-size: 0.8125rem;
}

.description.inline {
  margin-left: 0.5rem;
}

.conditional-req {
  margin: 0.25rem 0;
  padding: 0.25rem 0.5rem;
  background: var(--vp-c-warning-soft);
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--vp-c-warning-dark);
}

.children {
  margin-top: 0.25rem;
}

details > summary {
  list-style: none;
}

details > summary::before {
  content: '▶';
  display: inline-block;
  margin-right: 0.5rem;
  font-size: 0.625rem;
  transition: transform 0.2s;
}

details[open] > summary::before {
  transform: rotate(90deg);
}

details > summary::-webkit-details-marker {
  display: none;
}
</style>
