'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Brain,
  ClipboardList,
  Code,
  Search,
  Eye,
  FileText,
  Terminal,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Rocket,
  Users,
  Zap,
  Circle,
  CheckCircle2,
  Loader2,
  XCircle,
  X,
  Target,
  Clock,
  Coins,
  Cpu,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useAppStore, type TaskNode, type TaskAction, type AgentInstance, DEFAULT_AGENT_TYPES } from '@/store/app-store'
import { cn } from '@/lib/utils'

// ---------- Action type icon mapping ----------

const ACTION_ICONS: Record<TaskAction['type'], React.ElementType> = {
  think: Brain,
  plan: ClipboardList,
  code: Code,
  research: Search,
  review: Eye,
  file_op: FileText,
  command: Terminal,
  error: AlertCircle,
}

const ACTION_COLORS: Record<TaskAction['type'], string> = {
  think: 'text-purple-500',
  plan: 'text-amber-500',
  code: 'text-emerald-500',
  research: 'text-sky-500',
  review: 'text-orange-500',
  file_op: 'text-rose-500',
  command: 'text-gray-500',
  error: 'text-red-500',
}

const ACTION_LABELS: Record<TaskAction['type'], string> = {
  think: 'Thinking',
  plan: 'Planning',
  code: 'Coding',
  research: 'Researching',
  review: 'Reviewing',
  file_op: 'File Operation',
  command: 'Running Command',
  error: 'Error',
}

// ---------- Agent status config ----------

const AGENT_STATUS_CONFIG: Record<AgentInstance['status'], { label: string; color: string; dotClass: string }> = {
  idle: { label: 'Idle', color: 'bg-gray-100 text-gray-600', dotClass: 'bg-gray-400' },
  working: { label: 'Working', color: 'bg-emerald-50 text-emerald-700', dotClass: 'bg-emerald-500 animate-pulse' },
  paused: { label: 'Paused', color: 'bg-amber-50 text-amber-700', dotClass: 'bg-amber-500' },
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700', dotClass: 'bg-emerald-500' },
  error: { label: 'Error', color: 'bg-red-50 text-red-700', dotClass: 'bg-red-500' },
}

const TASK_STATUS_CONFIG: Record<TaskNode['status'], { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-600', icon: Circle },
  planning: { label: 'Planning', color: 'bg-amber-100 text-amber-700', icon: ClipboardList },
  executing: { label: 'Executing', color: 'bg-emerald-100 text-emerald-700', icon: Loader2 },
  reviewing: { label: 'Reviewing', color: 'bg-orange-100 text-orange-700', icon: Eye },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: XCircle },
}

// ---------- Helpers ----------

function getProgressForStatus(status: TaskNode['status']): number {
  switch (status) {
    case 'pending': return 0
    case 'planning': return 15
    case 'executing': return 55
    case 'reviewing': return 80
    case 'completed': return 100
    case 'failed': return 100
    default: return 0
  }
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function getAgentTypeForInstance(instance: AgentInstance) {
  return DEFAULT_AGENT_TYPES.find((t) => t.id === instance.agentTypeId)
}

// ---------- Agent Instance Card ----------

function AgentInstanceCard({ instance }: { instance: AgentInstance }) {
  const removeAgentInstance = useAppStore((s) => s.removeAgentInstance)
  const agentType = getAgentTypeForInstance(instance)
  const statusConfig = AGENT_STATUS_CONFIG[instance.status]

  return (
    <Card className="group relative rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-200">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1.5 top-1.5 h-6 w-6 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
        onClick={() => removeAgentInstance(instance.id)}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-600 text-white">
          <Cpu className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate">{instance.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">{agentType?.provider || 'Unknown'}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className={cn('rounded-full text-[11px] font-medium border-0 gap-1', statusConfig.color)}>
          <span className={cn('h-1.5 w-1.5 rounded-full', statusConfig.dotClass)} />
          {statusConfig.label}
        </Badge>
        {instance.currentTask && (
          <span className="text-[10px] text-muted-foreground truncate ml-2 max-w-[100px]">
            {instance.currentTask}
          </span>
        )}
      </div>
    </Card>
  )
}

// ---------- Task Action Item ----------

function TaskActionItem({ action }: { action: TaskAction }) {
  const Icon = ACTION_ICONS[action.type]
  return (
    <div className="flex items-start gap-2.5 py-1.5 px-1 rounded-md hover:bg-gray-50 transition-colors">
      <div className={cn('mt-0.5 shrink-0', ACTION_COLORS[action.type])}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
            {ACTION_LABELS[action.type]}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatTime(action.timestamp)}
          </span>
        </div>
        <p className="text-[13px] text-gray-700 leading-relaxed">{action.description}</p>
        {action.detail && (
          <p className="text-[12px] text-muted-foreground mt-0.5">{action.detail}</p>
        )}
      </div>
      {action.creditsCost > 0 && (
        <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-0.5">
          <Coins className="h-2.5 w-2.5" />
          {action.creditsCost.toFixed(1)}
        </span>
      )}
    </div>
  )
}

// ---------- Task Tree Node ----------

function TaskTreeNode({ node, depth = 0 }: { node: TaskNode; depth?: number }) {
  const [isOpen, setIsOpen] = useState(true)
  const statusConfig = TASK_STATUS_CONFIG[node.status]
  const StatusIcon = statusConfig.icon
  const progress = getProgressForStatus(node.status)

  return (
    <div className="ml-0">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div
            className={cn(
              'group flex items-center gap-2 rounded-lg p-2.5 cursor-pointer transition-all duration-150',
              'hover:bg-gray-50',
              depth === 0 && 'bg-white border border-gray-100 shadow-sm hover:shadow-md',
            )}
          >
            {/* Expand/collapse arrow */}
            <div className="shrink-0 text-muted-foreground">
              {node.children.length > 0 ? (
                isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )
              ) : (
                <span className="w-4" />
              )}
            </div>

            {/* Status icon */}
            <div className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
              statusConfig.color,
            )}>
              <StatusIcon className={cn('h-3.5 w-3.5', node.status === 'executing' && 'animate-spin')} />
            </div>

            {/* Goal / description */}
            <div className="min-w-0 flex-1">
              <p className={cn(
                'text-sm truncate',
                depth === 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-800',
              )}>
                {node.goal}
              </p>
            </div>

            {/* Status badge */}
            <Badge variant="secondary" className={cn('rounded-full text-[10px] font-medium border-0 shrink-0', statusConfig.color)}>
              {statusConfig.label}
            </Badge>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          {/* Progress bar */}
          <div className="px-3 py-1.5">
            <div className="flex items-center gap-2">
              <Progress value={progress} className="h-1.5 flex-1" />
              <span className="text-[11px] text-muted-foreground w-8 text-right">{progress}%</span>
            </div>
          </div>

          {/* Action log */}
          {node.actions.length > 0 && (
            <div className="ml-6 mb-2 mr-2 rounded-lg bg-gray-50/70 border border-gray-100 p-2">
              <div className="flex items-center gap-1.5 mb-1.5 px-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Action Log
                </span>
                <Badge variant="secondary" className="rounded-full text-[10px] bg-gray-100 text-gray-500 border-0 ml-auto px-1.5 py-0">
                  {node.actions.length}
                </Badge>
              </div>
              <ScrollArea className="max-h-48">
                <div className="space-y-0.5">
                  {node.actions.map((action) => (
                    <TaskActionItem key={action.id} action={action} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Children nodes */}
          {node.children.length > 0 && (
            <div className="ml-4 pl-3 border-l-2 border-gray-100 space-y-1 mb-1">
              {node.children.map((child) => (
                <TaskTreeNode key={child.id} node={child} depth={depth + 1} />
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

// ---------- Credits Summary ----------

function CreditsSummary({ totalCredits }: { totalCredits: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
        <Coins className="h-4 w-4 text-amber-600" />
      </div>
      <div className="flex-1">
        <p className="text-[11px] font-medium text-amber-700 uppercase tracking-wider">Credits Used</p>
        <p className="text-lg font-bold text-amber-900">{totalCredits.toFixed(1)}</p>
      </div>
      <div className="text-right">
        <p className="text-[11px] text-amber-600">Rate</p>
        <p className="text-sm font-medium text-amber-800">~0.05/min</p>
      </div>
    </div>
  )
}

// ---------- Sum credits from task tree ----------

function sumCredits(node: TaskNode): number {
  let total = node.creditsUsed
  for (const action of node.actions) {
    total += action.creditsCost
  }
  for (const child of node.children) {
    total += sumCredits(child)
  }
  return total
}

// ---------- Generate mock task tree ----------

function generateMockTaskTree(
  goal: string,
  agentInstances: AgentInstance[],
): TaskNode {
  const now = new Date()
  const agents = agentInstances.length > 0 ? agentInstances : [
    { id: 'mock-1', agentTypeId: 'claude-code', name: 'Claude Code', modelId: 'claude-sonnet-4-6', status: 'working' as const, createdAt: now },
    { id: 'mock-2', agentTypeId: 'deep-research', name: 'Deep Research', modelId: 'claude-opus-4-6', status: 'working' as const, createdAt: now },
    { id: 'mock-3', agentTypeId: 'code-reviewer', name: 'Code Reviewer', modelId: 'claude-sonnet-4-6', status: 'idle' as const, createdAt: now },
  ]

  const makeAction = (
    type: TaskAction['type'],
    description: string,
    offsetMs: number,
    creditsCost: number,
    detail?: string,
  ): TaskAction => ({
    id: `action-${Math.random().toString(36).slice(2, 9)}`,
    type,
    description,
    detail,
    timestamp: new Date(now.getTime() + offsetMs),
    creditsCost,
  })

  // Root task
  const rootActions: TaskAction[] = [
    makeAction('think', `Analyzing goal: "${goal}"`, 0, 0.3),
    makeAction('plan', 'Breaking down into subtasks for agent team', 2000, 0.2),
    makeAction('plan', `Assigned ${agents.length} agents to parallel workstreams`, 4000, 0.1),
  ]

  // Subtask 1: Research
  const researchActions: TaskAction[] = [
    makeAction('research', 'Scanning existing solutions and best practices', 5000, 0.5, 'Found 23 relevant references'),
    makeAction('research', 'Analyzing competitive landscape', 8000, 0.8),
    makeAction('think', 'Synthesizing research findings into actionable plan', 12000, 0.3),
    makeAction('plan', 'Creating detailed implementation roadmap', 15000, 0.2),
  ]

  // Subtask 2: Implementation
  const implActions: TaskAction[] = [
    makeAction('plan', 'Setting up project structure and dependencies', 6000, 0.2),
    makeAction('file_op', 'Created project scaffolding', 8000, 0.1, '12 files created'),
    makeAction('code', 'Implementing core functionality', 12000, 1.5, 'src/core/main.ts — 340 lines'),
    makeAction('code', 'Building API endpoints', 18000, 1.2, 'src/api/routes.ts — 185 lines'),
    makeAction('command', 'Running build and lint checks', 22000, 0.1, 'All checks passed'),
    makeAction('file_op', 'Writing documentation', 24000, 0.1),
  ]

  // Subtask 3: Review
  const reviewActions: TaskAction[] = [
    makeAction('review', 'Reviewing code quality and architecture', 25000, 0.3),
    makeAction('review', 'Checking for security vulnerabilities', 28000, 0.2, 'No critical issues found'),
  ]

  const subtask1: TaskNode = {
    id: 'subtask-research',
    goal: 'Research & Analysis',
    status: 'completed',
    agentInstanceId: agents[1]?.id || 'mock-2',
    children: [],
    actions: researchActions,
    creditsUsed: 1.8,
    startedAt: new Date(now.getTime() + 5000),
    completedAt: new Date(now.getTime() + 15000),
  }

  const subtask2: TaskNode = {
    id: 'subtask-impl',
    goal: 'Implementation',
    status: agents.length > 1 ? 'executing' : 'reviewing',
    agentInstanceId: agents[0]?.id || 'mock-1',
    children: [],
    actions: implActions,
    creditsUsed: 3.1,
    startedAt: new Date(now.getTime() + 6000),
  }

  const subtask3: TaskNode = {
    id: 'subtask-review',
    goal: 'Code Review & QA',
    status: agents.length > 2 ? 'planning' : 'pending',
    agentInstanceId: agents[2]?.id || 'mock-3',
    children: [],
    actions: agents.length > 2 ? reviewActions : [],
    creditsUsed: agents.length > 2 ? 0.5 : 0,
    startedAt: agents.length > 2 ? new Date(now.getTime() + 25000) : undefined,
  }

  return {
    id: 'root-task',
    goal,
    status: 'executing',
    agentInstanceId: agents[0]?.id || 'mock-1',
    children: [subtask1, subtask2, subtask3],
    actions: rootActions,
    creditsUsed: 0.6,
    startedAt: now,
  }
}

// ---------- Empty State ----------

function EmptyState() {
  const setViewMode = useAppStore((s) => s.setViewMode)

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-gray-200">
          <Target className="h-10 w-10 text-slate-400" />
        </div>
        <div className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Deploy</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        Set a goal and deploy agents to watch your AI team work together in real-time.
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setViewMode('agents')}
        >
          <Users className="h-4 w-4 mr-1.5" />
          Browse Agents
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setViewMode('marketplace')}
        >
          <Rocket className="h-4 w-4 mr-1.5" />
          Agent Store
        </Button>
      </div>
    </div>
  )
}

// ---------- Left Panel ----------

function LeftPanel() {
  const {
    activeGoal,
    setActiveGoal,
    agentInstances,
    addAgentInstance,
    removeAgentInstance,
    selectedModelId,
    setSelectedModelId,
    models,
    setTaskTree,
    updateAgentInstance,
    setViewMode,
  } = useAppStore()

  const [isDeploying, setIsDeploying] = useState(false)

  const handleDeploy = useCallback(() => {
    if (!activeGoal.trim()) return

    setIsDeploying(true)

    // If no agent instances, add some mock ones
    if (agentInstances.length === 0) {
      const mockInstances: AgentInstance[] = [
        {
          id: 'inst-claude-' + Date.now(),
          agentTypeId: 'claude-code',
          name: 'Claude Code',
          modelId: selectedModelId,
          status: 'working',
          currentTask: 'Implementation',
          createdAt: new Date(),
        },
        {
          id: 'inst-research-' + Date.now(),
          agentTypeId: 'deep-research',
          name: 'Deep Research Agent',
          modelId: selectedModelId,
          status: 'working',
          currentTask: 'Research & Analysis',
          createdAt: new Date(),
        },
        {
          id: 'inst-review-' + Date.now(),
          agentTypeId: 'code-reviewer',
          name: 'Code Review Agent',
          modelId: selectedModelId,
          status: 'idle',
          currentTask: 'Waiting for code',
          createdAt: new Date(),
        },
      ]
      mockInstances.forEach((inst) => addAgentInstance(inst))
      // Generate task tree with mock instances
      setTimeout(() => {
        const tree = generateMockTaskTree(activeGoal, mockInstances)
        setTaskTree(tree)
        setIsDeploying(false)
      }, 800)
    } else {
      // Generate task tree with existing instances
      const workingInstances = agentInstances.map((inst) => ({
        ...inst,
        status: 'working' as const,
      }))
      workingInstances.forEach((inst) => updateAgentInstance(inst.id, { status: 'working' }))

      setTimeout(() => {
        const tree = generateMockTaskTree(activeGoal, workingInstances)
        setTaskTree(tree)
        setIsDeploying(false)
      }, 800)
    }
  }, [activeGoal, agentInstances, addAgentInstance, setTaskTree, selectedModelId, updateAgentInstance])

  const currentModel = models.find((m) => m.id === selectedModelId)

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-5">
        {/* ---- Goal Input ---- */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-600">
              <Target className="h-3.5 w-3.5 text-white" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Your Goal</h2>
          </div>
          <Textarea
            placeholder="Describe your goal... e.g., 'Build a full-stack e-commerce platform with user auth, product catalog, and payment integration'"
            value={activeGoal}
            onChange={(e) => setActiveGoal(e.target.value)}
            className="min-h-[100px] resize-none rounded-xl border-gray-200 bg-gray-50/50 text-sm leading-relaxed placeholder:text-gray-400 focus-visible:border-slate-400 focus-visible:ring-slate-200 focus-visible:bg-white transition-all"
          />
          <Button
            onClick={handleDeploy}
            disabled={!activeGoal.trim() || isDeploying}
            className="w-full h-10 rounded-xl bg-gradient-to-r from-slate-800 to-slate-600 hover:from-slate-700 hover:to-slate-500 text-white text-sm font-medium gap-2 shadow-sm transition-all hover:shadow-md disabled:opacity-50"
          >
            {isDeploying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                Deploy Agents
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </>
            )}
          </Button>
        </div>

        <Separator className="!bg-gray-100" />

        {/* ---- Agent Team ---- */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                <Users className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900">My Agent Team</h2>
              {agentInstances.length > 0 && (
                <Badge variant="secondary" className="rounded-full text-[10px] bg-emerald-50 text-emerald-700 border-0 px-1.5 py-0">
                  {agentInstances.length}
                </Badge>
              )}
            </div>
          </div>

          {agentInstances.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {agentInstances.map((instance) => (
                <AgentInstanceCard key={instance.id} instance={instance} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 py-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 mx-auto mb-2">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">No agents deployed</p>
              <button
                onClick={() => setViewMode('agents')}
                className="text-sm font-medium text-slate-700 hover:text-slate-900 hover:underline transition-colors"
              >
                Add agents from the Agent Store
              </button>
            </div>
          )}
        </div>

        <Separator className="!bg-gray-100" />

        {/* ---- Model Selector ---- */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
              <Cpu className="h-3.5 w-3.5 text-violet-600" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Model</h2>
          </div>
          <Select value={selectedModelId} onValueChange={setSelectedModelId}>
            <SelectTrigger className="w-full rounded-xl border-gray-200 bg-gray-50/50 text-sm">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      ({model.provider}) &middot; {model.creditsPerConversation} credits
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentModel && (
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              {currentModel.description}
            </p>
          )}
        </div>
      </div>
    </ScrollArea>
  )
}

// ---------- Right Panel ----------

function RightPanel() {
  const taskTree = useAppStore((s) => s.taskTree)
  const activeGoal = useAppStore((s) => s.activeGoal)
  const agentInstances = useAppStore((s) => s.agentInstances)

  if (!taskTree && !activeGoal) {
    return <EmptyState />
  }

  if (!taskTree) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-gray-200">
            <Target className="h-10 w-10 text-slate-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Goal: &ldquo;{activeGoal.slice(0, 60)}{activeGoal.length > 60 ? '...' : ''}&rdquo;
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Click &ldquo;Deploy Agents&rdquo; in the left panel to start execution.
        </p>
      </div>
    )
  }

  const totalCredits = sumCredits(taskTree)

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-100 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
              Active Task
            </p>
            <p className="text-sm font-semibold text-gray-900 truncate">{taskTree.goal}</p>
          </div>
          {agentInstances.length > 0 && (
            <Badge variant="secondary" className="rounded-full text-[11px] bg-emerald-50 text-emerald-700 border-0 shrink-0 px-2.5">
              {agentInstances.length} agent{agentInstances.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Task tree */}
        <div className="space-y-1">
          <TaskTreeNode node={taskTree} depth={0} />
        </div>

        {/* Credits summary */}
        <CreditsSummary totalCredits={totalCredits} />
      </div>
    </ScrollArea>
  )
}

// ---------- Main Workspace Component ----------

export default function Workspace() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Desktop: two-panel resizable layout */}
      <div className="hidden md:flex h-full">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={38} minSize={30} maxSize={50}>
            <div className="h-full border-r border-gray-100 bg-gray-50/30">
              <LeftPanel />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle className="!bg-gray-200" />
          <ResizablePanel defaultSize={62} minSize={50}>
            <div className="h-full bg-background">
              <RightPanel />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile: stacked layout */}
      <div className="flex md:hidden h-full flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4 border-b border-gray-100 bg-gray-50/30">
            <LeftPanel />
          </div>
          <div className="min-h-[50vh]">
            <RightPanel />
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
