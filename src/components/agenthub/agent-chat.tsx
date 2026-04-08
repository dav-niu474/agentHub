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
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  FileText,
  ArrowRight,
  ListChecks,
  Loader2,
  MoreHorizontal,
  Trash2,
  X,
  User,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore, type AgentInstance, type ChatMessage, DEFAULT_AGENT_TYPES, DEFAULT_MODELS } from '@/store/app-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { MarkdownRenderer } from './markdown-renderer'

// ==================== Chat Persistence Helpers ====================

async function saveMessageToDB(agentInstanceId: string, role: string, content: string, messageType = 'text') {
  try {
    await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentInstanceId, role, content, messageType }),
    })
  } catch {
    // Silently fail - local dev may not have PostgreSQL
  }
}

async function loadMessagesFromDB(agentInstanceId: string): Promise<Array<{ id: string; agentInstanceId: string; role: string; content: string; messageType: string; createdAt: string }>> {
  try {
    const res = await fetch(`/api/chat/messages?agentInstanceId=${encodeURIComponent(agentInstanceId)}`)
    if (res.ok) return await res.json()
  } catch {
    // Silently fail
  }
  return []
}

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
  code: Code2,
}

const CATEGORY_BG: Record<string, string> = {
  coding: 'from-emerald-500/10 to-teal-500/10',
  research: 'from-sky-500/10 to-cyan-500/10',
  creative: 'from-pink-500/10 to-rose-500/10',
  automation: 'from-orange-500/10 to-amber-500/10',
  strategy: 'from-violet-500/10 to-purple-500/10',
}

const CATEGORY_ICON_COLOR: Record<string, string> = {
  coding: 'text-emerald-600',
  research: 'text-sky-600',
  creative: 'text-pink-600',
  automation: 'text-orange-600',
  strategy: 'text-violet-600',
}

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: 'bg-orange-500',
  openai: 'bg-emerald-500',
  google: 'bg-sky-500',
  deepseek: 'bg-cyan-600',
  meta: 'bg-violet-500',
  cursor: 'bg-violet-500',
  'open source': 'bg-teal-500',
  teamo: 'bg-rose-500',
  nvidia: 'bg-green-600',
}

const AGENT_RESPONSES: Record<string, string[]> = {
  'claude-code': [
    "I've analyzed your codebase structure and here's what I found. Let me break this down step by step.\n\n**Key observations:**\n1. The project follows a clean architecture pattern\n2. TypeScript types are well-defined\n3. There are a few optimization opportunities\n\nWould you like me to proceed with the implementation?",
    "Great question! Based on my analysis, I recommend the following approach:\n\n```typescript\n// Implement the feature with clean separation of concerns\nexport async function handleRequest(req: Request) {\n  const data = await req.json()\n  // Process and validate\n  return new Response(JSON.stringify(result))\n}\n```\n\nThis maintains type safety while being performant.",
    "I've completed the refactoring. Here's a summary of changes:\n\n- Extracted shared utilities into `/lib/utils.ts`\n- Improved type coverage from 78% to 95%\n- Reduced bundle size by 12%\n- All tests passing ✅",
  ],
  'codex': [
    "I'm setting up the project in a cloud sandbox now. Give me a moment to scaffold the full structure...\n\n**Project Structure:**\n```\n├── src/\n│   ├── components/\n│   ├── hooks/\n│   ├── lib/\n│   └── app/\n├── tests/\n├── prisma/\n└── package.json\n```\n\nDependencies are being installed. ETA: ~2 minutes.",
    "The project is ready! I've generated the full application with:\n\n- ✅ Authentication system\n- ✅ Database schema & migrations\n- ✅ API endpoints\n- ✅ Frontend components\n- ✅ Test suite (47 tests, all passing)\n\nYou can review the output files in the shared workspace.",
  ],
  'openclaw': [
    "Starting the automation workflow now. I'll coordinate the following tasks:\n\n1. **Browser Automation**: Navigating to target site\n2. **Data Extraction**: Pulling relevant information\n3. **File Management**: Organizing outputs\n4. **Report Generation**: Compiling results\n\nI'm monitoring for any issues. I'll send you a notification when complete.",
    "I've completed the automated workflow successfully! 🎉\n\n**Results:**\n- 156 data points extracted\n- 12 files organized and cataloged\n- Summary report generated\n\nI've prepared the deliverables in your workspace. Should I also send the report via email?",
  ],
  'deep-research': [
    "Beginning deep research analysis. I'll scan through the available databases and literature.\n\n**Research Parameters:**\n- Scope: Industry-wide analysis\n- Depth: 1,000+ sources\n- Timeframe: Last 24 months\n\nI expect the comprehensive report to take approximately 10-15 minutes. I'll notify you when it's ready.",
    "Research complete! Here's the executive summary:\n\n**Key Findings:**\n1. Market size is projected to grow 340% by 2027\n2. Top 3 players hold 67% market share\n3. AI adoption is the primary growth driver\n\n**Full Report:** 10,247 words across 8 sections with 23 charts and 45 citations.\n\nWould you like me to dive deeper into any specific section?",
  ],
}

// ==================== Helper: generate agent response ====================

function generateAgentResponse(agentTypeId: string, userMessage: string): string {
  const responses = AGENT_RESPONSES[agentTypeId] || AGENT_RESPONSES['claude-code']
  // Pick a response based on message hash for variety
  const idx = userMessage.length % responses.length
  return responses[idx]
}

// ==================== Chat Message Bubble ====================

function ChatBubble({ message, agentName }: { message: ChatMessage; agentName: string }) {
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
      {/* Avatar */}
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0 mt-0.5">
          <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-500 text-white text-[11px] font-bold">
            {agentName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message content */}
      <div className={cn('group max-w-[75%] min-w-0', isUser ? 'items-end' : 'items-start')}>
        {/* Role label */}
        <div className={cn('flex items-center gap-2 mb-1', isUser && 'flex-row-reverse')}>
          <span className="text-[11px] font-medium text-muted-foreground">
            {isUser ? 'You' : agentName}
          </span>
          <span className="text-[10px] text-muted-foreground/70">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Bubble */}
        <div
          className={cn(
            'relative rounded-2xl px-4 py-3 text-[14px] leading-relaxed break-words',
            isUser
              ? 'bg-slate-900 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-800 rounded-bl-md',
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} variant={isUser ? 'dark' : 'light'} />
          )}
        </div>

        {/* Actions */}
        <div className={cn('flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200', isUser && 'flex-row-reverse')}>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
          >
            {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
          </Button>
          {message.metadata?.creditsCost && message.metadata.creditsCost > 0 && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              {message.metadata.creditsCost.toFixed(1)} credits
            </span>
          )}
        </div>
      </div>

      {/* User avatar */}
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

// ==================== Empty State ====================

function EmptyState({ agentName, onSuggestionClick }: { agentName: string; onSuggestionClick: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-20">
      <div className="relative mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-gray-200 shadow-sm">
          <MessageSquare className="h-8 w-8 text-slate-400" />
        </div>
        <div className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg">
          <Bot className="h-3 w-3 text-white" />
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        Chat with {agentName}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-8">
        Start a conversation with this agent. You can ask questions, assign tasks, or collaborate on projects.
      </p>
      <div className="flex flex-col items-center gap-2.5 text-xs text-muted-foreground">
        <p className="font-medium text-gray-500">Try saying:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['Analyze this code', 'Help me research...', 'Build a feature', 'Review my project'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onSuggestionClick(suggestion)}
              className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-medium hover:bg-gray-200 hover:text-gray-900 transition-colors duration-150 cursor-pointer border border-gray-100"
            >
              &quot;{suggestion}&quot;
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==================== Typing Indicator ====================

function TypingIndicator({ agentName }: { agentName: string }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-500 text-white text-[11px] font-bold">
          {agentName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <span className="text-[11px] font-medium text-muted-foreground block mb-1">
          {agentName}
        </span>
        <div className="flex items-center gap-1.5 bg-gray-100 rounded-2xl px-4 py-3">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }} />
        </div>
      </div>
    </div>
  )
}

// ==================== Agent Info Panel ====================

function AgentInfoPanel({ instance }: { instance: AgentInstance }) {
  const agentType = DEFAULT_AGENT_TYPES.find((t) => t.id === instance.agentTypeId)
  const model = DEFAULT_MODELS.find((m) => m.id === instance.modelId)
  const provider = agentType?.provider || 'Unknown'
  const providerLower = provider.toLowerCase()
  const bgColor = PROVIDER_COLORS[providerLower] || 'bg-gray-500'
  const iconBg = CATEGORY_BG[agentType?.category || 'coding'] || 'from-gray-500/10 to-gray-500/10'
  const iconColor = CATEGORY_ICON_COLOR[agentType?.category || 'coding'] || 'text-gray-600'
  const IconComponent = AGENT_ICON_MAP[agentType?.icon || ''] || Bot

  return (
    <div className="space-y-4">
      {/* Agent card */}
      <Card className="rounded-xl border-gray-100 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br', iconBg)}>
            <IconComponent className={cn('h-5 w-5', iconColor)} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{instance.name}</p>
            <p className="text-[11px] text-muted-foreground">{provider} · {model?.name || instance.modelId}</p>
          </div>
        </div>

        {/* Capabilities */}
        {agentType && (
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Capabilities</p>
            <div className="flex flex-wrap gap-1">
              {agentType.capabilities.slice(0, 4).map((cap) => (
                <Badge key={cap} variant="secondary" className="rounded-full bg-gray-100 text-gray-600 text-[10px] border-0 px-2 py-0">
                  {cap}
                </Badge>
              ))}
              {agentType.capabilities.length > 4 && (
                <Badge variant="secondary" className="rounded-full bg-gray-100 text-gray-500 text-[10px] border-0 px-2 py-0">
                  +{agentType.capabilities.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Status */}
      <Card className="rounded-xl border-gray-100 p-3">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', instance.status === 'working' ? 'bg-emerald-500 animate-pulse' : instance.status === 'completed' ? 'bg-emerald-400' : instance.status === 'error' ? 'bg-red-500' : 'bg-gray-400')} />
          <span className="text-[12px] font-medium capitalize text-gray-700">{instance.status}</span>
        </div>
        {instance.currentTask && (
          <p className="text-[11px] text-muted-foreground mt-1.5 truncate">
            Working on: {instance.currentTask}
          </p>
        )}
      </Card>

      {/* Quick actions */}
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-[12px] gap-2 rounded-lg border-gray-200 transition-colors"
          onClick={() => {
            toast.info('Task assignment', { description: 'Go to Tasks to create and assign tasks to this agent.' })
          }}
        >
          <ListChecks className="h-3.5 w-3.5" />
          Assign a Task
        </Button>
      </div>
    </div>
  )
}

// ==================== Main Component ====================

export default function AgentChatWorkspace() {
  const {
    activeAgentInstanceId,
    setActiveAgentInstanceId,
    agentInstances,
    agentTypes,
    chatMessages,
    addChatMessage,
    updateAgentInstance,
    projectTasks,
    updateProjectTask,
    setViewMode,
    addNotification,
  } = useAppStore()

  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Get the active agent instance
  const activeAgent = useMemo(() => {
    return agentInstances.find((a) => a.id === activeAgentInstanceId) || null
  }, [agentInstances, activeAgentInstanceId])

  // Get the agent type for this instance
  const activeAgentType = useMemo(() => {
    if (!activeAgent) return null
    return agentTypes.find((t) => t.id === activeAgent.agentTypeId) || null
  }, [activeAgent, agentTypes])

  // Get messages for this agent
  const agentMessages = useMemo(() => {
    if (!activeAgentInstanceId) return []
    return chatMessages.filter((m) => m.agentInstanceId === activeAgentInstanceId)
  }, [chatMessages, activeAgentInstanceId])

  // Get tasks assigned to this agent
  const agentTasks = useMemo(() => {
    if (!activeAgentInstanceId) return []
    return projectTasks.filter((t) => t.assignedAgentInstanceId === activeAgentInstanceId)
  }, [projectTasks, activeAgentInstanceId])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [agentMessages.length, isTyping])

  // Load persisted messages from database when switching agents
  const loadedAgentRef = useRef<string | null>(null)
  useEffect(() => {
    if (!activeAgentInstanceId || activeAgentInstanceId === loadedAgentRef.current) return
    loadedAgentRef.current = activeAgentInstanceId

    loadMessagesFromDB(activeAgentInstanceId).then((dbMessages) => {
      if (dbMessages.length > 0) {
        // Check if we already have messages in memory for this agent
        const existing = chatMessages.filter((m) => m.agentInstanceId === activeAgentInstanceId)
        if (existing.length === 0) {
          for (const msg of dbMessages) {
            addChatMessage({
              id: msg.id,
              agentInstanceId: msg.agentInstanceId,
              role: msg.role as 'user' | 'assistant' | 'system',
              content: msg.content,
              timestamp: new Date(msg.createdAt),
              metadata: msg.messageType !== 'text' ? { type: msg.messageType as 'text' | 'code' | 'file' | 'task-update' } : undefined,
            })
          }
        }
      } else if (activeAgent) {
        // No DB messages, add welcome message
        addChatMessage({
          id: `sys-${activeAgent.id}-${Date.now()}`,
          agentInstanceId: activeAgent.id,
          role: 'system',
          content: `${activeAgent.name} is ready. Ask anything or assign a task.`,
          timestamp: new Date(),
        })
      }
    })
  }, [activeAgentInstanceId])

  // Handle send message
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || !activeAgent || isTyping) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      agentInstanceId: activeAgent.id,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }
    addChatMessage(userMessage)
    setInputValue('')
    setIsTyping(true)
    saveMessageToDB(activeAgent.id, 'user', inputValue.trim())

    // Update agent status to working
    updateAgentInstance(activeAgent.id, { status: 'working', currentTask: 'Responding...' })

    // Check if this is a task-related message
    const isTaskRequest = inputValue.toLowerCase().includes('task') || inputValue.toLowerCase().includes('完成') || inputValue.toLowerCase().includes('帮我')

    // Simulate agent response delay
    setTimeout(() => {
      const responseText = generateAgentResponse(activeAgent.agentTypeId, inputValue)

      const agentMessage: ChatMessage = {
        id: `msg-${Date.now()}-resp`,
        agentInstanceId: activeAgent.id,
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        metadata: {
          type: 'text',
          creditsCost: Math.random() * 3 + 0.5,
        },
      }
      addChatMessage(agentMessage)
      saveMessageToDB(activeAgent.id, 'assistant', responseText)
      updateAgentInstance(activeAgent.id, { status: 'idle', currentTask: undefined })
      setIsTyping(false)

      // If it was a task request, auto-assign a task
      if (isTaskRequest) {
        const taskId = `task-${Date.now()}`
        addNotification({
          id: `notif-${Date.now()}`,
          type: 'in-app',
          title: 'Task Auto-Assigned',
          message: `"${inputValue.trim().slice(0, 40)}..." has been assigned to ${activeAgent.name}`,
          fromAgent: activeAgent.name,
          relatedTaskId: taskId,
          read: false,
          timestamp: new Date(),
        })

        updateAgentInstance(activeAgent.id, { status: 'working', currentTask: inputValue.trim().slice(0, 50) })
      }
    }, 1500 + Math.random() * 2000)
  }, [inputValue, activeAgent, isTyping, addChatMessage, updateAgentInstance, addNotification, activeAgentType])

  // Handle keyboard shortcut
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // No active agent selected
  if (!activeAgent) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 bg-gradient-to-b from-white to-gray-50/50">
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-gray-200 shadow-sm">
            <MessageSquare className="h-10 w-10 text-slate-400" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Select an Agent</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          Choose a hired agent from the sidebar to start chatting.
        </p>
        <Button
          variant="outline"
          className="gap-2 rounded-lg transition-colors"
          onClick={() => setViewMode('agents')}
        >
          <Bot className="h-4 w-4" />
          Browse Agents
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br',
              CATEGORY_BG[activeAgentType?.category || 'coding'] || 'from-gray-500/10 to-gray-500/10',
            )}>
              {(() => {
                const Icon = AGENT_ICON_MAP[activeAgentType?.icon || ''] || Bot
                return <Icon className={cn('h-4 w-4', CATEGORY_ICON_COLOR[activeAgentType?.category || 'coding'] || 'text-gray-600')} />
              })()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{activeAgent.name}</p>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  isTyping ? 'bg-emerald-500 animate-pulse' : activeAgent.status === 'working' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300',
                )} />
                <span className="text-[11px] text-muted-foreground">
                  {isTyping ? 'Typing...' : activeAgent.status === 'working' ? 'Working...' : 'Online'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {agentTasks.length > 0 && (
              <Badge variant="secondary" className="rounded-full bg-amber-50 text-amber-700 text-[10px] border-0 mr-1">
                {agentTasks.length} task{agentTasks.length !== 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground md:hidden"
              onClick={() => setShowInfoPanel(!showInfoPanel)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-8 w-8 text-muted-foreground"
              onClick={() => setShowInfoPanel(!showInfoPanel)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-6 bg-gradient-to-b from-white to-gray-50/30">
          {agentMessages.length <= 1 ? (
            <EmptyState agentName={activeAgent.name} onSuggestionClick={(text) => { setInputValue(text); setTimeout(() => handleSend(), 50) }} />
          ) : (
            <div className="max-w-3xl mx-auto">
              {agentMessages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} agentName={activeAgent.name} />
              ))}
              {isTyping && (
                <TypingIndicator agentName={activeAgent.name} />
              )}
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-gray-100 px-4 md:px-6 py-3 shrink-0 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  placeholder={`Message ${activeAgent.name}...`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[44px] max-h-[120px] resize-none rounded-xl border-gray-200 bg-gray-50/50 text-sm leading-relaxed placeholder:text-gray-400 focus-visible:border-slate-400 focus-visible:ring-slate-200 focus-visible:bg-white transition-all pr-20"
                  rows={1}
                />
                <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    disabled={!inputValue.trim() || isTyping}
                    onClick={handleSend}
                    className="h-7 w-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-white shrink-0 disabled:opacity-50 transition-all duration-150"
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

      {/* Right info panel (desktop) */}
      {showInfoPanel && (
        <div className="hidden md:block w-72 border-l border-gray-100 bg-gray-50/30 shrink-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Agent Details</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground"
                  onClick={() => setShowInfoPanel(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <AgentInfoPanel instance={activeAgent} />

              {/* Assigned tasks */}
              {agentTasks.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Assigned Tasks ({agentTasks.length})
                  </h4>
                  <div className="space-y-2">
                    {agentTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-100">
                        <span className={cn(
                          'h-2 w-2 rounded-full shrink-0',
                          task.status === 'completed' ? 'bg-emerald-500' : task.status === 'in-progress' ? 'bg-sky-500 animate-pulse' : task.status === 'failed' ? 'bg-red-500' : 'bg-gray-300',
                        )} />
                        <span className="text-[12px] text-gray-700 truncate flex-1">{task.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
