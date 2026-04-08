import { NextRequest, NextResponse } from 'next/server'
import { callNVIDIAConversation, getNimModelId } from '@/lib/nvidia-nim'

// System prompt for the general chat assistant
const CHAT_SYSTEM_PROMPT = `You are a helpful AI assistant on AgentHub, a multi-agent AI platform. You help users with:
- Content creation and writing
- Data analysis and insights
- Code assistance and debugging
- Research and information gathering
- Business strategy and planning
- General knowledge questions

Be conversational, helpful, and concise. Use markdown formatting for better readability when appropriate.
When discussing code, use proper code blocks with language tags.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, agentId, chatHistory, modelId } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const history: Array<{ role: string; content: string }> = chatHistory || []

    // Resolve the NIM model ID from the frontend model selection
    const nimModelId = modelId ? getNimModelId(modelId) : undefined

    // Build a context-aware system prompt based on agent type
    let systemPrompt = CHAT_SYSTEM_PROMPT
    if (agentId) {
      const agentContextMap: Record<string, string> = {
        'claude-code': 'You are Claude Code, an expert coding assistant. Focus on code generation, debugging, refactoring, and software architecture. Provide code examples with proper syntax highlighting.',
        'codex': 'You are Codex, an autonomous coding agent. Focus on full project generation, scaffolding, test writing, and CI/CD integration.',
        'openclaw': 'You are OpenClaw, an automation specialist. Focus on workflow automation, computer use, browser automation, and process optimization.',
        'cursor': 'You are Cursor Agent, an AI coding assistant. Focus on codebase understanding, multi-file editing, and code review.',
        'deep-research': 'You are a Deep Research Agent. Focus on comprehensive analysis, paper review, market intelligence, data mining, and detailed reporting.',
        'marketing-agent': 'You are a Marketing Strategist agent. Focus on campaign planning, content strategy, SEO analysis, social media, and competitive intelligence.',
        'legal-analyst': 'You are a Legal Analyst agent. Focus on legal research, contract analysis, compliance review, and regulatory tracking.',
        'academic-writer': 'You are an Academic Writer agent. Focus on research paper writing, literature review, citation management, and academic content.',
        'data-analyst': 'You are a Data Analyst agent. Focus on data analysis, visualization, statistical modeling, and business intelligence.',
        'code-reviewer': 'You are a Code Review agent. Focus on bug detection, security audit, performance review, and best practices.',
      }
      systemPrompt = agentContextMap[agentId] || CHAT_SYSTEM_PROMPT
    }

    // Call NVIDIA NIM with automatic fallback
    const result = await callNVIDIAConversation(
      systemPrompt,
      history,
      message,
      {
        model: nimModelId,
        temperature: 0.7,
        max_tokens: 2048,
      }
    )

    return NextResponse.json({
      message: result.content,
      model: result.model,
      agentId: agentId || null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Chat API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
        agentId: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
