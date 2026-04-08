import { NextRequest, NextResponse } from 'next/server'
import { callNVIDIAConversation, getNimModelId } from '@/lib/nvidia-nim'

const TASK_EXECUTION_PROMPTS: Record<string, string> = {
  coding: `You are an expert coding agent. Complete the following coding task and provide a detailed result.
Return a JSON object with these fields:
- "result": A concise summary of what was implemented (2-3 sentences)
- "details": Detailed technical implementation notes (3-5 bullet points as a string with newlines between each)
- "files": Array of file paths that were created/modified (2-5 realistic file paths)

Be specific and technical. Generate realistic file paths that match the task.`,
  research: `You are a deep research agent. Complete the following research task and provide comprehensive findings.
Return a JSON object with these fields:
- "result": Executive summary of research findings (2-3 sentences)
- "details": Key research findings and insights (3-5 bullet points as a string with newlines between each)
- "files": Array of deliverable file names (2-5 realistic file names)

Be specific and provide realistic research findings.`,
  creative: `You are a creative strategist agent. Complete the following creative task and provide polished deliverables.
Return a JSON object with these fields:
- "result": Summary of creative deliverables produced (2-3 sentences)
- "details": Key creative decisions and rationale (3-5 bullet points as a string with newlines between each)
- "files": Array of deliverable file names (2-5 realistic file names)

Be specific and creative.`,
  automation: `You are an automation specialist agent. Complete the following automation task and provide implementation details.
Return a JSON object with these fields:
- "result": Summary of automation workflow configured (2-3 sentences)
- "details": Key automation steps implemented (3-5 bullet points as a string with newlines between each)
- "files": Array of configuration file paths (2-5 realistic file paths)

Be specific about the automation implementation.`,
  strategy: `You are a strategy analyst agent. Complete the following strategic analysis task and provide actionable insights.
Return a JSON object with these fields:
- "result": Summary of strategic analysis and recommendations (2-3 sentences)
- "details": Key strategic insights and action items (3-5 bullet points as a string with newlines between each)
- "files": Array of report file names (2-5 realistic file names)

Be specific and provide actionable strategic recommendations.`,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { task, agentName, modelId } = body

    if (!task || !task.title) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 })
    }

    const category = task.category || 'general'
    const systemPrompt = TASK_EXECUTION_PROMPTS[category] || TASK_EXECUTION_PROMPTS.coding

    const taskDescription = `Task: ${task.title}\nDescription: ${task.description || 'No additional description provided.'}\nAssigned Agent: ${agentName || 'AI Agent'}\nPriority: ${task.priority || 'medium'}`

    const nimModelId = modelId ? getNimModelId(modelId) : undefined

    const result = await callNVIDIAConversation(systemPrompt, [], taskDescription, {
      model: nimModelId,
      temperature: 0.4,
      max_tokens: 1500,
    })

    // Parse the JSON response
    let parsedResult: { result?: string; details?: string; files?: string[] }
    try {
      const cleaned = result.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsedResult = JSON.parse(cleaned)
    } catch {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          parsedResult = JSON.parse(jsonMatch[0])
        } catch {
          parsedResult = {
            result: `Task "${task.title}" completed successfully by ${agentName || 'AI Agent'}.`,
            details: result.content.slice(0, 500),
            files: [`output-${Date.now()}.md`],
          }
        }
      } else {
        parsedResult = {
          result: `Task "${task.title}" completed successfully by ${agentName || 'AI Agent'}.`,
          details: result.content.slice(0, 500),
          files: [`output-${Date.now()}.md`],
        }
      }
    }

    const resultFiles = parsedResult.files || [`output-${Date.now()}.md`]

    return NextResponse.json({
      message: parsedResult.result || 'Task completed successfully.',
      result: parsedResult.result || 'Task completed successfully.',
      details: parsedResult.details || '',
      resultFiles,
      model: result.model,
      creditsUsed: Math.random() * 3 + 1,
    })
  } catch (error) {
    console.error('Task execution error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Task execution failed',
        message: `Task execution encountered an error: ${errorMessage}`,
        result: `Task execution failed: ${errorMessage}`,
        resultFiles: [],
        creditsUsed: 0,
      },
      { status: 500 }
    )
  }
}
