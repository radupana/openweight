<script setup lang="ts">
import { provide, ref, onMounted } from 'vue'
import type { JSONSchema } from './schema-utils'
import SchemaNode from './SchemaNode.vue'

const props = defineProps<{
  schemaUrl: string
  title?: string
  initialExpansionLevel?: number
}>()

const schema = ref<JSONSchema | null>(null)
const error = ref<string | null>(null)
const isLoading = ref(true)

const expansionLevel = props.initialExpansionLevel ?? 2
const visitedRefs = new Set<string>()

provide('rootSchema', schema)
provide('expansionLevel', expansionLevel)
provide('visitedRefs', visitedRefs)

onMounted(async () => {
  try {
    const base = import.meta.env.BASE_URL || '/openweight/'
    const response = await fetch(`${base}${props.schemaUrl}`)
    if (!response.ok) {
      throw new Error(`Failed to load schema: ${response.status}`)
    }
    schema.value = await response.json()
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load schema'
  } finally {
    isLoading.value = false
  }
})

const displayTitle = props.title
</script>

<template>
  <div class="schema-explorer">
    <div v-if="isLoading" class="loading">Loading schema...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <template v-else-if="schema">
      <div class="explorer-header">
        <h3 v-if="displayTitle" class="explorer-title">{{ displayTitle }}</h3>
        <div class="legend">
          <span class="legend-item"><span class="required-badge">*</span> required</span>
          <span class="legend-item"><span class="type-badge ref">RefType</span> reference</span>
        </div>
      </div>
      <div class="schema-tree">
        <SchemaNode
          :name="schema.title || 'root'"
          :schema="schema"
          path="root"
          :is-required="false"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.schema-explorer {
  margin: 1rem 0;
  padding: 1rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.loading,
.error {
  padding: 1rem;
  text-align: center;
}

.error {
  color: var(--vp-c-danger);
}

.explorer-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--vp-c-border);
}

.explorer-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.legend {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.required-badge {
  color: var(--vp-c-danger);
  font-weight: bold;
}

.type-badge {
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.625rem;
}

.type-badge.ref {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-dark);
}

.schema-tree {
  overflow-x: auto;
}
</style>
