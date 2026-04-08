'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  Send,
  Bot,
  Terminal,
  Brain,
  Cpu,
  MousePointer2,
  BookOpen,
  Megaphone,
  Scale,
  GraduationCap,
  BarChart3,
  Code2,
  Eye,
  Paperclip,
  Copy,
  Sparkles,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MoreHorizontal,
  Trash2,
  User,
  LayoutDashboard,
  Zap,
  ArrowRight,
  Circle,
  AlertCircle,
  XCircle,
  Bot as BotIcon,
  Mail,
  ChevronRight,
  Target,
  RotateCcw,
  Play,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tabs'
import { useAppStore, DEFAULT_AGENT_TYPES, type WorkspaceMessage, type ProjectTask } from '@/store/app-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ==================== Constants ====================

const AGENT_ICON_MAP: Record<string, React.ElementType> = {
  claude: Terminal,
  openai: Brain,
  openclaw: Cpu,
  cursor: MousePointer2,
  research: BookOpen,
  marketing: Megaphone,
  legal: Scale,
  academic: GraduationCap,
  data: BarChart3,
  review: Eye,
}

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: 'bg-orange-500',
  openai: 'bg-emerald-500',
  google: 'bg-blue-500',
  deepseek: 'bg-cyan-600',
  meta: 'bg-violet-500',
  cursor: 'bg-indigo-500',
  'open source': 'bg-teal-500',
  teamo: 'bg-rose-500',
}

const CATEGORY_COLORS: Record<string, string> = {
  coding: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  research: 'bg-blue-100 text-blue-700 border-blue-200',
  creative: 'bg-pink-100 text-pink-700 border-pink-200',
  automation: 'bg-orange-100 text-orange-700 border-orange-200',
  strategy: 'bg-violet-100 text-violet-700 border-violet-200',
  general: 'bg-gray-100 text-gray-600 border-gray-200',
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-600', icon: Circle },
  assigned: { label: 'Assigned', color: 'bg-blue-50 text-blue-700', icon: ArrowRight },
  'in-progress': { label: 'Working', color: 'bg-sky-50 text-sky-700', icon: Loader2 },
  review: { label: 'Review', color: 'bg-amber-50 text-amber-700', icon: Eye },
  completed: { label: 'Done', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'bg-red-50 text-red-700', icon: XCircle },
}

const STATUS_PROGRESS: Record<string, number> = {
  pending: 0,
  assigned: 15,
  'in-progress': 55,
  review: 80,
  completed: 100,
  failed: 100,
}

const AUTO_RESULTS: Record<string, { result: string; resultFiles: string[] }> = {
  coding: {
    result: 'Implementation complete! All code has been written, reviewed, and tested.',
    resultFiles: ['src/index.ts', 'src/utils.ts', 'tests/unit.test.ts', 'README.md'],
  },
  research: {
    result: 'Research complete. Comprehensive analysis with data-driven insights and recommendations.',
    resultFiles: ['research-report.md', 'data-analysis.csv', 'sources.json'],
  },
  creative: {
    result: 'Creative deliverables ready! All content has been generated and optimized.',
    resultFiles: ['content-strategy.md', 'copywriting.txt', 'brand-guidelines.pdf'],
  },
  automation: {
    result: 'Automation workflow configured. All processes verified and running smoothly.',
    resultFiles: ['workflow-config.yaml', 'run-logs.txt'],
  },
  strategy: {
    result: 'Strategic analysis complete. Actionable recommendations documented.',
    resultFiles: ['strategy-report.md', 'action-plan.xlsx'],
  },
  general: {
    result: 'Task completed successfully.',
    resultFiles: ['output.md'],
  },
}

// ==================== Chat Bubble ====================

function WorkspaceChatBubble({ message }: { message: WorkspaceMessage }) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [message.content])

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground bg-gray-50 px-3 py-1.5 rounded-full">
          <Sparkles className="h-3 w-3" />
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-3 py-4', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0 mt-0.5">
          <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-500 text-white text-[11px] font-bold">
            <Bot className="h-3.5 w-3.5" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn('group max-w-[85%] min-w-0', isUser ? 'items-end' : 'items-start')}>
        <div className={cn('flex items-center gap-2 mb-1', isUser && 'flex-row-reverse')}>
          <span className="text-[11px] font-medium text-muted-foreground">
            {isUser ? 'You' : 'AI Coordinator'}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div
          className={cn(
            'relative rounded-2xl px-4 py-3 text-[14px] leading-relaxed whitespace-pre-wrap break-words',
            isUser
              ? 'bg-slate-900 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-800 rounded-bl-md',
          )}
        >
          {message.content}
          {message.createdTaskIds && message.createdTaskIds.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200/50">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                <CheckCircle2 className="h-3 w-3" />
                {message.createdTaskIds.length} task{message.createdTaskIds.length !== 1 ? 's' : ''} created & assigned
              </div>
            </div>
          )}
        </div>

        <div className={cn('flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity', isUser && 'flex-row-reverse')}>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={handleCopy}>
            {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 shrink-0 mt-0.5">
          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white text-[11px] font-bold">
            <User className="h-3.5 w-3.5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}

// ==================== Task Card (compact) ====================

function TaskCardCompact({ task, onGoToAgent, onSimulateComplete }: {
  task: ProjectTask
  onGoToAgent: () => void
  onSimulateComplete: () => void
}) {
  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending
  const StatusIcon = statusConfig.icon
  const progress = STATUS_PROGRESS[task.status] || 0
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className={cn('rounded-full text-[10px] font-medium border-0 gap-1 px-2 py-0.5', statusConfig.color)}>
            <StatusIcon className={cn('h-3 w-3', task.status === 'in-progress' && 'animate-spin')} />
            {statusConfig.label}
          </Badge>
          {task.category && task.category !== 'general' && (
            <Badge variant="secondary" className={cn('rounded-full text-[10px] font-medium border-0 px-2 py-0.5', CATEGORY_COLORS[task.category] || CATEGORY_COLORS.general)}>
              {task.category}
            </Badge>
          )}
        </div>

        <h4 className="text-[13px] font-semibold text-gray-900 mb-1 leading-snug">{task.title}</h4>
        {task.description && (
          <p className="text-[11px] text-muted-foreground mb-2 line-clamp-1">{task.description}</p>
        )}

        {(task.status === 'in-progress' || task.status === 'assigned' || task.status === 'review') && (
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">Progress</span>
              <span className="text-[10px] font-medium text-sky-700">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <button onClick={onGoToAgent} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:underline transition-colors">
            {task.assignedAgentInstanceId ? (
              <>
                <BotIcon className="h-3 w-3" />
                View Agent
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 text-amber-500" />
                Unassigned
              </>
            )}
          </button>
          <div className="flex items-center gap-1">
            {task.status === 'in-progress' && (
              <Button variant="ghost" size="sm" className="h-6 text-[10px] text-emerald-600 hover:text-emerald-700 gap-1 px-1.5" onClick={onSimulateComplete}>
                <CheckCircle2 className="h-3 w-3" />
                Complete
              </Button>
            )}
            {task.result && (
              <Button variant="ghost" size="sm" className="h-6 text-[10px] text-slate-600 hover:text-slate-900 gap-1 px-1.5" onClick={() => setExpanded(!expanded)}>
                <FileText className="h-3 w-3" />
                {expanded ? 'Hide' : 'View'}
              </Button>
            )}
          </div>
        </div>

        {expanded && task.result && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="rounded-md bg-emerald-50/50 border border-emerald-100 p-2">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                <span className="text-[10px] font-semibold text-emerald-700">Result</span>
                <span className="text-[10px] text-emerald-600 ml-auto flex items-center gap-1">
                  <Mail className="h-2.5 w-2.5" /> Emailed
                </span>
              </div>
              <p className="text-[11px] text-gray-700 leading-relaxed">{task.result}</p>
              {task.resultFiles && task.resultFiles.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {task.resultFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <FileText className="h-2.5 w-2.5" />
                      {file}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// ==================== Agent Status Card ====================

function AgentStatusCard({ name, status, category, provider }: {
  name: string
  status: string
  category: string
  provider: string
}) {
  const providerLower = provider.toLowerCase()
  const bgColor = PROVIDER_COLORS[providerLower] || 'bg-gray-500'
  const letter = name.slice(0, 2).toUpperCase()

  return (
    <div className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
      <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold text-white shrink-0', bgColor)}>
        {letter}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-gray-900 truncate">{name}</p>
        <p className="text-[10px] text-muted-foreground">{category}</p>
      </div>
      <span className={cn(
        'h-2 w-2 rounded-full shrink-0',
        status === 'working' ? 'bg-emerald-500 animate-pulse' : status === 'completed' ? 'bg-blue-400' : status === 'error' ? 'bg-red-500' : 'bg-gray-300',
      )} />
    </div>
  )
}

// ==================== Empty State ====================

function EmptyChatState({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  const setViewMode = useAppStore((s) => s.setViewMode)

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
      <div className="relative mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-gray-200">
          <LayoutDashboard className="h-8 w-8 text-slate-400" />
        </div>
        <div className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Unified Workspace</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Describe what you need. I'll break it into tasks, assign the best agents, and coordinate the work automatically.
      </p>
      <div className="flex flex-col gap-2 text-xs text-muted-foreground w-full max-w-xs">
        <p className="font-medium text-gray-500 text-center mb-1">Try saying:</p>
        {[
          'Build an e-commerce platform with auth and payment',
          'Create a SaaS app with subscription billing',
          'Research AI market trends and write a report',
          'Design a marketing campaign for my startup',
        ].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            className="px-3 py-2 rounded-lg bg-gray-50 text-gray-600 text-[12px] text-left hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-100 cursor-pointer"
          >
            &quot;{suggestion}&quot;
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-6">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setViewMode('agents')}>
          <Bot className="h-3.5 w-3.5" />
          Hire Agents
        </Button>
      </div>
    </div>
  )
}

// ==================== Main Component ====================

export default function UnifiedWorkspace() {
  const {
    workspaceMessages,
    addWorkspaceMessage,
    agentInstances,
    agentTypes,
    projectTasks,
    addProjectTask,
    updateProjectTask,
    updateAgentInstance,
    addNotification,
    setActiveAgentInstanceId,
    setViewMode,
    userEmail,
  } = useAppStore()

  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showTaskBoard, setShowTaskBoard] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Resolve hired agents with type info
  const hiredAgents = useMemo(() => {
    return agentInstances.map((inst) => {
      const agentType = agentTypes.find((t) => t.id === inst.agentTypeId)
      return {
        id: inst.id,
        name: inst.name,
        provider: agentType?.provider || 'Teamo',
        category: agentType?.category || 'general',
        capabilities: agentType?.capabilities || [],
        status: inst.status,
      }
    })
  }, [agentInstances, agentTypes])

  // Workspace-related tasks (created from workspace)
  const workspaceTasks = useMemo(() => {
    return projectTasks.filter((t) =>
      workspaceMessages.some((m) => m.createdTaskIds?.includes(t.id))
    )
  }, [projectTasks, workspaceMessages])

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [workspaceMessages.length, isProcessing])

  // Welcome message
  useEffect(() => {
    if (workspaceMessages.length === 0) {
      addWorkspaceMessage({
        id: `ws-welcome-${Date.now()}`,
        role: 'system',
        content: 'AI Coordinator ready. Describe your project and I\'ll create tasks for your agent team.',
        timestamp: new Date(),
      })
    }
  }, [])

  // Simulate agent task execution
  const simulateTaskExecution = useCallback((taskId: string, agentId: string, agentName: string) => {
    // Mark as in-progress after a short delay
    setTimeout(() => {
      updateProjectTask(taskId, { status: 'in-progress', updatedAt: new Date() })
      updateAgentInstance(agentId, { status: 'working', currentTask: 'Working on task...' })
    }, 1000)
  }, [updateProjectTask, updateAgentInstance])

  // Handle send
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isProcessing) return

    const userMsg: WorkspaceMessage = {
      id: `ws-user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }
    addWorkspaceMessage(userMsg)
    setInputValue('')
    setIsProcessing(true)

    try {
      const response = await fetch('/api/workspace/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue.trim(),
          chatHistory: workspaceMessages.map((m) => ({ role: m.role, content: m.content })),
          hiredAgents: hiredAgents,
        }),
      })

      const data = await response.json()

      // Create tasks if returned
      const createdTaskIds: string[] = []
      if (data.tasks && data.tasks.length > 0) {
        for (const task of data.tasks) {
          const taskId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
          const newTask: ProjectTask = {
            id: taskId,
            title: task.title,
            description: task.description,
            status: task.assignedAgentId ? 'assigned' : 'pending',
            priority: task.priority as ProjectTask['priority'],
            assignedAgentInstanceId: task.assignedAgentId || undefined,
            category: task.category,
            createdAt: new Date(),
            updatedAt: new Date(),
            creditsUsed: 0,
          }
          addProjectTask(newTask)
          createdTaskIds.push(taskId)

          // Start simulated execution for assigned tasks
          if (task.assignedAgentId) {
            simulateTaskExecution(taskId, task.assignedAgentId, task.assignedAgentName)
          }
        }

        // Show task board if tasks were created
        if (createdTaskIds.length > 0) {
          setShowTaskBoard(true)
        }
      }

      // Add AI response
      const aiMsg: WorkspaceMessage = {
        id: `ws-ai-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        createdTaskIds: createdTaskIds.length > 0 ? createdTaskIds : undefined,
      }
      addWorkspaceMessage(aiMsg)

      toast.success('Tasks dispatched!', {
        description: createdTaskIds.length > 0
          ? `${createdTaskIds.length} tasks created and assigned to your agents.`
          : 'Check the response for details.',
      })
    } catch {
      addWorkspaceMessage({
        id: `ws-error-${Date.now()}`,
        role: 'system',
        content: 'Connection error. Please try again.',
        timestamp: new Date(),
      })
      toast.error('Failed to process request')
    } finally {
      setIsProcessing(false)
    }
  }, [inputValue, isProcessing, workspaceMessages, hiredAgents, addWorkspaceMessage, addProjectTask, simulateTaskExecution])

  // Simulate complete a task
  const handleSimulateComplete = useCallback((task: ProjectTask) => {
    const category = task.category || 'general'
    const autoResult = AUTO_RESULTS[category] || AUTO_RESULTS.general
    updateProjectTask(task.id, {
      status: 'completed',
      completedAt: new Date(),
      result: autoResult.result,
      resultFiles: autoResult.resultFiles,
      creditsUsed: (task.creditsUsed || 0) + Math.random() * 5 + 2,
    })

    // Reset agent status
    if (task.assignedAgentInstanceId) {
      updateAgentInstance(task.assignedAgentInstanceId, { status: 'idle', currentTask: undefined })
    }

    // Email notification
    const agent = agentInstances.find((a) => a.id === task.assignedAgentInstanceId)
    addNotification({
      id: `notif-${Date.now()}`,
      type: 'email',
      title: `Task Completed: ${task.title}`,
      message: `"${task.title}" has been completed by ${agent?.name || 'Agent'}. Results sent to ${useAppStore.getState().userEmail}.`,
      fromAgent: agent?.name,
      relatedTaskId: task.id,
      read: false,
      timestamp: new Date(),
    })

    toast.success('Task completed!', {
      description: `Results emailed to ${useAppStore.getState().userEmail}`,
      action: {
        label: 'View Tasks',
        onClick: () => setViewMode('tasks'),
      },
    })
  }, [updateProjectTask, updateAgentInstance, addNotification, agentInstances, setViewMode])

  // Go to agent chat
  const handleGoToAgent = useCallback((agentId: string) => {
    setActiveAgentInstanceId(agentId)
    setViewMode('agent-chat')
  }, [setActiveAgentInstanceId, setViewMode])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Stats
  const stats = useMemo(() => ({
    totalTasks: workspaceTasks.length,
    inProgress: workspaceTasks.filter((t) => t.status === 'in-progress' || t.status === 'assigned').length,
    completed: workspaceTasks.filter((t) => t.status === 'completed').length,
    failed: workspaceTasks.filter((t) => t.status === 'failed').length,
  }), [workspaceTasks])

  const hasMessages = workspaceMessages.length > 1 // more than just the welcome message

  return (
    <div className="flex h-full overflow-hidden">
      {/* ==================== LEFT: Chat Panel ==================== */}
      <div className={cn('flex flex-col h-full min-w-0 border-r border-gray-100', showTaskBoard ? 'w-full md:w-[55%]' : 'w-full')}>
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 md:px-5 h-14 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">AI Coordinator</p>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  isProcessing ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300',
                )} />
                <span className="text-[11px] text-muted-foreground">
                  {isProcessing ? 'Analyzing & dispatching...' : 'Online'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {hiredAgents.length > 0 && (
              <Badge variant="secondary" className="rounded-full bg-emerald-50 text-emerald-700 text-[10px] border-0 hidden sm:flex items-center gap-1">
                <BotIcon className="h-3 w-3" />
                {hiredAgents.length} agent{hiredAgents.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {workspaceTasks.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-[12px] gap-1.5 text-gray-600 hidden md:flex"
                onClick={() => setShowTaskBoard(!showTaskBoard)}
              >
                {showTaskBoard ? 'Hide' : 'Show'} Tasks
                <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', showTaskBoard && 'rotate-90')} />
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-5">
          {!hasMessages ? (
            <EmptyChatState onSuggestionClick={(text) => { setInputValue(text); setTimeout(() => handleSend(), 50) }} />
          ) : (
            <div className="max-w-3xl mx-auto py-4">
              {workspaceMessages.map((msg) => (
                <WorkspaceChatBubble key={msg.id} message={msg} />
              ))}
              {isProcessing && (
                <div className="flex items-center gap-3 py-4">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-500 text-white text-[11px] font-bold">
                      <Bot className="h-3.5 w-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-1.5 bg-gray-100 rounded-2xl px-4 py-3">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100 px-4 md:px-5 py-3 shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  placeholder={hiredAgents.length === 0 ? 'Describe your project... (hire agents first for auto-assignment)' : 'Describe what you need. I\'ll create tasks and assign agents...'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isProcessing}
                  className="min-h-[44px] max-h-[120px] resize-none rounded-xl border-gray-200 bg-gray-50/50 text-sm leading-relaxed placeholder:text-gray-400 focus-visible:border-slate-400 focus-visible:ring-slate-200 focus-visible:bg-white transition-all pr-20 disabled:opacity-60"
                  rows={1}
                />
                <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0">
                    <Paperclip className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    disabled={!inputValue.trim() || isProcessing}
                    onClick={handleSend}
                    className="h-7 w-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-white shrink-0 disabled:opacity-50 transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* ==================== RIGHT: Task Board ==================== */}
      {showTaskBoard && workspaceTasks.length > 0 && (
        <div className="hidden md:flex w-[45%] flex-col h-full min-w-0 bg-gray-50/30">
          {/* Task Board Header */}
          <div className="flex items-center justify-between px-5 h-14 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Task Board</p>
                <p className="text-[10px] text-muted-foreground">{stats.totalTasks} tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full text-[10px] border-0 gap-1 px-2 py-0.5 bg-sky-50 text-sky-700">
                <Loader2 className="h-3 w-3 animate-spin" />
                {stats.inProgress}
              </Badge>
              <Badge variant="secondary" className="rounded-full text-[10px] border-0 gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                {stats.completed}
              </Badge>
            </div>
          </div>

          {/* Task List */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {/* Agent Team Overview */}
              {hiredAgents.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Agent Team</p>
                  <div className="grid grid-cols-2 gap-2">
                    {hiredAgents.map((agent) => (
                      <AgentStatusCard key={agent.id} {...agent} />
                    ))}
                  </div>
                </div>
              )}

              <Separator className="!bg-gray-200/60" />

              {/* Tasks */}
              <div className="space-y-2.5">
                {workspaceTasks.map((task) => (
                  <TaskCardCompact
                    key={task.id}
                    task={task}
                    onGoToAgent={() => task.assignedAgentInstanceId && handleGoToAgent(task.assignedAgentInstanceId)}
                    onSimulateComplete={() => handleSimulateComplete(task)}
                  />
                ))}
              </div>

              {/* Summary */}
              {stats.completed === stats.totalTasks && stats.totalTasks > 0 && (
                <div className="mt-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-4 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-sm font-semibold text-emerald-800">All Tasks Complete!</p>
                  <p className="text-xs text-emerald-600 mt-1">Results have been delivered. Check your email for details.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
