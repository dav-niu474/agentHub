// NVIDIA NIM (NVIDIA Inference Microservices) API Client
// Docs: https://build.nvidia.com/explore/discover

const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1'

interface NIMChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface NIMCompletionOptions {
  model?: string
  messages: NIMChatMessage[]
  temperature?: number
  max_tokens?: number
  top_p?: number
}

interface NIMCompletionResponse {
  id: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Model catalog - maps app model IDs to NVIDIA NIM model IDs
export const NIM_MODELS: Record<string, { id: string; name: string; description: string }> = {
  // NVIDIA hosted models (verified working)
  'nvidia-llama-3.1-nemotron-70b': {
    id: 'nvidia/llama-3.1-nemotron-70b-instruct',
    name: 'Llama 3.1 Nemotron 70B',
    description: 'High-quality instruction following, NVIDIA tuned',
  },
  'nvidia-llama-3.1-405b': {
    id: 'meta/llama-3.1-405b-instruct',
    name: 'Llama 3.1 405B',
    description: 'Most capable open-source model, excellent reasoning',
  },
  'nvidia-llama-3.1-70b': {
    id: 'meta/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    description: 'Strong general-purpose model',
  },
  'nvidia-mistral-nemo-12b': {
    id: 'mistralai/mistral-nemo-12b-instruct',
    name: 'Mistral NeMo 12B',
    description: 'Fast efficient inference by Mistral AI',
  },
  'nvidia-mixtral-8x22b': {
    id: 'mistralai/mixtral-8x22b-instruct-v0.1',
    name: 'Mixtral 8x22B',
    description: 'High-quality Mixture of Experts model',
  },
  'nvidia-llama-3.1-8b': {
    id: 'meta/llama-3.1-8b-instruct',
    name: 'Llama 3.1 8B',
    description: 'Ultra-fast lightweight model',
  },
  'nvidia-codegemma-7b': {
    id: 'google/codegemma-7b',
    name: 'CodeGemma 7B',
    description: 'Code generation specialist by Google',
  },
  // GLM models (Zhipu AI on NVIDIA NIM)
  'glm-4.7': {
    id: 'zhipuai/chatglm4-9b',
    name: 'GLM 4.7',
    description: 'Advanced Chinese & English understanding by Zhipu AI',
  },
  'glm-5': {
    id: 'zhipuai/chatglm5-32b',
    name: 'GLM 5',
    description: 'Flagship GLM model with superior reasoning',
  },
  // Kimi (Moonshot AI on NVIDIA NIM)
  'kimi-2.5': {
    id: 'moonshotai/kimi',
    name: 'Kimi 2.5',
    description: 'Long-context understanding by Moonshot AI',
  },
} as const

// Model ID lookup: app model ID → NVIDIA NIM model ID
export function getNimModelId(appModelId: string): string {
  const nimModel = NIM_MODELS[appModelId]
  if (nimModel) return nimModel.id
  // If not found in NIM_MODELS, treat the ID itself as the NIM model ID
  return appModelId
}

// Primary model for fallback chain
const FALLBACK_MODELS = [
  'nvidia/llama-3.1-70b-instruct',
  'mistralai/mistral-nemo-12b-instruct',
  'meta/llama-3.1-8b-instruct',
]

export async function callNVIDIA(
  messages: NIMChatMessage[],
  options?: {
    model?: string
    temperature?: number
    max_tokens?: number
    top_p?: number
  }
): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY
  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY environment variable is not set')
  }

  const model = options?.model || NIM_MODELS['nvidia-llama-3.1-70b'].id

  const response = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.6,
      max_tokens: options?.max_tokens ?? 2048,
      top_p: options?.top_p ?? 0.9,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error(`NVIDIA NIM API error (${model}):`, response.status, errorBody)
    throw new Error(`NVIDIA NIM API error (${response.status}): ${errorBody.slice(0, 200)}`)
  }

  const data: NIMCompletionResponse = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

/**
 * Call NVIDIA NIM with automatic model fallback on failure.
 * Tries the requested model first, then falls back through a list of reliable models.
 */
export async function callNVIDIAWithFallback(
  messages: NIMChatMessage[],
  options?: {
    model?: string
    temperature?: number
    max_tokens?: number
    top_p?: number
  }
): Promise<{ content: string; model: string }> {
  const requestedModel = options?.model || NIM_MODELS['nvidia-llama-3.1-70b'].id

  // Try requested model first
  try {
    const content = await callNVIDIA(messages, options)
    return { content, model: requestedModel }
  } catch (primaryError) {
    console.warn(`Primary model ${requestedModel} failed, trying fallbacks...`, primaryError)
  }

  // Try fallback models (skip the one that already failed)
  for (const fallbackModel of FALLBACK_MODELS) {
    if (fallbackModel === requestedModel) continue
    try {
      const content = await callNVIDIA(messages, {
        ...options,
        model: fallbackModel,
      })
      console.log(`Fallback to ${fallbackModel} succeeded`)
      return { content, model: fallbackModel }
    } catch (fallbackError) {
      console.warn(`Fallback model ${fallbackModel} also failed:`, fallbackError)
    }
  }

  throw new Error('All NVIDIA NIM models failed. Please try again later.')
}

/**
 * Convenience function: build messages from system prompt + conversation + user message, then call NVIDIA with fallback.
 */
export async function callNVIDIAConversation(
  systemPrompt: string,
  conversationHistory: Array<{ role: string; content: string }>,
  userMessage: string,
  options?: {
    model?: string
    temperature?: number
    max_tokens?: number
  }
): Promise<{ content: string; model: string }> {
  const messages: NIMChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map((m) => ({
      role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ]

  return callNVIDIAWithFallback(messages, options)
}
