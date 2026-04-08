'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  ListChecks,
  Plus,
  Clock,
  Coins,
  CheckCircle2,
  Loader2,
  XCircle,
  Circle,
  AlertCircle,
  ChevronDown,
  Bot,
  Send,
  Mail,
  Bell,
  ArrowRight,
  Trash2,
  User,
  Zap,
  Target,
  Sparkles,
  Eye,
  Pause,
  Play,
  MessageSquare,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useAppStore, type ProjectTask, DEFAULT_AGENT_TYPES, type AgentInstance } from '@/store/app-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ==================== Constants ====================

const STATUS_CONFIG: Record<ProjectTask['status'], { label: string; color: string; icon: React.ElementType; progressBg: string }> = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-600', icon: Circle, progressBg: 'bg-gray-200' },
  assigned: { label: 'Assigned', color: 'bg-blue-50 text-blue-700', icon: ArrowRight, progressBg: 'bg-blue-200' },
  'in-progress': { label: 'In Progress', color: 'bg-sky-50 text-sky-700', icon: Loader2, progressBg: 'bg-sky-400' },
  review: { label: 'In Review', color: 'bg-amber-50 text-amber-700', icon: Eye, progressBg: 'bg-amber-400' },
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2, progressBg: 'bg-emerald-400' },
  failed: { label: 'Failed', color: 'bg-red-50 text-red-700', icon: XCircle, progressBg: 'bg-red-400' },
}

const PRIORITY_CONFIG: Record<ProjectTask['priority'], { label: string; color: string; dot: string }> = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  medium: { label: 'Medium', color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  high: { label: 'High', color: 'bg-orange-50 text-orange-700', dot: 'bg-orange-500' },
  urgent: { label: 'Urgent', color: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
}

const CATEGORY_COLORS: Record<string, string> = {
  coding: 'bg-emerald-100 text-emerald-700',
  research: 'bg-blue-100 text-blue-700',
  creative: 'bg-pink-100 text-pink-700',
  automation: 'bg-orange-100 text-orange-700',
  strategy: 'bg-violet-100 text-violet-700',
  general: 'bg-gray-100 text-gray-600',
}

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: 'bg-orange-500',
  openai: 'bg-emerald-500',
  cursor: 'bg-indigo-500',
  'open source': 'bg-teal-500',
  teamo: 'bg-rose-500',
}

const STATUS_PROGRESS: Record<ProjectTask['status'], number> = {
  pending: 0,
  assigned: 10,
  'in-progress': 50,
  review: 80,
  completed: 100,
  failed: 100,
}

const AUTO_RESPONSES: Record<string, { result: string; resultFiles: string[] }> = {
  coding: {
    result: 'Implementation complete! All code changes have been reviewed and tested. Generated 8 files with full type coverage.',
    resultFiles: ['src/core/engine.ts', 'src/api/routes.ts', 'src/utils/helpers.ts', 'tests/unit.test.ts', 'README.md'],
  },
  research: {
    result: 'Research complete. Comprehensive report with 23 data sources analyzed and 15 key findings documented.',
    resultFiles: ['research-report.md', 'data-analysis.csv', 'sources.json'],
  },
  creative: {
    result: 'Creative content generated! Marketing strategy with 4 campaign variations and SEO optimization recommendations.',
    resultFiles: ['strategy-report.md', 'content-calendar.xlsx', 'seo-analysis.md'],
  },
  automation: {
    result: 'Automation workflow configured successfully. All 12 steps verified and running smoothly.',
    resultFiles: ['workflow-config.yaml', 'run-logs.txt'],
  },
  strategy: {
    result: 'Strategic analysis complete. Identified 5 growth opportunities with detailed action plans.',
    resultFiles: ['strategy-report.md', 'swot-analysis.pdf', 'action-plan.xlsx'],
  },
  general: {
    result: 'Task completed successfully. All requirements have been addressed.',
    resultFiles: ['output.md'],
  },
}

// ==================== Task Card ====================

function TaskCard({ task, assignedAgent }: { task: ProjectTask; assignedAgent: AgentInstance | undefined }) {
  const { removeProjectTask, updateProjectTask, setActiveAgentInstanceId, setViewMode, addNotification } = useAppStore()
  const [expanded, setExpanded] = useState(false)
  const statusConfig = STATUS_CONFIG[task.status]
  const StatusIcon = statusConfig.icon
  const priorityConfig = PRIORITY_CONFIG[task.priority]
  const progress = STATUS_PROGRESS[task.status]

  const handleGoToAgent = () => {
    if (task.assignedAgentInstanceId) {
      setActiveAgentInstanceId(task.assignedAgentInstanceId)
      setViewMode('agent-chat')
    }
  }

  const handleSimulateComplete = () => {
    const category = task.category || 'general'
    const response = AUTO_RESPONSES[category] || AUTO_RESPONSES.general
    updateProjectTask(task.id, {
      status: 'completed',
      completedAt: new Date(),
      result: response.result,
      resultFiles: response.resultFiles,
    })

    // Simulate email notification
    addNotification({
      id: `notif-${Date.now()}`,
      type: 'email',
      title: `Task Completed: ${task.title}`,
      message: `Your task "${task.title}" has been completed by ${assignedAgent?.name || 'Agent'}. Results have been sent to your email.`,
      fromAgent: assignedAgent?.name,
      relatedTaskId: task.id,
      read: false,
      timestamp: new Date(),
    })

    toast.success('Task completed!', {
      description: `Email notification sent to ${useAppStore.getState().userEmail}. Agent delivered: ${response.resultFiles.length} files.`,
      action: {
        label: 'View Result',
        onClick: () => setExpanded(true),
      },
    })
  }

  return (
    <Card className="rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-200 overflow-hidden">
      <div className="p-4 pb-3">
        {/* Top row: priority, status, actions */}
        <div className="flex items-center gap-2 mb-3">
          <Badge
            variant="secondary"
            className={cn('rounded-full text-[10px] font-medium border-0 gap-1 px-2 py-0.5', priorityConfig.color)}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', priorityConfig.dot)} />
            {priorityConfig.label}
          </Badge>
          <Badge
            variant="secondary"
            className={cn('rounded-full text-[10px] font-medium border-0 gap-1 px-2 py-0.5', statusConfig.color)}
          >
            <StatusIcon className={cn('h-3 w-3', task.status === 'in-progress' && 'animate-spin')} />
            {statusConfig.label}
          </Badge>
          {task.category && task.category !== 'general' && (
            <Badge
              variant="secondary"
              className={cn('rounded-full text-[10px] font-medium border-0 px-2 py-0.5', CATEGORY_COLORS[task.category] || CATEGORY_COLORS.general)}
            >
              {task.category}
            </Badge>
          )}
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => {
                removeProjectTask(task.id)
                toast('Task removed')
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 mb-1.5 leading-snug">
          {task.title}
        </h3>
        {task.description && (
          <p className="text-[12px] text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Progress bar */}
        {(task.status === 'in-progress' || task.status === 'review') && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-muted-foreground">Progress</span>
              <span className="text-[11px] font-medium text-sky-700">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Assigned agent */}
        <div className="flex items-center gap-2 mb-3">
          <Bot className="h-3.5 w-3.5 text-muted-foreground" />
          {assignedAgent ? (
            <button
              onClick={handleGoToAgent}
              className="flex items-center gap-1.5 text-[12px] font-medium text-slate-700 hover:text-slate-900 hover:underline transition-colors"
            >
              <span className={cn(
                'h-4 w-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white',
                PROVIDER_COLORS[DEFAULT_AGENT_TYPES.find(t => t.id === assignedAgent.agentTypeId)?.provider?.toLowerCase() || ''] || 'bg-gray-500',
              )}>
                {assignedAgent.name.slice(0, 2).toUpperCase()}
              </span>
              {assignedAgent.name}
              <MessageSquare className="h-3 w-3 text-muted-foreground" />
            </button>
          ) : (
            <span className="text-[12px] text-muted-foreground">Unassigned</span>
          )}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
            {task.creditsUsed > 0 && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Coins className="h-3 w-3" />
                {task.creditsUsed.toFixed(1)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Simulate complete button */}
            {task.status === 'in-progress' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-emerald-600 hover:text-emerald-700 gap-1"
                onClick={handleSimulateComplete}
              >
                <CheckCircle2 className="h-3 w-3" />
                Complete
              </Button>
            )}
            {task.status === 'assigned' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-sky-600 hover:text-sky-700 gap-1"
                onClick={() => updateProjectTask(task.id, { status: 'in-progress' })}
              >
                <Play className="h-3 w-3" />
                Start
              </Button>
            )}
            {task.result && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-slate-700 hover:text-slate-900 gap-1"
                onClick={() => setExpanded(!expanded)}
              >
                <FileText className="h-3 w-3" />
                {task.resultFiles?.length || 0} files
                <ChevronDown className={cn('h-3 w-3 transition-transform', expanded && 'rotate-180')} />
              </Button>
            )}
          </div>
        </div>

        {/* Expanded result */}
        {expanded && task.result && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="rounded-lg bg-emerald-50/50 border border-emerald-100 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[11px] font-semibold text-emerald-700">Result</span>
                <span className="text-[11px] text-emerald-600 ml-auto flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Emailed
                </span>
              </div>
              <p className="text-[12px] text-gray-700 leading-relaxed mb-2">{task.result}</p>
              {task.resultFiles && task.resultFiles.length > 0 && (
                <div className="space-y-1">
                  {task.resultFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-gray-600">
                      <FileText className="h-3 w-3" />
                      <span>{file}</span>
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

// ==================== Create Task Dialog ====================

function CreateTaskDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { agentInstances, addProjectTask, updateAgentInstance, addNotification, userEmail } = useAppStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<string>('medium')
  const [category, setCategory] = useState<string>('general')
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')

  const handleSubmit = () => {
    if (!title.trim()) return

    const taskId = `task-${Date.now()}`
    const isAssigned = selectedAgentId && selectedAgentId !== 'none'

    const newTask: ProjectTask = {
      id: taskId,
      title: title.trim(),
      description: description.trim(),
      status: isAssigned ? 'assigned' : 'pending',
      priority: priority as ProjectTask['priority'],
      assignedAgentInstanceId: isAssigned ? selectedAgentId : undefined,
      category,
      createdAt: new Date(),
      updatedAt: new Date(),
      creditsUsed: 0,
    }

    addProjectTask(newTask)

    // Update agent status if assigned
    if (isAssigned) {
      updateAgentInstance(selectedAgentId, {
        status: 'working',
        currentTask: title.trim().slice(0, 50),
      })

      const agent = agentInstances.find((a) => a.id === selectedAgentId)
      addNotification({
        id: `notif-${Date.now()}`,
        type: 'in-app',
        title: 'New Task Assigned',
        message: `Task "${title.trim()}" has been assigned to ${agent?.name || 'Agent'}. The agent will begin working shortly.`,
        fromAgent: agent?.name,
        relatedTaskId: taskId,
        read: false,
        timestamp: new Date(),
      })
    }

    toast.success('Task created!', {
      description: isAssigned
        ? `Assigned to ${agentInstances.find((a) => a.id === selectedAgentId)?.name}. Agent will start working.`
        : 'Task created. Assign an agent to get started.',
    })

    // Reset form
    setTitle('')
    setDescription('')
    setPriority('medium')
    setCategory('general')
    setSelectedAgentId('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-600">
              <Plus className="h-4 w-4 text-white" />
            </div>
            Create New Task
          </DialogTitle>
          <DialogDescription>
            Create a task and assign it to one of your hired agents.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="task-title" className="text-sm font-medium">Task Title</Label>
            <Input
              id="task-title"
              placeholder="e.g., Build authentication system"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-desc" className="text-sm font-medium">Description</Label>
            <Textarea
              id="task-desc"
              placeholder="Describe what needs to be done..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] resize-none rounded-lg"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="automation">Automation</SelectItem>
                  <SelectItem value="strategy">Strategy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Agent assignment */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Assign to Agent</Label>
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Select an agent..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="flex items-center gap-2">
                    <Circle className="h-3 w-3 text-gray-400" />
                    Unassigned
                  </span>
                </SelectItem>
                {agentInstances.map((agent) => {
                  const agentType = DEFAULT_AGENT_TYPES.find((t) => t.id === agent.agentTypeId)
                  return (
                    <SelectItem key={agent.id} value={agent.id} disabled={agent.status === 'working'}>
                      <span className="flex items-center gap-2">
                        <span className={cn(
                          'h-3 w-3 rounded-full',
                          PROVIDER_COLORS[agentType?.provider?.toLowerCase() || ''] || 'bg-gray-500',
                        )} />
                        <span className="font-medium">{agent.name}</span>
                        <span className="text-[11px] text-muted-foreground">({agentType?.category})</span>
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {agentInstances.length === 0 && (
              <p className="text-[11px] text-muted-foreground">
                No agents hired yet. Go to the Agent Store to hire agents first.
              </p>
            )}
          </div>

          {/* Smart assignment hint */}
          {selectedAgentId && selectedAgentId !== 'none' && (
            <div className="rounded-lg bg-sky-50 border border-sky-100 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                <span className="text-[11px] font-semibold text-sky-700">Smart Assignment</span>
              </div>
              <p className="text-[11px] text-sky-600">
                {category !== 'general'
                  ? `This task's "${category}" category matches the agent's strengths. Agent will work autonomously and deliver results.`
                  : `The agent will analyze the task requirements and work autonomously. Results will be sent via email upon completion.`}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="rounded-lg gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ==================== Empty State ====================

function EmptyState({ onCreateTask, onHireAgent }: { onCreateTask: () => void; onHireAgent: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <ListChecks className="h-7 w-7 text-gray-400" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-gray-900">
        No tasks yet
      </h3>
      <p className="mb-5 max-w-sm text-center text-sm text-muted-foreground">
        Create tasks and assign them to your hired agents. Agents will work autonomously and deliver results.
      </p>
      <div className="flex items-center gap-3">
        <Button variant="outline" className="gap-2 rounded-lg" onClick={onHireAgent}>
          <Bot className="h-4 w-4" />
          Hire Agents
        </Button>
        <Button className="gap-2 rounded-lg" onClick={onCreateTask}>
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>
    </div>
  )
}

// ==================== Notifications Panel ====================

function NotificationsPanel() {
  const { notifications, markNotificationRead } = useAppStore()
  const unreadCount = notifications.filter((n) => !n.read).length

  if (notifications.length === 0) return null

  return (
    <div className="mb-4">
      {unreadCount > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <Bell className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium text-gray-900">{unreadCount} new notification{unreadCount !== 1 ? 's' : ''}</span>
        </div>
      )}
      <div className="space-y-2">
        {notifications.slice(0, 5).map((notif) => (
          <div
            key={notif.id}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-3 transition-all cursor-pointer',
              notif.read
                ? 'border-gray-100 bg-white'
                : 'border-amber-200 bg-amber-50/50 hover:bg-amber-50',
            )}
            onClick={() => markNotificationRead(notif.id)}
          >
            <div className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
              notif.type === 'email' ? 'bg-blue-100' : 'bg-amber-100',
            )}>
              {notif.type === 'email' ? (
                <Mail className="h-4 w-4 text-blue-600" />
              ) : (
                <Bell className="h-4 w-4 text-amber-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[12px] font-semibold text-gray-900 truncate">{notif.title}</span>
                {!notif.read && <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />}
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2">{notif.message}</p>
              <div className="flex items-center gap-2 mt-1">
                {notif.fromAgent && (
                  <span className="text-[10px] text-muted-foreground">from {notif.fromAgent}</span>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== Main Tasks View ====================

export default function TasksView() {
  const { projectTasks, agentInstances, taskFilter, setTaskFilter, setViewMode } = useAppStore()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (taskFilter === 'all') return projectTasks
    return projectTasks.filter((t) => t.status === taskFilter)
  }, [projectTasks, taskFilter])

  // Stats
  const stats = useMemo(() => ({
    total: projectTasks.length,
    pending: projectTasks.filter((t) => t.status === 'pending').length,
    inProgress: projectTasks.filter((t) => t.status === 'in-progress' || t.status === 'assigned' || t.status === 'review').length,
    completed: projectTasks.filter((t) => t.status === 'completed').length,
    failed: projectTasks.filter((t) => t.status === 'failed').length,
    totalCredits: projectTasks.reduce((acc, t) => acc + t.creditsUsed, 0),
  }), [projectTasks])

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div className="mb-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-600">
                  <ListChecks className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    Tasks
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Create tasks, assign agents, track progress
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="gap-2 rounded-lg shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Task</span>
            </Button>
          </div>

          {/* Stats bar */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Circle className="h-4 w-4 text-gray-400" />
              <span><span className="font-medium text-foreground">{stats.pending}</span> pending</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 text-sky-500" />
              <span><span className="font-medium text-foreground">{stats.inProgress}</span> in progress</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span><span className="font-medium text-foreground">{stats.completed}</span> completed</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <XCircle className="h-4 w-4 text-red-500" />
              <span><span className="font-medium text-foreground">{stats.failed}</span> failed</span>
            </div>
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Bot className="h-4 w-4" />
              <span><span className="font-medium text-foreground">{agentInstances.length}</span> agents</span>
            </div>
            {stats.totalCredits > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Coins className="h-4 w-4" />
                <span><span className="font-medium text-foreground">{stats.totalCredits.toFixed(1)}</span> credits</span>
              </div>
            )}
          </div>

          {/* Notifications */}
          <NotificationsPanel />

          {/* Filter */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter:</span>
              <Select value={taskFilter} onValueChange={setTaskFilter}>
                <SelectTrigger className="w-[160px] h-8 rounded-lg border-gray-200 bg-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks ({stats.total})</SelectItem>
                  <SelectItem value="pending">Pending ({stats.pending})</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">In Review</SelectItem>
                  <SelectItem value="completed">Completed ({stats.completed})</SelectItem>
                  <SelectItem value="failed">Failed ({stats.failed})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(taskFilter !== 'all') && (
              <button
                onClick={() => setTaskFilter('all')}
                className="text-xs text-muted-foreground hover:text-gray-900 underline underline-offset-2 transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>

          {/* Task list */}
          {filteredTasks.length > 0 ? (
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const assignedAgent = agentInstances.find((a) => a.id === task.assignedAgentInstanceId)
                return (
                  <TaskCard key={task.id} task={task} assignedAgent={assignedAgent} />
                )
              })}
            </div>
          ) : projectTasks.length > 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">No tasks match the current filter.</p>
            </div>
          ) : (
            <EmptyState
              onCreateTask={() => setCreateDialogOpen(true)}
              onHireAgent={() => setViewMode('agents')}
            />
          )}
        </div>
      </ScrollArea>

      {/* Create Task Dialog */}
      <CreateTaskDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  )
}
