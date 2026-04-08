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
  FileText,
  Loader2,
  ChevronRight,
  Target,
  User,
  LayoutDashboard,
  ArrowRight,
  Circle,
  AlertCircle,
  XCircle,
  Mail,
  Pencil,
  Trash2,
  Plus,
  RotateCcw,
  MessagesSquare,
  ClipboardList,
  Rocket,
  Bot as BotIcon,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  useAppStore,
  DEFAULT_AGENT_TYPES,
  type WorkspaceMessage,
  type ProjectTask,
  type TaskPlan,
  type TaskPlanItem,
  type WorkspacePhase,
} from '@/store/app-store'
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
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

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
  anthropic: 'bg-gradient-to-br from-orange-500 to-amber-500',
  openai: 'bg-gradient-to-br from-emerald-500 to-teal-500',
  google: 'bg-gradient-to-br from-blue-500 to-sky-500',
  deepseek: 'bg-gradient-to-br from-cyan-600 to-sky-500',
  meta: 'bg-gradient-to-br from-violet-500 to-purple-500',
  cursor: 'bg-gradient-to-br from-indigo-500 to-violet-500',
  'open source': 'bg-gradient-to-br from-teal-500 to-emerald-500',
  teamo: 'bg-gradient-to-br from-rose-500 to-pink-500',
}

const PROVIDER_LETTERS: Record<string, string> = {
  anthropic: 'AC',
  openai: 'OA',
  google: 'GO',
  deepseek: 'DS',
  meta: 'ME',
  cursor: 'CU',
  'open source': 'OC',
  teamo: 'TM',
}

const CATEGORY_COLORS: Record<string, string> = {
  coding: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  research: 'bg-blue-100 text-blue-700 border-blue-200',
  creative: 'bg-pink-100 text-pink-700 border-pink-200',
  automation: 'bg-orange-100 text-orange-700 border-orange-200',
  strategy: 'bg-violet-100 text-violet-700 border-violet-200',
  general: 'bg-gray-100 text-gray-600 border-gray-200',
}

const CATEGORY_DOT_COLORS: Record<string, string> = {
  coding: 'bg-emerald-500',
  research: 'bg-blue-500',
  creative: 'bg-pink-500',
  automation: 'bg-orange-500',
  strategy: 'bg-violet-500',
  general: 'bg-gray-500',
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

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  medium: { label: 'Medium', color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  high: { label: 'High', color: 'bg-orange-50 text-orange-700', dot: 'bg-orange-500' },
  urgent: { label: 'Urgent', color: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
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

const PHASE_STEPS: Array<{ key: WorkspacePhase; label: string; icon: React.ElementType; description: string }> = [
  { key: 'idle', label: 'Start', icon: MessagesSquare, description: 'Describe your project' },
  { key: 'clarifying', label: 'Clarify', icon: MessagesSquare, description: 'AI understands requirements' },
  { key: 'planning', label: 'Plan', icon: ClipboardList, description: 'Review & edit task plan' },
  { key: 'executing', label: 'Execute', icon: Rocket, description: 'Agents working' },
]

// ==================== Phase Pipeline ====================

function PhasePipeline({ currentPhase }: { currentPhase: WorkspacePhase }) {
  const phaseIndex = PHASE_STEPS.findIndex((p) => p.key === currentPhase)

  return (
    <div className="flex items-center gap-1 px-1">
      {PHASE_STEPS.map((step, index) => {
        const isActive = step.key === currentPhase
        const isCompleted = index < phaseIndex
        const isPending = index > phaseIndex
        const StepIcon = step.icon

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1 min-w-[52px]">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full transition-all duration-500',
                  isActive
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30 scale-110'
                    : isCompleted
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-400',
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <StepIcon className="h-3.5 w-3.5" />
                )}
              </div>
              <span
                className={cn(
                  'text-[9px] font-semibold transition-colors duration-300',
                  isActive ? 'text-slate-900' : isCompleted ? 'text-emerald-600' : 'text-gray-400',
                )}
              >
                {step.label}
              </span>
            </div>
            {index < PHASE_STEPS.length - 1 && (
              <div
                className={cn(
                  'h-[2px] w-4 mx-1 mb-4 rounded-full transition-colors duration-500',
                  index < phaseIndex ? 'bg-emerald-400' : 'bg-gray-200',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
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
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
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
          {message.phase && message.phase !== 'idle' && (
            <Badge variant="secondary" className={cn(
              'rounded-full text-[9px] font-semibold border-0 px-1.5 py-0',
              message.phase === 'clarifying' && 'bg-amber-50 text-amber-700',
              message.phase === 'planning' && 'bg-blue-50 text-blue-700',
              message.phase === 'executing' && 'bg-emerald-50 text-emerald-700',
            )}>
              {message.phase}
            </Badge>
          )}
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

// ==================== Task Plan Card (editable) ====================

function PlanTaskCard({
  task,
  index,
  onRemove,
  onUpdate,
  totalTasks,
}: {
  task: TaskPlanItem
  index: number
  onRemove: () => void
  onUpdate: (updates: Partial<TaskPlanItem>) => void
  totalTasks: number
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDesc, setEditDesc] = useState(task.description)
  const [expanded, setExpanded] = useState(false)

  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
  const catColor = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.general

  const handleSaveEdit = () => {
    onUpdate({ title: editTitle, description: editDesc })
    setIsEditing(false)
  }

  return (
    <Card className="rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden group">
      <div className="p-3">
        {/* Header: order + priority + actions */}
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500 shrink-0">
            {index + 1}
          </span>
          <Badge variant="secondary" className={cn('rounded-full text-[10px] font-medium border-0 gap-1 px-2 py-0', priorityConfig.color)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', priorityConfig.dot)} />
            {priorityConfig.label}
          </Badge>
          <Badge variant="secondary" className={cn('rounded-full text-[10px] font-medium border-0 px-2 py-0', catColor)}>
            {task.category}
          </Badge>
          <Badge variant="secondary" className="rounded-full text-[10px] font-medium border-0 px-2 py-0 bg-slate-50 text-slate-600">
            {task.suggestedAgentCategory}
          </Badge>
          <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-slate-700" onClick={() => { setEditTitle(task.title); setEditDesc(task.description); setIsEditing(true) }}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-600" onClick={onRemove}>
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => setExpanded(!expanded)}>
              <ChevronDown className={cn('h-3 w-3 transition-transform', expanded && 'rotate-180')} />
            </Button>
          </div>
        </div>

        {/* Title */}
        {isEditing ? (
          <div className="space-y-2 mb-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="h-7 text-[13px] font-semibold rounded-lg"
              placeholder="Task title"
              autoFocus
            />
            <Textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="min-h-[60px] text-[12px] rounded-lg resize-none"
              placeholder="Task description"
            />
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-[10px]">Priority:</Label>
                <Select value={task.priority} onValueChange={(v) => onUpdate({ priority: v as TaskPlanItem['priority'] })}>
                  <SelectTrigger className="h-6 w-[80px] text-[10px] rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1.5">
                <Label className="text-[10px]">Category:</Label>
                <Select value={task.category} onValueChange={(v) => onUpdate({ category: v })}>
                  <SelectTrigger className="h-6 w-[90px] text-[10px] rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coding">Coding</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="automation">Automation</SelectItem>
                    <SelectItem value="strategy">Strategy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button size="sm" className="h-6 text-[10px] gap-1 rounded-md" onClick={handleSaveEdit}>
                <CheckCircle2 className="h-3 w-3" />
                Save
              </Button>
              <Button size="sm" variant="ghost" className="h-6 text-[10px] rounded-md" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h4 className="text-[13px] font-semibold text-gray-900 mb-0.5 leading-snug">{task.title}</h4>
            {task.description && (
              <p className={cn('text-[11px] text-muted-foreground mb-2 leading-relaxed', !expanded && 'line-clamp-1')}>
                {task.description}
              </p>
            )}
          </>
        )}

        {/* Agent suggestion */}
        {!isEditing && (
          <div className="flex items-center gap-1.5 mt-1">
            <BotIcon className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              Suggested: <span className="font-medium text-slate-600">{task.suggestedAgentCategory}</span> agent
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}

// ==================== Add Task Dialog ====================

function AddPlanTaskDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (task: TaskPlanItem) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<string>('medium')
  const [category, setCategory] = useState<string>('coding')

  const handleSubmit = () => {
    if (!title.trim()) return
    onAdd({
      id: `plan-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      priority: priority as TaskPlanItem['priority'],
      category,
      suggestedAgentCategory: category,
      order: 99,
    })
    setTitle('')
    setDescription('')
    setPriority('medium')
    setCategory('coding')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-600">
              <Plus className="h-3.5 w-3.5 text-white" />
            </div>
            Add Task to Plan
          </DialogTitle>
          <DialogDescription>Add a new task to the execution plan.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Task Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Build authentication system" className="h-9 text-sm rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what needs to be done..." className="min-h-[60px] text-sm rounded-lg resize-none" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="h-9 text-sm rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9 text-sm rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="automation">Automation</SelectItem>
                  <SelectItem value="strategy">Strategy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="rounded-lg">Cancel</Button>
          <Button size="sm" onClick={handleSubmit} disabled={!title.trim()} className="rounded-lg gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ==================== Task Card (compact - execution phase) ====================

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
    <Card className="rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden">
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
                {task.assignedAgentName || 'View Agent'}
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
  const letter = PROVIDER_LETTERS[providerLower] || name.slice(0, 2).toUpperCase()

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
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-600 shadow-xl shadow-slate-800/20">
          <LayoutDashboard className="h-10 w-10 text-white" />
        </div>
        <div className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Workspace</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-2">
        Describe what you want to build. I&apos;ll help you clarify requirements,
        create a structured plan, and coordinate your agent team for execution.
      </p>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <MessagesSquare className="h-3.5 w-3.5 text-amber-500" />
          Clarify
        </div>
        <ArrowRight className="h-3 w-3 text-gray-300" />
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ClipboardList className="h-3.5 w-3.5 text-blue-500" />
          Plan
        </div>
        <ArrowRight className="h-3 w-3 text-gray-300" />
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Rocket className="h-3.5 w-3.5 text-emerald-500" />
          Execute
        </div>
      </div>
      <div className="flex flex-col gap-2 text-xs w-full max-w-sm">
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
            className="px-3 py-2.5 rounded-xl bg-gray-50 text-gray-600 text-[12px] text-left hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-100 cursor-pointer"
          >
            &quot;{suggestion}&quot;
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-6">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-lg" onClick={() => setViewMode('agents')}>
          <Bot className="h-3.5 w-3.5" />
          Hire Agents First
        </Button>
      </div>
    </div>
  )
}

// ==================== Plan Panel (Right Side - Planning Phase) ====================

function PlanPanel({
  plan,
  onConfirm,
  onRemoveTask,
  onUpdateTask,
  onAddTask,
}: {
  plan: TaskPlan
  onConfirm: () => void
  onRemoveTask: (id: string) => void
  onUpdateTask: (id: string, updates: Partial<TaskPlanItem>) => void
  onAddTask: (task: TaskPlanItem) => void
}) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  return (
    <div className="flex flex-col h-full">
      {/* Plan header */}
      <div className="px-4 py-3 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
            <ClipboardList className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Task Plan</p>
            <p className="text-[10px] text-muted-foreground">{plan.tasks.length} tasks · Review & confirm</p>
          </div>
        </div>
      </div>

      {/* Requirements */}
      {plan.requirements && plan.requirements.length > 0 && (
        <div className="px-4 pt-3 pb-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Requirements</p>
          <div className="space-y-1">
            {plan.requirements.map((req, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-gray-700">
                <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                <span>{req}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator className="!bg-gray-200/60 my-2 mx-4" />

      {/* Task list */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 pb-4">
          {plan.tasks.map((task, i) => (
            <PlanTaskCard
              key={task.id}
              task={task}
              index={i}
              totalTasks={plan.tasks.length}
              onRemove={() => onRemoveTask(task.id)}
              onUpdate={(updates) => onUpdateTask(task.id, updates)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="border-t border-gray-100 px-4 py-3 shrink-0 space-y-2">
        <Button
          onClick={onConfirm}
          disabled={plan.tasks.length === 0}
          className="w-full rounded-xl gap-2 h-10 text-sm font-semibold"
        >
          <Rocket className="h-4 w-4" />
          Confirm & Execute Plan
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setAddDialogOpen(true)}
            className="flex-1 rounded-lg gap-1.5 h-8 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Task
          </Button>
        </div>
      </div>

      <AddPlanTaskDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={onAddTask}
      />
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
    workspacePhase,
    setWorkspacePhase,
    currentPlan,
    setCurrentPlan,
    updatePlanTask,
    removePlanTask,
    addPlanTask,
    userEmail,
    clearWorkspaceMessages,
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

  // Workspace-related tasks
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
        content: 'AI Coordinator ready. Describe your project and I\'ll help you plan and execute it.',
        timestamp: new Date(),
      })
    }
  }, [])

  // Simulate agent task execution
  const simulateTaskExecution = useCallback((taskId: string, agentId: string) => {
    setTimeout(() => {
      updateProjectTask(taskId, { status: 'in-progress', updatedAt: new Date() })
      updateAgentInstance(agentId, { status: 'working', currentTask: 'Working on task...' })
    }, 1000)
  }, [updateProjectTask, updateAgentInstance])

  // Handle send message
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
          currentPhase: workspacePhase,
        }),
      })

      const data = await response.json()

      // Update phase
      if (data.phase) {
        setWorkspacePhase(data.phase)
      }

      // If tasks were returned (plan created), store the plan
      if (data.tasks && data.tasks.length > 0) {
        const plan: TaskPlan = {
          id: `plan-${Date.now()}`,
          title: 'Project Plan',
          description: inputValue.trim(),
          requirements: [],
          tasks: data.tasks.map((t: TaskPlanItem, i: number) => ({
            ...t,
            order: i + 1,
          })),
          createdAt: new Date(),
        }
        setCurrentPlan(plan)
        setShowTaskBoard(true)
      }

      // Add AI response
      const aiMsg: WorkspaceMessage = {
        id: `ws-ai-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        phase: data.phase || workspacePhase,
      }
      addWorkspaceMessage(aiMsg)
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
  }, [inputValue, isProcessing, workspaceMessages, hiredAgents, workspacePhase, addWorkspaceMessage, setWorkspacePhase, setCurrentPlan])

  // Confirm plan and dispatch tasks
  const handleConfirmPlan = useCallback(async () => {
    if (!currentPlan || hiredAgents.length === 0) {
      toast.error('No agents hired. Please hire agents first.')
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/workspace/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: currentPlan.tasks,
          hiredAgents,
        }),
      })

      const data = await response.json()

      // Create actual project tasks
      const createdTaskIds: string[] = []
      for (const dispatchedTask of data.tasks) {
        const taskId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        const newTask: ProjectTask = {
          id: taskId,
          title: dispatchedTask.title,
          description: dispatchedTask.description,
          status: dispatchedTask.assignedAgentId ? 'assigned' : 'pending',
          priority: dispatchedTask.priority,
          assignedAgentInstanceId: dispatchedTask.assignedAgentId || undefined,
          assignedAgentName: dispatchedTask.assignedAgentName || undefined,
          category: dispatchedTask.category,
          createdAt: new Date(),
          updatedAt: new Date(),
          creditsUsed: 0,
        }
        addProjectTask(newTask)
        createdTaskIds.push(taskId)

        // Start simulated execution
        if (dispatchedTask.assignedAgentId) {
          simulateTaskExecution(taskId, dispatchedTask.assignedAgentId)
        }
      }

      // Update phase
      setWorkspacePhase('executing')

      // Add dispatch message
      const dispatchMsg: WorkspaceMessage = {
        id: `ws-dispatch-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        createdTaskIds,
        phase: 'executing',
      }
      addWorkspaceMessage(dispatchMsg)

      toast.success('Tasks dispatched!', {
        description: `${createdTaskIds.length} tasks assigned to your agents.`,
      })
    } catch {
      toast.error('Failed to dispatch tasks')
    } finally {
      setIsProcessing(false)
    }
  }, [currentPlan, hiredAgents, addProjectTask, simulateTaskExecution, setWorkspacePhase, addWorkspaceMessage])

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

    if (task.assignedAgentInstanceId) {
      updateAgentInstance(task.assignedAgentInstanceId, { status: 'idle', currentTask: undefined })
    }

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
    })
  }, [updateProjectTask, updateAgentInstance, addNotification, agentInstances])

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

  // Reset workspace
  const handleReset = useCallback(() => {
    clearWorkspaceMessages()
    setCurrentPlan(null)
    setInputValue('')
    toast.info('Workspace reset')
  }, [clearWorkspaceMessages, setCurrentPlan])

  // Stats
  const stats = useMemo(() => ({
    totalTasks: workspaceTasks.length,
    inProgress: workspaceTasks.filter((t) => t.status === 'in-progress' || t.status === 'assigned').length,
    completed: workspaceTasks.filter((t) => t.status === 'completed').length,
  }), [workspaceTasks])

  const hasMessages = workspaceMessages.length > 1

  // Determine right panel content
  const showPlanPanel = workspacePhase === 'planning' && currentPlan && currentPlan.tasks.length > 0
  const showTaskPanel = workspacePhase === 'executing' && workspaceTasks.length > 0
  const showRightPanel = showPlanPanel || showTaskPanel

  return (
    <div className="flex h-full overflow-hidden">
      {/* ==================== LEFT: Chat Panel ==================== */}
      <div className={cn('flex flex-col h-full min-w-0 border-r border-gray-100', showRightPanel && showTaskBoard ? 'w-full md:w-[55%]' : 'w-full')}>
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
                  {isProcessing ? 'Thinking...' : workspacePhase === 'clarifying' ? 'Clarifying requirements' : workspacePhase === 'planning' ? 'Planning tasks' : workspacePhase === 'executing' ? 'Coordinating agents' : 'Online'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Phase Pipeline */}
            <div className="hidden sm:block">
              <PhasePipeline currentPhase={workspacePhase} />
            </div>

            {hiredAgents.length > 0 && (
              <Badge variant="secondary" className="rounded-full bg-emerald-50 text-emerald-700 text-[10px] border-0 hidden sm:flex items-center gap-1">
                <BotIcon className="h-3 w-3" />
                {hiredAgents.length} agent{hiredAgents.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {showRightPanel && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-[12px] gap-1.5 text-gray-600 hidden md:flex"
                onClick={() => setShowTaskBoard(!showTaskBoard)}
              >
                {showTaskBoard ? 'Hide' : 'Show'} {showPlanPanel ? 'Plan' : 'Tasks'}
                <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', showTaskBoard && 'rotate-90')} />
              </Button>
            )}
            {/* Reset button */}
            {workspacePhase !== 'idle' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-red-600"
                onClick={handleReset}
              >
                <RotateCcw className="h-3.5 w-3.5" />
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

        {/* Quick action chips during planning phase */}
        {workspacePhase === 'planning' && (
          <div className="px-4 md:px-5 py-2 border-t border-gray-50 shrink-0">
            <div className="max-w-3xl mx-auto flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-muted-foreground font-medium">Quick:</span>
              {['confirm and execute', 'add more tasks'].map((action) => (
                <button
                  key={action}
                  onClick={() => {
                    if (action === 'confirm and execute') {
                      handleConfirmPlan()
                    } else {
                      setInputValue(action)
                      textareaRef.current?.focus()
                    }
                  }}
                  className="px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-[11px] hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-100 cursor-pointer"
                >
                  {action === 'confirm and execute' ? '✓ Confirm & Execute' : '+ Add More Tasks'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-100 px-4 md:px-5 py-3 shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  placeholder={
                    workspacePhase === 'clarifying'
                      ? 'Answer questions or provide more details...'
                      : workspacePhase === 'planning'
                        ? 'Edit the plan on the right, then type "confirm" to execute...'
                        : workspacePhase === 'executing'
                          ? 'Add new tasks, check progress, or ask anything...'
                          : 'Describe what you want to build...'
                  }
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

      {/* ==================== RIGHT: Plan Panel (Planning Phase) ==================== */}
      {showRightPanel && showTaskBoard && (
        <div className={cn('hidden md:flex w-[45%] flex-col h-full min-w-0 bg-gray-50/30')}>
          {showPlanPanel ? (
            <PlanPanel
              plan={currentPlan!}
              onConfirm={handleConfirmPlan}
              onRemoveTask={removePlanTask}
              onUpdateTask={updatePlanTask}
              onAddTask={addPlanTask}
            />
          ) : showTaskPanel ? (
            <>
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
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
