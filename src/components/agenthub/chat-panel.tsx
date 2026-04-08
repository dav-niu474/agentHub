'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import {
  Send,
  Plus,
  Sparkles,
  TrendingUp,
  FileText,
  Briefcase,
  ChevronDown,
  X,
  MessageSquare,
  Store,
  Bot,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const suggestedPrompts = [
  {
    icon: Sparkles,
    title: 'Create a marketing plan for my startup',
    color: 'text-amber-600 bg-amber-50',
  },
  {
    icon: TrendingUp,
    title: 'Analyze the current market trends',
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    icon: FileText,
    title: 'Help me write a research paper',
    color: 'text-violet-600 bg-violet-50',
  },
  {
    icon: Briefcase,
    title: 'Review my business strategy',
    color: 'text-rose-600 bg-rose-50',
  },
]

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-2">
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarFallback className="bg-slate-100 text-slate-500 text-xs">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="rounded-2xl rounded-tl-sm border bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

function AgentSelector() {
  const { skills, activeAgentId, setActiveAgentId } = useAppStore()
  const activeAgent = skills.find((s) => s.id === activeAgentId)
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 rounded-full border px-3 text-xs font-normal text-muted-foreground hover:text-foreground shrink-0"
        >
          {activeAgent ? (
            <>
              <span className="text-base leading-none">{activeAgent.icon}</span>
              <span className="max-w-[100px] truncate">{activeAgent.name}</span>
            </>
          ) : (
            <>
              <Bot className="h-3.5 w-3.5" />
              <span>Select Agent</span>
            </>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start" side="top">
        <div className="space-y-0.5">
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Available Agents
          </p>
          {skills.length === 0 && (
            <p className="px-2 py-3 text-xs text-center text-muted-foreground">
              No agents available. Browse the marketplace to add skills.
            </p>
          )}
          {skills.map((skill) => (
            <button
              key={skill.id}
              onClick={() => {
                setActiveAgentId(skill.id)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent ${
                activeAgentId === skill.id ? 'bg-accent' : ''
              }`}
            >
              <span className="text-lg leading-none">{skill.icon}</span>
              <div className="flex-1 text-left min-w-0">
                <p className="truncate font-medium text-sm">{skill.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {skill.description}
                </p>
              </div>
              {activeAgentId === skill.id && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                  Active
                </Badge>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function WelcomeState({ onSendPrompt }: { onSendPrompt: (text: string) => void }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Centered icon and title */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-600 shadow-lg">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Start a Conversation
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Select an agent or start chatting with AI. Choose from your skills
            or pick a suggestion below.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center justify-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full px-4 gap-2"
                  onClick={() => onSendPrompt('')}
                >
                  <Plus className="h-4 w-4" />
                  New Chat
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start a new chat session</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full px-4 gap-2"
                  onClick={() => {
                    const { setViewMode } = useAppStore.getState()
                    setViewMode('marketplace')
                  }}
                >
                  <Store className="h-4 w-4" />
                  Browse Skills
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Explore the skills marketplace</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Suggested prompts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestedPrompts.map((prompt, i) => (
            <Card
              key={i}
              className="cursor-pointer border-border/60 hover:border-border hover:shadow-md transition-all duration-200 group py-0 gap-0 hover:gap-0"
              onClick={() => onSendPrompt(prompt.title)}
            >
              <div className="flex items-start gap-3 p-4">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${prompt.color} transition-transform group-hover:scale-110`}
                >
                  <prompt.icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium text-slate-700 leading-snug pt-1.5">
                  {prompt.title}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function ChatMessageBubble({ message }: { message: import('@/store/app-store').ChatMessage }) {
  const { skills } = useAppStore()
  const agent = message.agentId
    ? skills.find((s) => s.id === message.agentId)
    : null

  if (message.role === 'system') {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  if (message.role === 'user') {
    return (
      <div className="flex justify-end px-4 py-1.5">
        <div className="max-w-[75%] sm:max-w-[65%]">
          <div className="rounded-2xl rounded-tr-sm bg-slate-100 px-4 py-3 text-sm text-slate-800 leading-relaxed">
            {message.content}
          </div>
        </div>
      </div>
    )
  }

  // Assistant message
  return (
    <div className="flex items-start gap-3 px-4 py-1.5">
      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
        <AvatarFallback className="bg-slate-100 text-slate-500 text-xs">
          {agent ? (
            <span className="text-sm leading-none">{agent.icon}</span>
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[75%] sm:max-w-[65%]">
        {(agent || message.agentName) && (
          <p className="text-xs font-medium text-muted-foreground mb-1 ml-1">
            {agent?.name || message.agentName}
          </p>
        )}
        <div className="rounded-2xl rounded-tl-sm border border-border/50 bg-white px-4 py-3 text-sm text-slate-700 leading-relaxed shadow-sm">
          {message.content}
        </div>
      </div>
    </div>
  )
}

export default function ChatPanel() {
  const {
    currentChatId,
    setCurrentChatId,
    chatSessions,
    addChatSession,
    addMessage,
    isChatLoading,
    setIsChatLoading,
    activeAgentId,
    setActiveAgentId,
    skills,
    selectedModelId,
  } = useAppStore()

  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentSession = chatSessions.find((s) => s.id === currentChatId)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [currentSession?.messages, isChatLoading])

  // Auto-focus input
  useEffect(() => {
    if (textareaRef.current && currentChatId) {
      textareaRef.current.focus()
    }
  }, [currentChatId])

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px'
    }
  }, [])

  const sendMessage = useCallback(
    async (messageText: string) => {
      const text = messageText.trim()
      if (!text || isChatLoading) return

      setError(null)

      let chatId = currentChatId

      // Create a new session if none exists
      if (!chatId) {
        const newSession = {
          id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: text.length > 50 ? text.slice(0, 50) + '...' : text,
          agentId: activeAgentId || undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [],
        }
        addChatSession(newSession)
        chatId = newSession.id
        setCurrentChatId(chatId)
      }

      // Add user message
      addMessage(chatId, {
        id: `msg-${Date.now()}-user`,
        role: 'user',
        content: text,
        createdAt: new Date(),
      })

      setInputValue('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }

      // Prepare chat history
      const session = useAppStore.getState().chatSessions.find((s) => s.id === chatId)
      const chatHistory = (session?.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      setIsChatLoading(true)

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            agentId: activeAgentId,
            chatHistory,
            modelId: selectedModelId,
          }),
        })

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`)
        }

        const data = await response.json()

        const agent = activeAgentId
          ? skills.find((s) => s.id === activeAgentId)
          : null

        addMessage(chatId!, {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: data.message || data.content || 'I received your message but could not generate a response.',
          agentId: activeAgentId || undefined,
          agentName: agent?.name || data.agentName,
          createdAt: new Date(),
        })
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Something went wrong'
        setError(errorMessage)
        addMessage(chatId!, {
          id: `msg-${Date.now()}-error-system`,
          role: 'system',
          content: `Failed to get response: ${errorMessage}. Please try again.`,
          createdAt: new Date(),
        })
      } finally {
        setIsChatLoading(false)
      }
    },
    [
      currentChatId,
      isChatLoading,
      activeAgentId,
      selectedModelId,
      skills,
      addMessage,
      addChatSession,
      setCurrentChatId,
      setIsChatLoading,
    ]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  const handleCloseChat = () => {
    setCurrentChatId(null)
    setError(null)
  }

  const handleSuggestionClick = (text: string) => {
    if (text) {
      sendMessage(text)
    } else {
      // "New Chat" - just set focus to input area
      if (currentChatId) {
        setCurrentChatId(null)
      }
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }

  const activeAgent = skills.find((s) => s.id === activeAgentId)

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Chat header - only when a session exists */}
      {currentSession && (
        <>
          <div className="flex items-center gap-3 border-b px-4 py-3 shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-slate-100 text-slate-500 text-xs">
                {activeAgent ? (
                  <span className="text-base leading-none">{activeAgent.icon}</span>
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {currentSession.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentSession.messages.length} message{currentSession.messages.length !== 1 ? 's' : ''}
                {activeAgent ? ` · ${activeAgent.name}` : ''}
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={handleCloseChat}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Close chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Separator />
        </>
      )}

      {/* Messages area */}
      {currentSession ? (
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="py-4 space-y-1">
            {currentSession.messages.length === 0 && (
              <div className="flex justify-center py-8">
                <p className="text-sm text-muted-foreground">
                  Start by typing a message below
                </p>
              </div>
            )}
            {currentSession.messages.map((msg) => (
              <ChatMessageBubble key={msg.id} message={msg} />
            ))}
            {isChatLoading && <TypingIndicator />}
            {error && !isChatLoading && (
              <div className="flex justify-center py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive hover:text-destructive"
                  onClick={() => setError(null)}
                >
                  Clear error
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      ) : (
        <WelcomeState onSendPrompt={handleSuggestionClick} />
      )}

      {/* Input area */}
      <div className="shrink-0 border-t bg-white px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end gap-2">
            <AgentSelector />

            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  adjustTextareaHeight()
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="w-full resize-none rounded-xl border border-border/60 bg-slate-50/50 px-4 py-2.5 pr-12 text-sm text-slate-800 placeholder:text-muted-foreground focus:border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200/60 transition-all max-h-40"
                style={{ minHeight: '40px' }}
              />
              <Button
                size="icon"
                disabled={!inputValue.trim() || isChatLoading}
                onClick={() => sendMessage(inputValue)}
                className="absolute right-1.5 bottom-1.5 h-8 w-8 rounded-lg bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-sm hover:from-slate-800 hover:to-slate-600 disabled:opacity-40 disabled:shadow-none transition-all"
              >
                {isChatLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  )
}
