import type { ColumnMapping } from '../types.js'

// --- Request/Response types ---

export interface ColumnMappingRequest {
  unmappedHeaders: string[]
  validFields: string[]
  sampleRows: Record<string, string>[]
}

export interface AIColumnMapping {
  sourceColumn: string
  targetField: string
  confidence: number
  reasoning: string
}

export interface ExerciseNormRequest {
  unknownNames: string[]
  knownCanonicalNames: string[]
}

export interface AIExerciseMapping {
  originalName: string
  canonicalName: string
  confidence: number
  reasoning: string
}

// --- Provider interface ---

export interface AIProvider {
  inferColumnMappings(request: ColumnMappingRequest): Promise<AIColumnMapping[]>
  normalizeExerciseNames(request: ExerciseNormRequest): Promise<AIExerciseMapping[]>
}

// --- Provider options ---

export interface AIProviderOptions {
  apiKey?: string
  baseURL?: string
  model?: string
}

// --- Factory ---

export async function createAIProvider(options?: AIProviderOptions): Promise<AIProvider> {
  const baseURL = options?.baseURL ?? process.env.OPENWEIGHT_AI_URL
  const apiKey = options?.apiKey ?? process.env.OPENAI_API_KEY

  if (!baseURL && !apiKey) {
    throw new Error(
      'AI provider requires either OPENWEIGHT_AI_URL or OPENAI_API_KEY environment variable. ' +
        'Set OPENAI_API_KEY for OpenAI, or OPENWEIGHT_AI_URL for Ollama/vLLM.'
    )
  }

  const { OpenAIProvider } = await import('./openai-provider.js')

  return new OpenAIProvider({
    apiKey: apiKey ?? 'ollama',
    baseURL,
    model: options?.model,
  })
}
