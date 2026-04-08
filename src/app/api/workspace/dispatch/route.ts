import { NextRequest, NextResponse } from 'next/server'

interface DispatchTask {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  category: string
  suggestedAgentCategory: string
  order: number
  assignedAgentId?: string
  assignedAgentName?: string
}

interface HiredAgent {
  id: string
  name: string
  provider: string
  category: string
  capabilities: string[]
  status: string
}

function matchAgentToCategory(
  category: string,
  agents: HiredAgent[],
  usedAgentIds: Map<string, number>
): HiredAgent | null {
  const matching = agents.filter(
    (a) => a.category === category && a.status !== 'working'
  )

  if (matching.length > 0) {
    // Sort by least tasks assigned
    matching.sort((a, b) => (usedAgentIds.get(a.id) || 0) - (usedAgentIds.get(b.id) || 0))
    const idle = matching.find((a) => a.status === 'idle')
    return idle || matching[0]
  }

  // Fallback: any idle agent
  const anyIdle = agents.find((a) => a.status === 'idle')
  if (anyIdle) return anyIdle

  // Any agent with least tasks
  const sorted = [...agents].sort((a, b) => (usedAgentIds.get(a.id) || 0) - (usedAgentIds.get(b.id) || 0))
  return sorted[0] || null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tasks, hiredAgents } = body

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: 'Tasks are required' }, { status: 400 })
    }

    const agents: HiredAgent[] = hiredAgents || []
    const taskCountMap = new Map<string, number>()

    // Assign agents to tasks
    const dispatchedTasks: DispatchTask[] = tasks.map((task: DispatchTask, index: number) => {
      const agent = matchAgentToCategory(
        task.suggestedAgentCategory || task.category,
        agents,
        taskCountMap
      )

      if (agent) {
        taskCountMap.set(agent.id, (taskCountMap.get(agent.id) || 0) + 1)
      }

      return {
        ...task,
        assignedAgentId: agent?.id,
        assignedAgentName: agent?.name,
      }
    })

    // Generate assignment summary
    const assignedCount = dispatchedTasks.filter((t) => t.assignedAgentId).length
    const unassignedCount = dispatchedTasks.length - assignedCount

    let summary = `**Tasks Dispatched Successfully!** 🚀\n\n`
    summary += `**Assignment Summary:**\n\n`

    const agentGroups = new Map<string, string[]>()
    for (const task of dispatchedTasks) {
      if (task.assignedAgentId) {
        const tasks = agentGroups.get(task.assignedAgentName || 'Unknown') || []
        tasks.push(task.title)
        agentGroups.set(task.assignedAgentName || 'Unknown', tasks)
      }
    }

    for (const [agentName, agentTasks] of agentGroups) {
      summary += `🤖 **${agentName}** (${agentTasks.length} task${agentTasks.length !== 1 ? 's' : ''}):\n`
      for (const task of agentTasks) {
        summary += `  - ${task}\n`
      }
      summary += '\n'
    }

    if (unassignedCount > 0) {
      summary += `⚠️ **${unassignedCount} task(s)** unassigned. Hire more agents to handle these.\n\n`
    }

    summary += `Your agents are now working autonomously. Monitor progress in the task board on the right. Results will be emailed upon completion.`

    return NextResponse.json({
      message: summary,
      tasks: dispatchedTasks,
      assignedCount,
      unassignedCount,
      phase: 'executing',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Task dispatch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
