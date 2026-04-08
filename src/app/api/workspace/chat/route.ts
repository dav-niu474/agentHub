import { NextRequest, NextResponse } from 'next/server'

interface HiredAgent {
  id: string
  name: string
  provider: string
  category: string
  capabilities: string[]
  status: string
}

interface TaskSuggestion {
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high'
  assignedAgentId: string
  assignedAgentName: string
}

// Category-keyword mapping for task assignment
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  coding: ['code', 'build', 'develop', 'implement', 'program', 'api', 'frontend', 'backend', 'database', 'schema', 'auth', 'login', 'register', 'component', 'feature', 'function', 'class', 'module', 'test', 'deploy', 'debug', 'refactor', 'optimize', 'performance', 'server', 'endpoint', 'route', 'migrate', 'integration', 'ci/cd', 'pipeline', 'scaffold', 'setup', 'install', 'configure', 'web', 'app', 'mobile', 'react', 'next', 'node', 'typescript', 'css', 'html', 'ui', 'ux'],
  research: ['research', 'analyze', 'investigate', 'study', 'survey', 'report', 'data', 'market', 'competitor', 'trend', 'industry', 'benchmark', 'insight', 'findings', 'literature', 'paper', 'academic', 'science', 'statistics', 'quantitative', 'qualitative'],
  creative: ['design', 'write', 'content', 'copy', 'blog', 'article', 'social media', 'marketing', 'brand', 'creative', 'video', 'image', 'graphic', 'logo', 'campaign', 'ad', 'advertisement', 'slogan', 'tagline', 'story', 'narrative', 'email', 'newsletter'],
  automation: ['automate', 'workflow', 'process', 'schedule', 'script', 'cron', 'monitor', 'alert', 'notification', 'bot', 'robot', 'pipeline', 'deploy', 'ci', 'cd', 'devops', 'infrastructure', 'serverless', 'cloud', 'aws', 'docker', 'kubernetes'],
  strategy: ['strategy', 'plan', 'roadmap', 'vision', 'goal', 'objective', 'kpi', 'metric', 'growth', 'revenue', 'business', 'startup', 'pivot', 'scale', 'launch', 'go-to-market', 'pricing', 'competitive', 'swot', 'legal', 'compliance', 'contract', 'regulation'],
}

// Task templates based on common development patterns
const TASK_TEMPLATES: Record<string, TaskSuggestion[]> = {
  'ecommerce': [
    { title: 'Design database schema', description: 'Create the database schema for users, products, orders, payments, and categories with proper relationships and indexes.', category: 'coding', priority: 'high', assignedAgentId: '', assignedAgentName: '' },
    { title: 'Implement user authentication', description: 'Build complete auth system with registration, login, password reset, and session management.', category: 'coding', priority: 'high', assignedAgentId: '', assignedAgentName: '' },
    { title: 'Build product catalog API', description: 'Create RESTful API endpoints for product CRUD operations, search, filtering, and pagination.', category: 'coding', priority: 'high', assignedAgentId: '', assignedAgentName: '' },
    { title: 'Implement shopping cart', description: 'Build shopping cart functionality with add/remove items, quantity management, and price calculation.', category: 'coding', priority: 'medium', assignedAgentId: '', assignedAgentName: '' },
    { title: 'Payment integration', description: 'Integrate payment gateway (Stripe) for checkout, subscription management, and refund handling.', category: 'coding', priority: 'high', assignedAgentId: '', assignedAgentName: '' },
    { title: 'Write comprehensive tests', description: 'Create unit tests and integration tests for all API endpoints and critical business logic.', category: 'coding', priority: 'medium', assignedAgentId: '', assignedAgentName: '' },
  ],
  'saas': [
    { title: 'Design SaaS architecture', description: 'Plan multi-tenant architecture, data isolation strategy, and scalable infrastructure design.', category: 'strategy', priority: 'high', assignedAgentId: '', assignedAgentName: '' },
    { title: 'Build subscription billing', description: 'Implement subscription management with tiered pricing, free trials, and usage-based billing.', category: 'coding', priority: 'high', assignedAgentId: '', assignedAgentName: '' },
    { title: 'Create user dashboard', description: 'Build the main user dashboard with data visualization, settings, and account management.', category: 'coding', priority: 'high', assignedAgentId: '', assignedAgentName: '' },
    { title: 'Set up CI/CD pipeline', description: 'Configure automated testing, building, and deployment pipeline with staging and production environments.', category: 'automation', priority: 'medium', assignedAgentId: '', assignedAgentName: '' },
  ],
  'blog': [
    { title: 'Set up CMS structure', description: 'Create the content management system with posts, categories, tags, and media management.', category: 'coding', priority: 'high', assignedAgentId: '', assignedAgentName: '' },
    { title: 'Build blog frontend', description: 'Design and implement the blog UI with post listing, detail pages, search, and responsive design.', category: 'coding', priority: 'high', assignedAgentId: '', assignedAgentName: '' },
    { title: 'Implement SEO optimization', description: 'Add meta tags, sitemap generation, Open Graph support, and structured data markup.', category: 'creative', priority: 'medium', assignedAgentId: '', assignedAgentName: '' },
  ],
  'ai': [
    { title: 'Research AI/ML approaches', description: 'Analyze available AI models and APIs for the use case. Compare accuracy, cost, and latency.', category: 'research', priority: 'high', assignedAgentId: '', assignedAgentName: '' },
    { title: 'Build AI integration layer', description: 'Create the backend service for AI model communication, caching, and error handling.', category: 'coding', priority: 'high', assignedAgentId: '', assignedAgentName: '' },
    { title: 'Design prompt engineering strategy', description: 'Develop optimized prompts for different use cases with fallback strategies and rate limiting.', category: 'strategy', priority: 'medium', assignedAgentId: '', assignedAgentName: '' },
    { title: 'Implement monitoring & analytics', description: 'Set up usage tracking, cost monitoring, and performance analytics for AI features.', category: 'automation', priority: 'medium', assignedAgentId: '', assignedAgentName: '' },
  ],
  'marketing': [
    { title: 'Market research & analysis', description: 'Conduct thorough market research including competitor analysis, target audience profiling, and trend identification.', category: 'research', priority: 'high', assignedAgentId: '', assignedAgentName: '' },
    { title: 'Create content strategy', description: 'Develop a comprehensive content marketing plan with editorial calendar, channels, and KPIs.', category: 'creative', priority: 'high', assignedAgentId: '', assignedAgentName: '' },
    { title: 'Design brand guidelines', description: 'Create brand identity guidelines including visual identity, tone of voice, and messaging framework.', category: 'creative', priority: 'medium', assignedAgentId: '', assignedAgentName: '' },
  ],
  'default': [
    { title: 'Project planning & research', description: 'Analyze requirements, research best practices, and create a detailed implementation plan.', category: 'research', priority: 'high', assignedAgentId: '', assignedAgentName: '' },
    { title: 'Core implementation', description: 'Implement the main functionality based on the project requirements and plan.', category: 'coding', priority: 'high', assignedAgentId: '', assignedAgentName: '' },
    { title: 'Testing & QA', description: 'Create comprehensive test suite and perform quality assurance checks.', category: 'coding', priority: 'medium', assignedAgentId: '', assignedAgentName: '' },
    { title: 'Documentation & deployment', description: 'Write project documentation, user guides, and set up deployment pipeline.', category: 'automation', priority: 'medium', assignedAgentId: '', assignedAgentName: '' },
  ],
}

function detectProjectType(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('ecommerce') || lower.includes('e-commerce') || lower.includes('shop') || lower.includes('store') || lower.includes('cart') || lower.includes('payment') || lower.includes('checkout') || lower.includes('product')) return 'ecommerce'
  if (lower.includes('saas') || lower.includes('subscription') || lower.includes('billing') || lower.includes('multi-tenant')) return 'saas'
  if (lower.includes('blog') || lower.includes('cms') || lower.includes('content') || lower.includes('article') || lower.includes('post')) return 'blog'
  if (lower.includes('ai') || lower.includes('machine learning') || lower.includes('ml') || lower.includes('llm') || lower.includes('gpt') || lower.includes('claude') || lower.includes('chatbot') || lower.includes('agent')) return 'ai'
  if (lower.includes('marketing') || lower.includes('campaign') || lower.includes('brand') || lower.includes('seo') || lower.includes('social media')) return 'marketing'
  return 'default'
}

function matchAgentToTask(task: TaskSuggestion, agents: HiredAgent[]): HiredAgent | null {
  // Find agents that match the task category
  const categoryMatch = agents.filter(a => a.category === task.category && a.status !== 'working')

  if (categoryMatch.length > 0) {
    // Pick the first available idle agent in matching category
    const idleAgent = categoryMatch.find(a => a.status === 'idle')
    if (idleAgent) return idleAgent
    // If all working, pick the least busy one
    return categoryMatch[0]
  }

  // Fallback: find any coding agent for coding tasks
  if (task.category === 'coding') {
    const codingAgent = agents.find(a => (a.category === 'coding' || a.capabilities.some(c => task.title.toLowerCase().includes(c.toLowerCase()))) && a.status !== 'working')
    if (codingAgent) return codingAgent
  }

  // Final fallback: any idle agent
  const anyIdle = agents.find(a => a.status === 'idle')
  if (anyIdle) return anyIdle

  // Last resort: any agent
  return agents[0] || null
}

function assignTasks(agents: HiredAgent[], userMessage: string): { tasks: TaskSuggestion[]; response: string } {
  const projectType = detectProjectType(userMessage)
  const templates = TASK_TEMPLATES[projectType] || TASK_TEMPLATES.default

  // Deep clone templates
  const tasks: TaskSuggestion[] = templates.map(t => ({ ...t }))

  // Track how many tasks each agent gets (round-robin distribution)
  const agentTaskCount: Map<string, number> = new Map()
  const assignments: Map<string, HiredAgent> = new Map()

  for (const task of tasks) {
    // Find all agents matching the task category
    const categoryMatch = agents.filter(a => a.category === task.category)
    let bestAgent: HiredAgent | null = null

    if (categoryMatch.length > 0) {
      // Pick the agent with fewest assigned tasks
      categoryMatch.sort((a, b) => (agentTaskCount.get(a.id) || 0) - (agentTaskCount.get(b.id) || 0))
      bestAgent = categoryMatch[0]
    } else {
      // Fallback: any idle agent with fewest tasks
      const sorted = [...agents].sort((a, b) => (agentTaskCount.get(a.id) || 0) - (agentTaskCount.get(b.id) || 0))
      bestAgent = sorted[0] || null
    }

    if (bestAgent) {
      task.assignedAgentId = bestAgent.id
      task.assignedAgentName = bestAgent.name
      assignments.set(task.title, bestAgent)
      agentTaskCount.set(bestAgent.id, (agentTaskCount.get(bestAgent.id) || 0) + 1)
    }
  }

  // Generate response
  const projectName = userMessage.slice(0, 80)
  const assignedCount = tasks.filter(t => t.assignedAgentId).length
  const unassignedCount = tasks.length - assignedCount

  let response = `I've analyzed your request and created **${tasks.length} tasks** for your project.\n\n`

  if (assignedCount > 0) {
    response += `**Task Assignment:**\n\n`
    for (const task of tasks) {
      if (task.assignedAgentId) {
        const agent = assignments.get(task.title)
        response += `- **${task.title}** → ${agent?.name} (${task.category})\n`
      }
    }
    response += '\n'
  }

  if (unassignedCount > 0) {
    response += `⚠️ **${unassignedCount} task(s)** could not be auto-assigned. Please hire more agents or assign manually.\n\n`
  }

  response += `I'm dispatching tasks to your agent team now. You can monitor progress in the task board on the right, or check individual agent workspaces in the sidebar.`

  // If no agents hired
  if (agents.length === 0) {
    response = `I understand you want to: **"${projectName}"**\n\nI've broken this down into **${tasks.length} tasks**, but you haven't hired any agents yet!\n\nPlease go to the **Agent Store** to hire agents first. I recommend:\n- **Claude Code** for coding tasks\n- **Codex** for full project generation\n- **Deep Research Agent** for analysis\n\nOnce you have agents hired, come back and I'll assign the tasks automatically.`
  }

  return { tasks, response }
}

// Generate contextual AI responses for follow-up messages
function generateFollowUpResponse(message: string, _chatHistory: Array<{ role: string; content: string }>): string {
  const lower = message.toLowerCase()

  if (lower.includes('progress') || lower.includes('status') || lower.includes('how')) {
    return `Here's the current status of your project:\n\n**Active Tasks:** Check the task board on the right for real-time progress updates.\n\nYour agents are working autonomously. I'll notify you as soon as any task is completed. You can also click on an agent in the sidebar to see their individual workspace.`
  }

  if (lower.includes('add task') || lower.includes('new task') || lower.includes('create task')) {
    return `I can create new tasks for you! Just describe what you need done, and I'll:\n\n1. **Analyze** the requirement\n2. **Create** an appropriate task\n3. **Assign** it to the best-suited available agent\n4. **Dispatch** it for autonomous execution\n\nWhat task would you like to add?`
  }

  if (lower.includes('result') || lower.includes('output') || lower.includes('deliver') || lower.includes('complete')) {
    return `Task results are available in the **Tasks** view. When agents complete their work:\n\n- ✅ Results are stored with each task\n- 📧 Email notifications are sent\n- 📁 Output files are attached\n\nYou can also check the notification bell for updates.`
  }

  if (lower.includes('hire') || lower.includes('agent') || lower.includes('add agent')) {
    return `To hire agents, click on **"Agents"** in the sidebar or use the **Hire (+)** button at the bottom.\n\n**Recommended agents for development:**\n- 🔶 **Claude Code** — Terminal-based coding with multi-file editing\n- 🟢 **Codex** — Full project generation in cloud sandboxes\n- 🟣 **OpenClaw** — Computer automation and browser control\n- 🔵 **Deep Research** — Comprehensive analysis and reporting\n\nEach agent has unique strengths. Hiring more agents allows for better task parallelization!`
  }

  if (lower.includes('thank') || lower.includes('thanks') || lower.includes('great')) {
    return `You're welcome! I'm here to help coordinate your agent team. Feel free to:\n\n- Describe new requirements to create more tasks\n- Check agent progress in the sidebar\n- Review completed task results\n\nYour AI agents are working 24/7. Just ask if you need anything! 🚀`
  }

  // Default follow-up
  return `I'm your AI project coordinator. I can help you:\n\n1. **Create tasks** — Describe what you need and I'll break it down\n2. **Assign agents** — Tasks are auto-assigned based on agent strengths\n3. **Monitor progress** — Check the task board for real-time updates\n4. **Manage workflow** — Add, prioritize, and track all your tasks\n\nWhat would you like to do next?`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, chatHistory, hiredAgents } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 1000))

    const agents: HiredAgent[] = hiredAgents || []
    const history: Array<{ role: string; content: string }> = chatHistory || []

    // Check if this is a task-creation request (first substantive message or contains project keywords)
    const lowerMessage = message.toLowerCase()
    const isTaskRequest =
      lowerMessage.includes('build') ||
      lowerMessage.includes('create') ||
      lowerMessage.includes('develop') ||
      lowerMessage.includes('implement') ||
      lowerMessage.includes('make') ||
      lowerMessage.includes('design') ||
      lowerMessage.includes('set up') ||
      lowerMessage.includes('need') ||
      lowerMessage.includes('want') ||
      lowerMessage.includes('project') ||
      lowerMessage.includes('platform') ||
      lowerMessage.includes('app') ||
      lowerMessage.includes('website') ||
      lowerMessage.includes('system') ||
      lowerMessage.includes('tool') ||
      lowerMessage.includes('dashboard') ||
      lowerMessage.includes('write') ||
      lowerMessage.includes('research') ||
      lowerMessage.includes('analyze')

    // Determine if this is the first task-creating message
    const hasPreviousTaskCreation = history.some((m) =>
      m.role === 'assistant' && m.content.includes('created')
    )

    let tasks: TaskSuggestion[] = []
    let response = ''

    if (isTaskRequest && !hasPreviousTaskCreation) {
      // Generate tasks from the user's request
      const result = assignTasks(agents, message)
      tasks = result.tasks
      response = result.response
    } else {
      // Follow-up conversation
      response = generateFollowUpResponse(message, history)
    }

    return NextResponse.json({
      message: response,
      tasks,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Workspace chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
