'use client'

import { useState } from 'react'
import {
  ListChecks,
  Clock,
  Coins,
  Users,
  CheckCircle2,
  Loader2,
  XCircle,
  ArrowRight,
  Target,
  Brain,
  Code,
  Search,
  Eye,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// ---------- Demo task data ----------

interface DemoTask {
  id: string
  goal: string
  agents: { name: string; icon: string }[]
  status: 'completed' | 'in-progress' | 'failed'
  date: string
  creditsUsed: number
  duration: string
  subtaskCount: number
  completedSubtasks: number
}

const DEMO_TASKS: DemoTask[] = [
  {
    id: 'task-1',
    goal: 'Build a full-stack e-commerce platform with user authentication, product catalog, and payment integration',
    agents: [
      { name: 'Claude Code', icon: 'claude' },
      { name: 'Deep Research', icon: 'research' },
      { name: 'Code Reviewer', icon: 'review' },
    ],
    status: 'completed',
    date: '2025-01-15',
    creditsUsed: 47.3,
    duration: '18m 24s',
    subtaskCount: 5,
    completedSubtasks: 5,
  },
  {
    id: 'task-2',
    goal: 'Create a comprehensive marketing strategy for SaaS product launch including social media calendar',
    agents: [
      { name: 'Marketing Strategist', icon: 'marketing' },
      { name: 'Deep Research', icon: 'research' },
    ],
    status: 'completed',
    date: '2025-01-14',
    creditsUsed: 32.1,
    duration: '12m 08s',
    subtaskCount: 4,
    completedSubtasks: 4,
  },
  {
    id: 'task-3',
    goal: 'Analyze competitive landscape for AI agent platforms and generate investment-grade report',
    agents: [
      { name: 'Deep Research', icon: 'research' },
      { name: 'Academic Writer', icon: 'academic' },
      { name: 'Data Analyst', icon: 'data' },
    ],
    status: 'in-progress',
    date: '2025-01-15',
    creditsUsed: 28.6,
    duration: '9m 42s',
    subtaskCount: 6,
    completedSubtasks: 4,
  },
  {
    id: 'task-4',
    goal: 'Set up CI/CD pipeline with automated testing, linting, and deployment to cloud infrastructure',
    agents: [
      { name: 'Claude Code', icon: 'claude' },
    ],
    status: 'failed',
    date: '2025-01-13',
    creditsUsed: 15.8,
    duration: '6m 31s',
    subtaskCount: 3,
    completedSubtasks: 1,
  },
  {
    id: 'task-5',
    goal: 'Design and prototype a mobile-first dashboard for real-time analytics with dark mode support',
    agents: [
      { name: 'Claude Code', icon: 'claude' },
      { name: 'Code Reviewer', icon: 'review' },
    ],
    status: 'completed',
    date: '2025-01-12',
    creditsUsed: 38.5,
    duration: '15m 16s',
    subtaskCount: 4,
    completedSubtasks: 4,
  },
  {
    id: 'task-6',
    goal: 'Research and write a 10,000-word industry report on the future of AI agent orchestration',
    agents: [
      { name: 'Deep Research', icon: 'research' },
      { name: 'Academic Writer', icon: 'academic' },
    ],
    status: 'completed',
    date: '2025-01-11',
    creditsUsed: 62.4,
    duration: '24m 55s',
    subtaskCount: 5,
    completedSubtasks: 5,
  },
]

// ---------- Status config ----------

const STATUS_CONFIG: Record<DemoTask['status'], { label: string; color: string; icon: React.ElementType }> = {
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  'in-progress': { label: 'In Progress', color: 'bg-sky-50 text-sky-700', icon: Loader2 },
  failed: { label: 'Failed', color: 'bg-red-50 text-red-700', icon: XCircle },
}

// ---------- Task Card ----------

function TaskCard({ task }: { task: DemoTask }) {
  const [expanded, setExpanded] = useState(false)
  const statusConfig = STATUS_CONFIG[task.status]
  const StatusIcon = statusConfig.icon

  return (
    <Card
      className="group rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 overflow-hidden"
    >
      <CardContent className="p-4 pb-3">
        {/* Top row: status + actions */}
        <div className="flex items-center gap-2 mb-3">
          <Badge
            variant="secondary"
            className={cn(
              'rounded-full text-[11px] font-medium border-0 gap-1 px-2 py-0.5',
              statusConfig.color,
            )}
          >
            <StatusIcon className={cn('h-3 w-3', task.status === 'in-progress' && 'animate-spin')} />
            {statusConfig.label}
          </Badge>
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {task.duration}
          </div>
        </div>

        {/* Goal title */}
        <h3 className="text-sm font-semibold text-gray-900 mb-2.5 leading-snug line-clamp-2">
          {task.goal}
        </h3>

        {/* Agent team */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <Users className="h-3 w-3 text-muted-foreground" />
          <div className="flex items-center gap-1.5 flex-wrap">
            {task.agents.map((agent, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="rounded-full bg-gray-100 text-gray-600 text-[11px] font-medium border-0 px-2 py-0.5"
              >
                {agent.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Progress bar (only for in-progress tasks) */}
        {task.status === 'in-progress' && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-muted-foreground">
                {task.completedSubtasks} of {task.subtaskCount} subtasks
              </span>
              <span className="text-[11px] font-medium text-sky-700">
                {Math.round((task.completedSubtasks / task.subtaskCount) * 100)}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-500 transition-all duration-500"
                style={{ width: `${(task.completedSubtasks / task.subtaskCount) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Bottom row: date, credits, actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-muted-foreground">{task.date}</span>
            <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
              <Coins className="h-3 w-3" />
              <span className="font-medium text-foreground">{task.creditsUsed.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {task.subtaskCount > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[12px] text-muted-foreground hover:text-foreground gap-1"
                onClick={() => setExpanded(!expanded)}
              >
                {task.subtaskCount} subtasks
                <ChevronDown
                  className={cn('h-3 w-3 transition-transform', expanded && 'rotate-180')}
                />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[12px] text-slate-700 hover:text-slate-900 gap-1"
            >
              View Details
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Expanded subtask list */}
        {expanded && task.subtaskCount > 1 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="space-y-1.5">
              {Array.from({ length: task.subtaskCount }).map((_, i) => {
                const isComplete = i < task.completedSubtasks
                const isCurrent = i === task.completedSubtasks && task.status === 'in-progress'
                const isFailed = task.status === 'failed' && i === task.completedSubtasks
                return (
                  <div key={i} className="flex items-center gap-2.5 py-1 px-1">
                    <div className="shrink-0">
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : isFailed ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : isCurrent ? (
                        <Loader2 className="h-4 w-4 text-sky-500 animate-spin" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-gray-200" />
                      )}
                    </div>
                    <span className={cn(
                      'text-[13px]',
                      isComplete ? 'text-gray-500 line-through' : isFailed ? 'text-red-500' : 'text-gray-700',
                    )}>
                      Subtask {i + 1}: {
                        task.goal.includes('e-commerce')
                          ? ['Research & Planning', 'Auth System', 'Product Catalog', 'Payment Integration', 'Testing & Deployment'][i]
                          : task.goal.includes('marketing')
                          ? ['Market Analysis', 'Competitor Research', 'Content Calendar', 'Campaign Strategy', 'Budget Planning'][i]
                          : task.goal.includes('competitive')
                          ? ['Industry Landscape Scan', 'Key Player Analysis', 'Trend Forecasting', 'Market Sizing', 'Report Drafting', 'Final Review'][i]
                          : task.goal.includes('CI/CD')
                          ? ['Pipeline Setup', 'Test Configuration', 'Deployment Scripts'][i]
                          : task.goal.includes('dashboard')
                          ? ['Design System', 'Widget Components', 'Data Layer', 'Dark Mode'][i]
                          : task.goal.includes('report')
                          ? ['Topic Research', 'Data Collection', 'Literature Review', 'Draft Writing', 'Editing', 'Final Polish'][i]
                          : `Task ${i + 1}`
                      }
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---------- Empty State ----------

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <ListChecks className="h-7 w-7 text-gray-400" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-gray-900">
        No task history yet
      </h3>
      <p className="mb-5 max-w-sm text-center text-sm text-muted-foreground">
        Deploy agents and set goals to start building your task history.
      </p>
    </div>
  )
}

// ---------- Main Tasks View ----------

export default function TasksView() {
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredTasks = statusFilter === 'all'
    ? DEMO_TASKS
    : DEMO_TASKS.filter((t) => t.status === statusFilter)

  const completedCount = DEMO_TASKS.filter((t) => t.status === 'completed').length
  const inProgressCount = DEMO_TASKS.filter((t) => t.status === 'in-progress').length
  const failedCount = DEMO_TASKS.filter((t) => t.status === 'failed').length
  const totalCredits = DEMO_TASKS.reduce((acc, t) => acc + t.creditsUsed, 0)

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-600">
                <ListChecks className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Task History
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your completed and ongoing tasks
                </p>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>
                <span className="font-medium text-foreground">{completedCount}</span> completed
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 text-sky-500" />
              <span>
                <span className="font-medium text-foreground">{inProgressCount}</span> in progress
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>
                <span className="font-medium text-foreground">{failedCount}</span> failed
              </span>
            </div>
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Coins className="h-4 w-4" />
              <span>
                <span className="font-medium text-foreground">{totalCredits.toFixed(1)}</span> total credits
              </span>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] h-8 rounded-lg border-gray-200 bg-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks ({DEMO_TASKS.length})</SelectItem>
                  <SelectItem value="completed">Completed ({completedCount})</SelectItem>
                  <SelectItem value="in-progress">In Progress ({inProgressCount})</SelectItem>
                  <SelectItem value="failed">Failed ({failedCount})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Task list */}
          {filteredTasks.length > 0 ? (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
