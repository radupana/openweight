<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const schemaType = ref('workout-log')
const jsonInput = ref(`{
  "date": "2024-01-15T09:30:00Z",
  "exercises": [
    {
      "exercise": { "name": "Squat" },
      "sets": [
        { "reps": 5, "weight": 100, "unit": "kg" }
      ]
    }
  ]
}`)

const validationResult = ref<{
  valid: boolean
  error?: string
  errors?: Array<{ path: string; message: string }>
} | null>(null)
const isValidating = ref(false)
const isLoaded = ref(false)

let ajvInstance: any = null
let validators: Record<string, any> = {}

onMounted(async () => {
  try {
    const [Ajv, addFormats] = await Promise.all([
      import('ajv').then(m => m.default),
      import('ajv-formats').then(m => m.default)
    ])

    ajvInstance = new Ajv({ allErrors: true, strict: false })
    addFormats(ajvInstance)

    const [workoutLogSchema, workoutTemplateSchema, programSchema] = await Promise.all([
      fetch('https://raw.githubusercontent.com/radupana/openweight/main/schemas/workout-log.schema.json').then(r => r.json()),
      fetch('https://raw.githubusercontent.com/radupana/openweight/main/schemas/workout-template.schema.json').then(r => r.json()),
      fetch('https://raw.githubusercontent.com/radupana/openweight/main/schemas/program.schema.json').then(r => r.json())
    ])

    ajvInstance.addSchema(workoutTemplateSchema, 'workout-template.schema.json')

    validators['workout-log'] = ajvInstance.compile(workoutLogSchema)
    validators['workout-template'] = ajvInstance.compile(workoutTemplateSchema)
    validators['program'] = ajvInstance.compile(programSchema)

    isLoaded.value = true
    validate()
  } catch (error: any) {
    validationResult.value = { valid: false, error: 'Failed to load schemas: ' + error.message }
  }
})

function validate() {
  if (!ajvInstance) {
    validationResult.value = { valid: false, error: 'Validator not loaded yet' }
    return
  }

  isValidating.value = true

  try {
    const data = JSON.parse(jsonInput.value)
    const validator = validators[schemaType.value]

    if (!validator) {
      validationResult.value = { valid: false, error: 'Schema not loaded' }
      return
    }

    const valid = validator(data)

    if (valid) {
      validationResult.value = { valid: true }
    } else {
      validationResult.value = {
        valid: false,
        errors: validator.errors.map((e: any) => ({
          path: e.instancePath || '/',
          message: e.message
        }))
      }
    }
  } catch (error: any) {
    validationResult.value = { valid: false, error: 'Invalid JSON: ' + error.message }
  } finally {
    isValidating.value = false
  }
}

function loadExample(type: string) {
  const examples: Record<string, string> = {
    'workout-log': `{
  "date": "2024-01-15T09:30:00Z",
  "name": "Push Day",
  "exercises": [
    {
      "exercise": {
        "name": "Bench Press",
        "equipment": "barbell",
        "category": "chest"
      },
      "sets": [
        { "reps": 5, "weight": 100, "unit": "kg", "rpe": 7 },
        { "reps": 5, "weight": 100, "unit": "kg", "rpe": 8 },
        { "reps": 5, "weight": 100, "unit": "kg", "rpe": 8.5 }
      ]
    }
  ]
}`,
    'workout-template': `{
  "name": "5/3/1 Squat Day",
  "exercises": [
    {
      "exercise": { "name": "Squat", "equipment": "barbell" },
      "sets": [
        { "percentage": 65, "percentageOf": "TM", "targetReps": 5 },
        { "percentage": 75, "percentageOf": "TM", "targetReps": 5 },
        { "percentage": 85, "percentageOf": "TM", "targetReps": 5, "type": "amrap" }
      ]
    }
  ]
}`,
    'program': `{
  "name": "Simple 3x5",
  "weeks": [
    {
      "name": "Week 1",
      "workouts": [
        {
          "name": "Day A",
          "exercises": [
            {
              "exercise": { "name": "Squat" },
              "sets": [
                { "targetReps": 5 },
                { "targetReps": 5 },
                { "targetReps": 5 }
              ]
            }
          ]
        }
      ]
    }
  ]
}`
  }

  schemaType.value = type
  jsonInput.value = examples[type]
  validate()
}

const resultClass = computed(() => {
  if (!validationResult.value) return ''
  return validationResult.value.valid ? 'valid' : 'invalid'
})
</script>

<template>
  <div class="playground">
    <div class="controls">
      <label>
        Schema:
        <select v-model="schemaType" @change="validate">
          <option value="workout-log">WorkoutLog</option>
          <option value="workout-template">WorkoutTemplate</option>
          <option value="program">Program</option>
        </select>
      </label>
      <div class="examples">
        Load example:
        <button @click="loadExample('workout-log')">Workout Log</button>
        <button @click="loadExample('workout-template')">Template</button>
        <button @click="loadExample('program')">Program</button>
      </div>
    </div>

    <textarea
      v-model="jsonInput"
      @input="validate"
      placeholder="Paste your JSON here..."
      spellcheck="false"
    ></textarea>

    <button class="validate-btn" @click="validate" :disabled="isValidating || !isLoaded">
      {{ !isLoaded ? 'Loading...' : isValidating ? 'Validating...' : 'Validate' }}
    </button>

    <div v-if="validationResult" class="result" :class="resultClass">
      <template v-if="validationResult.valid">
        <strong>Valid!</strong> Your JSON conforms to the {{ schemaType }} schema.
      </template>
      <template v-else-if="validationResult.error">
        <strong>Error:</strong> {{ validationResult.error }}
      </template>
      <template v-else>
        <strong>Invalid:</strong>
        <ul>
          <li v-for="(error, index) in validationResult.errors" :key="index">
            <code>{{ error.path }}</code>: {{ error.message }}
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<style scoped>
.playground {
  margin-top: 1rem;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.controls select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.examples {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.examples button {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 0.875rem;
}

.examples button:hover {
  background: var(--vp-c-bg-mute);
}

textarea {
  width: 100%;
  min-height: 300px;
  padding: 1rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.875rem;
  line-height: 1.5;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  resize: vertical;
}

textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand);
}

.validate-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background: var(--vp-c-brand);
  color: white;
  font-weight: 500;
  cursor: pointer;
}

.validate-btn:hover {
  background: var(--vp-c-brand-dark);
}

.validate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.result {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
}

.result.valid {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: rgb(22, 163, 74);
}

.result.invalid {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: rgb(220, 38, 38);
}

:global(.dark) .result.valid {
  color: rgb(74, 222, 128);
}

:global(.dark) .result.invalid {
  color: rgb(248, 113, 113);
}

.result ul {
  margin: 0.5rem 0 0 0;
  padding-left: 1.5rem;
}

.result li {
  margin: 0.25rem 0;
}

.result code {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  font-size: 0.875em;
}

:global(.dark) .result code {
  background: rgba(255, 255, 255, 0.1);
}
</style>
