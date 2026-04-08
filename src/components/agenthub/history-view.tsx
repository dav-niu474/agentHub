'use client'

import { useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Clock, Trash2, Bot } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/app-store'

// --- Chat Session Card ---
function ChatSessionCard({
  session,
  agentName,
}: {
  session: import('@/store/app-store').ChatSession
  agentName?: string
}) {
  const setCurrentChatId = useAppStore((s) => s.setCurrentChatId)
  const setViewMode = useAppStore((s) => s.setViewMode)
  const setActiveAgentId = useAppStore((s) => s.setActiveAgentId)
  const deleteChatSession = useAppStore((s) => s.deleteChatSession)

  const handleOpen = () => {
    if (session.agentId) {
      setActiveAgentId(session.agentId)
    }
    setCurrentChatId(session.id)
    setViewMode('chat')
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteChatSession(session.id)
  }

  const messageCount = session.messages.length
  const userMessageCount = session.messages.filter((m) => m.role === 'user').length

  // Relative time
  const relativeTime = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })
    } catch {
      return 'Unknown time'
    }
  }, [session.updatedAt])

  // Last message preview
  const lastMessage = session.messages.length > 0
    ? session.messages[session.messages.length - 1]
    : null
  const previewText = lastMessage
    ? lastMessage.content.length > 80
      ? lastMessage.content.slice(0, 80) + '...'
      : lastMessage.content
    : 'No messages yet'

  return (
    <Card
      className="group cursor-pointer rounded-xl border border-gray-100 bg-white py-0 shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-black/[0.06] hover:border-gray-200 hover:-translate-y-0.5"
      onClick={handleOpen}
    >
      <CardContent className="p-4 pb-3">
        {/* Top row: Title + Actions */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-slate-800 group-hover:text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 truncate leading-snug">
                {session.title}
              </h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Agent badge + Message count + Time */}
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          {agentName && (
            <Badge
              variant="secondary"
              className="rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border-0 px-2 py-0.5"
            >
              <Bot className="h-3 w-3 mr-1" />
              {agentName}
            </Badge>
          )}
          <Badge
            variant="secondary"
            className="rounded-full bg-gray-50 text-muted-foreground text-[11px] font-medium border-0 px-2 py-0.5"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            {messageCount} message{messageCount !== 1 ? 's' : ''}
          </Badge>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {relativeTime}
          </span>
        </div>

        {/* Preview text */}
        <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
          {lastMessage?.role === 'user' ? (
            <span className="text-gray-500">You: </span>
          ) : null}
          {previewText}
        </p>
      </CardContent>
    </Card>
  )
}

// --- Main History View ---
export default function HistoryView() {
  const { chatSessions, skills, setViewMode, setCurrentChatId } = useAppStore()

  // Sort by most recent first
  const sortedSessions = useMemo(() => {
    return [...chatSessions].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }, [chatSessions])

  // Count totals
  const totalMessages = chatSessions.reduce(
    (acc, s) => acc + s.messages.length,
    0
  )

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Chat History
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Your recent conversations
            </p>
          </div>

          {/* Stats bar */}
          {chatSessions.length > 0 && (
            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>
                  <span className="font-medium text-foreground">{chatSessions.length}</span>{' '}
                  conversation{chatSessions.length !== 1 ? 's' : ''}
                </span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{totalMessages}</span>{' '}
                total message{totalMessages !== 1 ? 's' : ''}
              </div>
            </div>
          )}

          {/* Chat sessions list */}
          {sortedSessions.length > 0 ? (
            <div className="space-y-3">
              {sortedSessions.map((session) => {
                const agent = session.agentId
                  ? skills.find((s) => s.id === session.agentId)
                  : null
                return (
                  <ChatSessionCard
                    key={session.id}
                    session={session}
                    agentName={agent?.name}
                  />
                )
              })}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <MessageSquare className="h-7 w-7 text-gray-400" />
              </div>
              <h3 className="mb-1 text-base font-semibold text-gray-900">
                No conversations yet
              </h3>
              <p className="mb-5 max-w-sm text-center text-sm text-muted-foreground">
                Start chatting with an AI agent and your conversations will appear here.
              </p>
              <Button
                onClick={() => {
                  setCurrentChatId(null)
                  setViewMode('chat')
                }}
                className="h-9 gap-2 rounded-lg bg-gray-900 px-5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Start Chatting
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
