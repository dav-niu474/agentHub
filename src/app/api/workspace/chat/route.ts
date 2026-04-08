import { NextRequest, NextResponse } from 'next/server'
import { callNVIDIAConversation, getNimModelId } from '@/lib/nvidia-nim'

interface HiredAgent {
  id: string
  name: string
  provider: string
  category: string
  capabilities: string[]
  status: string
}

interface PlanTask {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  category: string
  suggestedAgentCategory: string
  order: number
}

// ==================== System Prompts ====================

const CLARIFY_SYSTEM_PROMPT = `You are an AI Project Coordinator — an expert at understanding user requirements and breaking down complex projects. Your job is to:

1. **Understand** what the user wants to build or accomplish
2. **Ask clarifying questions** to fill in gaps in requirements
3. **Identify key components** needed for the project
4. **Once requirements are clear**, signal that you're ready to create a task plan

Be conversational but professional. Ask 1-3 focused questions at a time. Don't overwhelm the user.

When you feel you have enough information to create a comprehensive task plan, include this exact marker at the END of your response:
[READY_TO_PLAN]

Available agent categories: coding, research, creative, automation, strategy`

const PLAN_SYSTEM_PROMPT = `You are an AI Project Coordinator. Based on the conversation context, create a detailed task plan.

You MUST respond with valid JSON in this exact format (no markdown, no code fences, just raw JSON):
{
  "title": "Project Title",
  "description": "Brief project description",
  "requirements": ["requirement 1", "requirement 2", "requirement 3"],
  "tasks": [
    {
      "title": "Task title",
      "description": "Detailed description of what needs to be done",
      "priority": "high|medium|low",
      "category": "coding|research|creative|automation|strategy",
      "suggestedAgentCategory": "coding|research|creative|automation|strategy",
      "order": 1
    }
  ]
}

Rules:
- Create 3-8 tasks depending on project complexity
- Each task should be specific and actionable
- Prioritize tasks logically (setup first, then core features, then polish)
- Match task categories to the best agent type
- suggestedAgentCategory should match the most suitable agent for that task
- Include at least one coding or research task for any project`

// ==================== Helper Functions ====================

function buildConversationContext(chatHistory: Array<{ role: string; content: string }>) {
  return chatHistory.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }))
}

function matchAgentToCategory(
  category: string,
  agents: HiredAgent[],
  usedAgentIds: Set<string>
): HiredAgent | null {
  const matching = agents.filter(
    (a) => a.category === category && !usedAgentIds.has(a.id) && a.status !== 'working'
  )

  if (matching.length > 0) {
    const idle = matching.find((a) => a.status === 'idle')
    return idle || matching[0]
  }

  const anyIdle = agents.find((a) => a.status === 'idle' && !usedAgentIds.has(a.id))
  if (anyIdle) return anyIdle

  const anyAvailable = agents.find((a) => !usedAgentIds.has(a.id))
  if (anyAvailable) return anyAvailable

  return agents[0] || null
}

// ==================== Main Handler ====================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, chatHistory, hiredAgents, currentPhase, modelId } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const agents: HiredAgent[] = hiredAgents || []
    const history: Array<{ role: string; content: string }> = chatHistory || []
    const phase = currentPhase || 'idle'

    // Resolve the NIM model ID from the frontend model selection
    const nimModelId = modelId ? getNimModelId(modelId) : undefined

    let response = ''
    let tasks: PlanTask[] = []
    let newPhase = phase
    let usedModel = 'unknown'

    // ==================== PHASE: Clarifying ====================
    if (phase === 'idle' || phase === 'clarifying') {
      const context = buildConversationContext(history)
      const result = await callNVIDIAConversation(CLARIFY_SYSTEM_PROMPT, context, message, {
        model: nimModelId,
        temperature: 0.6,
        max_tokens: 2048,
      })
      response = result.content
      usedModel = result.model

      // Check if AI is ready to plan
      if (response.includes('[READY_TO_PLAN]')) {
        newPhase = 'planning'
        response = response.replace('[READY_TO_PLAN]', '').trim()

        // Auto-generate the plan immediately
        const planSystemPrompt = `${PLAN_SYSTEM_PROMPT}\n\nBased on the conversation, the user wants to build something with these understood requirements:\n${response}`

        try {
          const planResult = await callNVIDIAConversation(planSystemPrompt, [], 'Create a detailed task plan for this project.', {
            model: nimModelId,
            temperature: 0.3,
            max_tokens: 2048,
          })

          let planJson
          try {
            const cleaned = planResult.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
            planJson = JSON.parse(cleaned)
          } catch {
            const jsonMatch = planResult.content.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              planJson = JSON.parse(jsonMatch[0])
            }
          }

          if (planJson && planJson.tasks) {
            tasks = planJson.tasks.map((t: Partial<PlanTask> & { order?: number }, i: number) => ({
              id: `plan-${Date.now()}-${i}`,
              title: t.title || 'Untitled Task',
              description: t.description || '',
              priority: (t.priority || 'medium') as PlanTask['priority'],
              category: (t.category || 'general') as string,
              suggestedAgentCategory: (t.suggestedAgentCategory || t.category || 'general') as string,
              order: t.order || (i + 1),
            }))

            response += `\n\n---\n\n📋 **I've created a task plan with ${tasks.length} tasks.** Please review the plan on the right panel. You can edit task details, remove tasks, or add new ones before confirming execution.`
          }
        } catch (planError) {
          console.error('Plan generation error:', planError)
          response += '\n\n⚠️ I had trouble generating the full plan. You can try again or describe your project more specifically.'
          newPhase = 'clarifying'
        }
      } else {
        newPhase = 'clarifying'
      }
    }
    // ==================== PHASE: Planning ====================
    else if (phase === 'planning') {
      const lower = message.toLowerCase()

      if (
        lower.includes('confirm') ||
        lower.includes('execute') ||
        lower.includes('go ahead') ||
        lower.includes('start') ||
        lower.includes('looks good') ||
        lower.includes('proceed') ||
        lower.includes('开始') ||
        lower.includes('执行') ||
        lower.includes('确认')
      ) {
        newPhase = 'executing'
        response = `✅ **Plan confirmed!** I'm now dispatching tasks to your agent team. You can monitor progress in the task board.`
        usedModel = 'none'
      } else if (
        lower.includes('add task') ||
        lower.includes('remove') ||
        lower.includes('change') ||
        lower.includes('modify') ||
        lower.includes('edit') ||
        lower.includes('调整') ||
        lower.includes('修改') ||
        lower.includes('增加')
      ) {
        newPhase = 'planning'
        response = `Sure! You can directly edit the task plan in the panel on the right:\n\n- ✏️ Click on any task title or description to edit it\n- ➕ Use "Add Task" to add new tasks\n- 🗑️ Use the remove button to delete tasks\n- 📊 Adjust priority levels as needed\n\nOnce you're happy with the plan, type **"confirm"** or **"execute"** to start dispatching tasks to your agents.`
        usedModel = 'none'
      } else {
        const context = buildConversationContext(history)
        const result = await callNVIDIAConversation(CLARIFY_SYSTEM_PROMPT, context, message, {
          model: nimModelId,
          temperature: 0.6,
          max_tokens: 2048,
        })
        response = result.content
        usedModel = result.model

        if (!response.includes('[READY_TO_PLAN]')) {
          newPhase = 'clarifying'
          response += '\n\n💡 Want me to update the task plan based on this? Just say "update the plan".'
        } else {
          response = response.replace('[READY_TO_PLAN]', '').trim()
          newPhase = 'planning'
        }
      }
    }
    // ==================== PHASE: Executing ====================
    else if (phase === 'executing') {
      const lower = message.toLowerCase()
      usedModel = 'none'

      if (lower.includes('progress') || lower.includes('status') || lower.includes('how')) {
        response = `Here's the current status of your project:\n\n**Active Tasks:** Check the task board on the right for real-time progress updates.\n\nYour agents are working autonomously. I'll notify you as soon as any task is completed. You can also click on an agent in the sidebar to see their individual workspace.`
      } else if (lower.includes('add task') || lower.includes('new task')) {
        response = `I can create new tasks for you! Just describe what you need done, and I'll:\n\n1. **Analyze** the requirement\n2. **Create** an appropriate task\n3. **Assign** it to the best-suited available agent\n4. **Dispatch** it for autonomous execution\n\nWhat task would you like to add?`
      } else if (lower.includes('result') || lower.includes('output') || lower.includes('deliver')) {
        response = `Task results are available in the **Tasks** view. When agents complete their work:\n\n- ✅ Results are stored with each task\n- 📧 Email notifications are sent\n- 📁 Output files are attached\n\nYou can also check the notification bell for updates.`
      } else if (lower.includes('hire') || lower.includes('agent')) {
        response = `To hire agents, click on **"Agents"** in the sidebar or use the **Hire (+)** button at the bottom.\n\n**Recommended agents:**\n- 🔶 **Claude Code** — Terminal-based coding\n- 🟢 **Codex** — Full project generation\n- 🟣 **OpenClaw** — Computer automation\n- 🔵 **Deep Research** — Analysis and reporting\n\nHiring more agents allows better task parallelization!`
      } else {
        response = `I'm your AI project coordinator. I can help you:\n\n1. **Create tasks** — Describe what you need and I'll break it down\n2. **Assign agents** — Tasks are auto-assigned based on agent strengths\n3. **Monitor progress** — Check the task board for real-time updates\n4. **Manage workflow** — Add, prioritize, and track all your tasks\n\nWhat would you like to do next?`
      }
      newPhase = 'executing'
    }

    // ==================== Agent Assignment ====================
    let assignments: Array<{ taskId: string; agentId: string; agentName: string }> = []

    if (newPhase === 'executing' && tasks.length > 0 && agents.length > 0) {
      const usedIds = new Set<string>()
      for (const task of tasks) {
        const agent = matchAgentToCategory(task.suggestedAgentCategory || task.category, agents, usedIds)
        if (agent) {
          assignments.push({ taskId: task.id, agentId: agent.id, agentName: agent.name })
          usedIds.add(agent.id)
        }
      }
    }

    return NextResponse.json({
      message: response,
      phase: newPhase,
      tasks: tasks.length > 0 ? tasks : undefined,
      assignments: assignments.length > 0 ? assignments : undefined,
      model: usedModel,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Workspace chat API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
        phase: 'idle',
      },
      { status: 500 }
    )
  }
}
