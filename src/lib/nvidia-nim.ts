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

// Default model: Llama 3.1 Nemotron 70B Instruct (free tier on NVIDIA NIM)
const DEFAULT_MODEL = 'meta/llama-3.1-70b-instruct'

// Available free models on NVIDIA NIM
export const NIM_MODELS = {
  'nvidia-llama-3.1-nemotron-70b': {
    id: 'nvidia/llama-3.1-70b-instruct',
    name: 'Llama 3.1 Nemotron 70B',
    description: 'High-quality instruction following',
  },
  'nvidia-mistral-nemo-12b': {
    id: 'mistralai/mistral-nemo-12b-instruct',
    name: 'Mistral NeMo 12B',
    description: 'Fast efficient inference',
  },
  'nvidia-llama-3.1-8b': {
    id: 'meta/llama-3.1-8b-instruct',
    name: 'Llama 3.1 8B',
    description: 'Ultra-fast lightweight model',
  },
  'nvidia-codegemma-7b': {
    id: 'google/codegemma-7b',
    name: 'CodeGemma 7B',
    description: 'Code generation specialist',
  },
} as const

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

  const model = options?.model || DEFAULT_MODEL
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
    console.error('NVIDIA NIM API error:', response.status, errorBody)
    throw new Error(`NVIDIA NIM API error: ${response.status} - ${errorBody}`)
  }

  const data: NIMCompletionResponse = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

export async function callNVIDIAWithFallback(
  systemPrompt: string,
  conversationHistory: Array<{ role: string; content: string }>,
  userMessage: string,
  options?: {
    model?: string
    temperature?: number
    max_tokens?: number
  }
): Promise<string> {
  const messages: NIMChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map((m) => ({
      role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ]

  return callNVIDIA(messages, options)
}
