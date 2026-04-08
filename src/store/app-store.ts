import { create } from 'zustand'

export type ViewMode = 'landing' | 'workspace' | 'agents' | 'tasks' | 'showcase' | 'pricing' | 'compare' | 'history' | 'profile' | 'settings'

// ==================== Type Definitions ====================

export interface AIModel {
  id: string
  name: string
  provider: string
  icon: string
  creditsPerConversation: number
  description: string
  tier: 'free' | 'pro' | 'enterprise'
}

export interface AgentType {
  id: string
  name: string
  provider: string // claude-code, codex, openclaw, cursor, etc.
  description: string
  icon: string
  category: 'coding' | 'research' | 'creative' | 'automation' | 'strategy'
  capabilities: string[]
  status: 'available' | 'beta' | 'coming-soon'
  tags: string
  defaultModelId: string
  supportedModelIds: string[]
}

export interface AgentInstance {
  id: string
  agentTypeId: string
  name: string
  modelId: string
  status: 'idle' | 'working' | 'paused' | 'completed' | 'error'
  currentTask?: string
  createdAt: Date
}

export interface TaskNode {
  id: string
  goal: string
  status: 'pending' | 'planning' | 'executing' | 'reviewing' | 'completed' | 'failed'
  agentInstanceId: string
  parentId?: string
  children: TaskNode[]
  actions: TaskAction[]
  creditsUsed: number
  startedAt?: Date
  completedAt?: Date
}

export interface TaskAction {
  id: string
  type: 'think' | 'plan' | 'code' | 'research' | 'review' | 'file_op' | 'command' | 'error'
  description: string
  detail?: string
  timestamp: Date
  creditsCost: number
}

export interface ShowcaseItem {
  id: string
  title: string
  description: string
  category: string
  imagePrompt: string
  tags: string
}

export interface PlanTier {
  id: string
  name: string
  creditsPerMonth: number
  price: number
  features: string[]
  popular?: boolean
}

// ==================== App State ====================

interface AppState {
  // Navigation
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void

  // Models
  models: AIModel[]
  selectedModelId: string
  setSelectedModelId: (id: string) => void

  // Agent Types (Store catalog)
  agentTypes: AgentType[]
  setAgentTypes: (types: AgentType[]) => void

  // Agent Instances (user's running agents)
  agentInstances: AgentInstance[]
  addAgentInstance: (instance: AgentInstance) => void
  removeAgentInstance: (id: string) => void
  updateAgentInstance: (id: string, updates: Partial<AgentInstance>) => void

  // Tasks / Goal execution
  activeGoal: string
  setActiveGoal: (goal: string) => void
  taskTree: TaskNode | null
  setTaskTree: (tree: TaskNode | null) => void
  updateTaskNode: (taskId: string, updates: Partial<TaskNode>) => void

  // Showcase
  showcaseItems: ShowcaseItem[]
  setShowcaseItems: (items: ShowcaseItem[]) => void

  // Plans
  plans: PlanTier[]

  // User
  userCredits: number
  setUserCredits: (credits: number) => void
  userName: string
  setUserName: (name: string) => void

  // UI
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedAgentCategory: string
  setSelectedAgentCategory: (category: string) => void
}

// ==================== Default Data ====================

export const DEFAULT_MODELS: AIModel[] = [
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'Anthropic', icon: 'claude', creditsPerConversation: 2, description: 'Latest Claude model with strong reasoning', tier: 'free' },
  { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', provider: 'Anthropic', icon: 'claude', creditsPerConversation: 5, description: 'Most capable Claude model', tier: 'pro' },
  { id: 'gpt-5-4', name: 'GPT-5.4', provider: 'OpenAI', icon: 'openai', creditsPerConversation: 1, description: 'Latest GPT model', tier: 'free' },
  { id: 'gpt-5-4-mini', name: 'GPT-5.4 Mini', provider: 'OpenAI', icon: 'openai', creditsPerConversation: 0.5, description: 'Fast and affordable', tier: 'free' },
  { id: 'gemini-2-5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', icon: 'google', creditsPerConversation: 1, description: 'Google DeepMind flagship', tier: 'free' },
  { id: 'gemini-2-5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', icon: 'google', creditsPerConversation: 0.3, description: 'Fast Gemini model', tier: 'free' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', icon: 'deepseek', creditsPerConversation: 0.5, description: 'Efficient open-source model', tier: 'free' },
  { id: 'llama-4-maverick', name: 'Llama 4 Maverick', provider: 'Meta', icon: 'meta', creditsPerConversation: 0.5, description: 'Meta open-source model', tier: 'pro' },
]

export const DEFAULT_AGENT_TYPES: AgentType[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    provider: 'Anthropic',
    description: 'Agentic coding tool that understands your entire codebase and executes engineering tasks from the terminal. Supports Agent Teams for parallel execution.',
    icon: 'claude',
    category: 'coding',
    capabilities: ['Code Generation', 'Debugging', 'Refactoring', 'Agent Teams', 'Terminal Access', 'Multi-file Editing'],
    status: 'available',
    tags: 'claude,anthropic,coding,terminal,agent-teams',
    defaultModelId: 'claude-sonnet-4-6',
    supportedModelIds: ['claude-sonnet-4-6', 'claude-opus-4-6'],
  },
  {
    id: 'codex',
    name: 'Codex',
    provider: 'OpenAI',
    description: 'OpenAI\'s autonomous coding agent that works in cloud sandboxes. Generates full projects from natural language specs.',
    icon: 'openai',
    category: 'coding',
    capabilities: ['Full Project Generation', 'Sandbox Execution', 'Test Generation', 'Documentation', 'CI/CD Integration'],
    status: 'available',
    tags: 'openai,codex,cloud,sandbox,autonomous',
    defaultModelId: 'gpt-5-4',
    supportedModelIds: ['gpt-5-4', 'gpt-5-4-mini'],
  },
  {
    id: 'openclaw',
    name: 'OpenClaw',
    provider: 'Open Source',
    description: 'Open-source AI agent runtime with full computer control. Bridges AI models to your local machine for complex automation workflows.',
    icon: 'openclaw',
    category: 'automation',
    capabilities: ['Computer Use', 'Browser Automation', 'File Management', 'Multi-Agent Orchestration', '24/7 Autonomous'],
    status: 'available',
    tags: 'openclaw,open-source,computer-use,automation,24-7',
    defaultModelId: 'claude-sonnet-4-6',
    supportedModelIds: ['claude-sonnet-4-6', 'claude-opus-4-6', 'gpt-5-4', 'gemini-2-5-pro'],
  },
  {
    id: 'cursor',
    name: 'Cursor Agent',
    provider: 'Cursor',
    description: 'AI-first code editor with agent mode for multi-file editing and autonomous codebase-wide changes.',
    icon: 'cursor',
    category: 'coding',
    capabilities: ['Codebase Understanding', 'Multi-file Edit', 'Auto-complete', 'Code Review', 'Inline Chat'],
    status: 'available',
    tags: 'cursor,editor,coding,ide,agent',
    defaultModelId: 'claude-sonnet-4-6',
    supportedModelIds: ['claude-sonnet-4-6', 'claude-opus-4-6', 'gpt-5-4'],
  },
  {
    id: 'deep-research',
    name: 'Deep Research Agent',
    provider: 'Teamo',
    description: 'SOTA-level research agent with access to trillion-scale industry databases. Reads 1,000+ papers for investment-grade reporting.',
    icon: 'research',
    category: 'research',
    capabilities: ['Deep Research', 'Paper Analysis', 'Market Intelligence', 'Data Mining', 'Report Generation'],
    status: 'available',
    tags: 'research,deep-research,papers,database,reports',
    defaultModelId: 'claude-opus-4-6',
    supportedModelIds: ['claude-opus-4-6', 'claude-sonnet-4-6', 'gpt-5-4', 'gemini-2-5-pro'],
  },
  {
    id: 'marketing-agent',
    name: 'Marketing Strategist',
    provider: 'Teamo',
    description: 'Specialized agent for marketing campaigns, competitive analysis, content strategy, and growth planning.',
    icon: 'marketing',
    category: 'creative',
    capabilities: ['Campaign Planning', 'Content Strategy', 'SEO Analysis', 'Social Media', 'Competitive Intel'],
    status: 'available',
    tags: 'marketing,strategy,campaign,content,seo',
    defaultModelId: 'gpt-5-4',
    supportedModelIds: ['gpt-5-4', 'claude-sonnet-4-6', 'gemini-2-5-pro'],
  },
  {
    id: 'legal-analyst',
    name: 'Legal Analyst',
    provider: 'Teamo',
    description: 'AI agent for legal research, contract analysis, compliance review, and regulatory tracking.',
    icon: 'legal',
    category: 'strategy',
    capabilities: ['Legal Research', 'Contract Analysis', 'Compliance Review', 'Regulatory Tracking', 'Due Diligence'],
    status: 'beta',
    tags: 'legal,research,compliance,contracts,due-diligence',
    defaultModelId: 'claude-opus-4-6',
    supportedModelIds: ['claude-opus-4-6', 'claude-sonnet-4-6'],
  },
  {
    id: 'academic-writer',
    name: 'Academic Writer',
    provider: 'Teamo',
    description: 'Research paper writing, literature review, and academic content generation with proper citations.',
    icon: 'academic',
    category: 'research',
    capabilities: ['Paper Writing', 'Literature Review', 'Citation Management', 'Abstract Generation', 'Peer Review'],
    status: 'available',
    tags: 'academic,research,writing,papers,citations',
    defaultModelId: 'claude-sonnet-4-6',
    supportedModelIds: ['claude-sonnet-4-6', 'claude-opus-4-6', 'gpt-5-4'],
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    provider: 'Teamo',
    description: 'Data analysis, visualization, statistical modeling, and business intelligence reporting.',
    icon: 'data',
    category: 'strategy',
    capabilities: ['Data Analysis', 'Visualization', 'Statistical Modeling', 'BI Reporting', 'Dashboard Design'],
    status: 'available',
    tags: 'data,analysis,visualization,statistics,bi',
    defaultModelId: 'gpt-5-4',
    supportedModelIds: ['gpt-5-4', 'claude-sonnet-4-6', 'deepseek-v3'],
  },
  {
    id: 'code-reviewer',
    name: 'Code Review Agent',
    provider: 'Teamo',
    description: 'Automated code review agent that checks for bugs, security vulnerabilities, performance issues, and best practices.',
    icon: 'review',
    category: 'coding',
    capabilities: ['Bug Detection', 'Security Audit', 'Performance Review', 'Best Practices', 'PR Review'],
    status: 'beta',
    tags: 'code-review,security,bugs,performance,pr',
    defaultModelId: 'claude-sonnet-4-6',
    supportedModelIds: ['claude-sonnet-4-6', 'claude-opus-4-6'],
  },
]

export const DEFAULT_SHOWCASE: ShowcaseItem[] = [
  { id: 's1', title: '10,000-word Deep Research Business Report', description: 'Investment-grade industry analysis report', category: 'Deep Research', imagePrompt: '', tags: 'research,report,business' },
  { id: 's2', title: 'Marketing Campaign Idea Proposal', description: 'Complete marketing strategy with creative ideas', category: 'Creative Brainstorming', imagePrompt: '', tags: 'marketing,campaign,creative' },
  { id: 's3', title: 'X Posts Copywriting Practices', description: 'Social media content creation and optimization', category: 'Social Media', imagePrompt: '', tags: 'social,copywriting,twitter' },
  { id: 's4', title: 'AI Unicorns Strategic Insight Dashboard', description: 'Interactive strategy dashboard for AI startups', category: 'Strategy Dashboard', imagePrompt: '', tags: 'strategy,dashboard,ai,startups' },
  { id: 's5', title: 'Computational Sociology Research', description: 'Academic research on computational methods', category: 'Research Topic', imagePrompt: '', tags: 'research,sociology,academic' },
  { id: 's6', title: 'Full-Stack E-Commerce Platform', description: 'Complete e-commerce app built by AI agents', category: 'Code Generation', imagePrompt: '', tags: 'code,ecommerce,fullstack' },
]

export const DEFAULT_PLANS: PlanTier[] = [
  { id: 'starter', name: 'Starter', creditsPerMonth: 1000, price: 0, features: ['All 8 models included', 'Basic deep research', 'Single user', 'Community support'] },
  { id: 'pro', name: 'Pro', creditsPerMonth: 5000, price: 29, features: ['All 8 models included', 'Advanced deep research', 'Priority task queue', 'Email support'], popular: true },
  { id: 'team', name: 'Team', creditsPerMonth: 20000, price: 99, features: ['All 8 models included', 'Unlimited deep research', '5 team seats', 'Dedicated account manager', 'API access'] },
]

// ==================== Store ====================

export const useAppStore = create<AppState>((set, get) => ({
  viewMode: 'landing',
  setViewMode: (mode) => set({ viewMode: mode }),

  models: DEFAULT_MODELS,
  selectedModelId: 'claude-sonnet-4-6',
  setSelectedModelId: (id) => set({ selectedModelId: id }),

  agentTypes: [],
  setAgentTypes: (types) => set({ agentTypes: types }),

  agentInstances: [],
  addAgentInstance: (instance) => set((state) => ({ agentInstances: [...state.agentInstances, instance] })),
  removeAgentInstance: (id) => set((state) => ({ agentInstances: state.agentInstances.filter((a) => a.id !== id) })),
  updateAgentInstance: (id, updates) => set((state) => ({
    agentInstances: state.agentInstances.map((a) => a.id === id ? { ...a, ...updates } : a),
  })),

  activeGoal: '',
  setActiveGoal: (goal) => set({ activeGoal: goal }),
  taskTree: null,
  setTaskTree: (tree) => set({ taskTree: tree }),
  updateTaskNode: (taskId, updates) => {
    const { taskTree } = get()
    if (!taskTree) return
    const updateInTree = (node: TaskNode): TaskNode => {
      if (node.id === taskId) return { ...node, ...updates }
      return { ...node, children: node.children.map(updateInTree) }
    }
    set({ taskTree: updateInTree(taskTree) })
  },

  showcaseItems: DEFAULT_SHOWCASE,
  setShowcaseItems: (items) => set({ showcaseItems: items }),

  plans: DEFAULT_PLANS,

  userCredits: 1000,
  setUserCredits: (credits) => set({ userCredits: credits }),
  userName: 'Alex Chen',
  setUserName: (name) => set({ userName: name }),

  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedAgentCategory: 'all',
  setSelectedAgentCategory: (category) => set({ selectedAgentCategory: category }),
}))
