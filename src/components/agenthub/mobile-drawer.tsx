'use client'

import {
  House,
  Bot,
  ListChecks,
  Eye,
  CreditCard,
  Sparkles,
  Settings,
  Coins,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react'
import { useAppStore, type ViewMode } from '@/store/app-store'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

// ---------- Constants ----------

interface NavItem {
  icon: LucideIcon
  label: string
  viewMode: ViewMode
}

const NAV_ITEMS: NavItem[] = [
  { icon: House, label: 'Home', viewMode: 'landing' },
  { icon: LayoutDashboard, label: 'Workspace', viewMode: 'workspace' },
  { icon: Bot, label: 'Agent Store', viewMode: 'agents' },
  { icon: Sparkles, label: 'Skills', viewMode: 'skills' },
  { icon: ListChecks, label: 'Tasks', viewMode: 'tasks' },
  { icon: Eye, label: 'Showcase', viewMode: 'showcase' },
  { icon: CreditCard, label: 'Pricing', viewMode: 'pricing' },
  { icon: Settings, label: 'Settings', viewMode: 'settings' },
]

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

const STATUS_COLORS: Record<string, string> = {
  idle: 'bg-gray-400',
  working: 'bg-emerald-500 animate-pulse',
  completed: 'bg-blue-400',
  error: 'bg-red-500',
}

// ---------- Main Component ----------

export default function MobileDrawer() {
  const mobileMenuOpen = useAppStore((s) => s.mobileMenuOpen)
  const setMobileMenuOpen = useAppStore((s) => s.setMobileMenuOpen)
  const viewMode = useAppStore((s) => s.viewMode)
  const setViewMode = useAppStore((s) => s.setViewMode)
  const userCredits = useAppStore((s) => s.userCredits)
  const userName = useAppStore((s) => s.userName)
  const agentInstances = useAppStore((s) => s.agentInstances)
  const agentTypes = useAppStore((s) => s.agentTypes)
  const activeAgentInstanceId = useAppStore((s) => s.activeAgentInstanceId)
  const setActiveAgentInstanceId = useAppStore((s) => s.setActiveAgentInstanceId)

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleNavClick = (mode: ViewMode) => {
    setViewMode(mode)
    setMobileMenuOpen(false)
  }

  const handleAgentClick = (instanceId: string) => {
    setActiveAgentInstanceId(instanceId)
    setViewMode('agent-chat')
    setMobileMenuOpen(false)
  }

  // Resolve hired agents
  const hiredAgents = agentInstances.map((instance) => {
    const agentType = agentTypes.find((t) => t.id === instance.agentTypeId)
    return {
      id: instance.id,
      name: instance.name,
      provider: agentType?.provider || 'Teamo',
      status: instance.status,
    }
  })

  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="px-5 pt-6 pb-4">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold tracking-tight text-gray-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 shadow-md">
              <span className="text-white text-xs font-black">AH</span>
            </div>
            Agent<span className="text-orange-500">Hub</span>
          </SheetTitle>
        </SheetHeader>

        <Separator />

        {/* Navigation Items */}
        <nav className="flex flex-col gap-0.5 px-3 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = viewMode === item.viewMode
            const Icon = item.icon
            return (
              <Button
                key={item.viewMode}
                variant="ghost"
                onClick={() => handleNavClick(item.viewMode)}
                className={cn(
                  'w-full justify-start gap-3 h-11 px-3 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-700 hover:to-slate-800 hover:text-white shadow-md shadow-slate-900/20'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Button>
            )
          })}
        </nav>

        {/* Hired Agents Section */}
        {hiredAgents.length > 0 && (
          <>
            <Separator />
            <div className="px-5 py-3">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                My Agents ({hiredAgents.length})
              </p>
              <ScrollArea className="max-h-[200px]">
                <div className="space-y-1">
                  {hiredAgents.map((agent) => {
                    const providerLower = agent.provider.toLowerCase()
                    const bgColor = PROVIDER_COLORS[providerLower] || 'bg-gradient-to-br from-gray-400 to-gray-500'
                    const letter = PROVIDER_LETTERS[providerLower] || agent.name.slice(0, 2).toUpperCase()
                    const statusColor = STATUS_COLORS[agent.status] || STATUS_COLORS.idle
                    const isActive = viewMode === 'agent-chat' && activeAgentInstanceId === agent.id

                    return (
                      <Button
                        key={agent.id}
                        variant="ghost"
                        onClick={() => handleAgentClick(agent.id)}
                        className={cn(
                          'w-full justify-start gap-3 h-10 px-3 rounded-xl text-sm transition-all',
                          isActive
                            ? 'bg-slate-900 text-white hover:bg-slate-800 hover:text-white'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                        )}
                      >
                        <span className={cn('h-7 w-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 shadow-sm', bgColor)}>
                          {letter}
                        </span>
                        <span className="truncate font-medium">{agent.name}</span>
                        <span className={cn('ml-auto h-2 w-2 rounded-full shrink-0', statusColor)} />
                      </Button>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        <Separator />

        {/* Bottom Section */}
        <div className="mt-auto px-5 py-4 space-y-4">
          {/* Credits display */}
          <div className="flex items-center gap-2 text-sm">
            <Coins className="size-4 text-amber-500" />
            <span className="font-semibold text-gray-900 tabular-nums">
              {userCredits}
            </span>
            <span className="text-muted-foreground">credits remaining</span>
          </div>

          <Separator />

          {/* User info */}
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white text-xs font-bold shadow-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {useAppStore.getState().userEmail}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
