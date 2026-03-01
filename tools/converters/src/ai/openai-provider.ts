import type {
  AIProvider,
  AIProviderOptions,
  ColumnMappingRequest,
  AIColumnMapping,
  ExerciseNormRequest,
  AIExerciseMapping,
} from './provider.js'
import {
  buildColumnMappingPrompt,
  buildExerciseNormPrompt,
  parseColumnMappingResponse,
  parseExerciseNormResponse,
} from './prompts.js'

const DEFAULT_MODEL = 'gpt-4.1-mini'

export class OpenAIProvider implements AIProvider {
  private apiKey: string
  private baseURL?: string
  private model: string

  constructor(options: AIProviderOptions) {
    this.apiKey = options.apiKey ?? 'ollama'
    this.baseURL = options.baseURL
    this.model = options.model ?? DEFAULT_MODEL
  }

  async inferColumnMappings(request: ColumnMappingRequest): Promise<AIColumnMapping[]> {
    const prompt = buildColumnMappingPrompt(request)
    const text = await this.chat(prompt)
    const result = parseColumnMappingResponse(text)
    if (result.length === 0 && request.unmappedHeaders.length > 0 && text.trim() !== '[]') {
      console.error(`[ai] Column mapping returned 0 results for ${request.unmappedHeaders.length} unmapped headers`)
      console.error(`[ai] Raw response: ${text.slice(0, 500)}`)
    }
    return result
  }

  async normalizeExerciseNames(request: ExerciseNormRequest): Promise<AIExerciseMapping[]> {
    const prompt = buildExerciseNormPrompt(request)
    const text = await this.chat(prompt)
    const result = parseExerciseNormResponse(text)
    if (result.length === 0 && request.unknownNames.length > 0 && text.trim() !== '[]') {
      console.error(`[ai] Exercise normalization returned 0 results for ${request.unknownNames.length} unknown names`)
      console.error(`[ai] Raw response: ${text.slice(0, 500)}`)
    }
    return result
  }

  private async chat(prompt: string): Promise<string> {
    let OpenAI: typeof import('openai').default
    try {
      const mod = await import('openai')
      OpenAI = mod.default
    } catch {
      throw new Error(
        'The "openai" package is required for AI-assisted conversion. Install it with: npm install openai'
      )
    }

    const client = new OpenAI({
      apiKey: this.apiKey,
      ...(this.baseURL ? { baseURL: this.baseURL } : {}),
    })

    const response = await client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    })

    return response.choices[0]?.message?.content ?? '[]'
  }
}
