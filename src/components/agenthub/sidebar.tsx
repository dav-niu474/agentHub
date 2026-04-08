'use client'

import { useMemo } from 'react'
import {
  House,
  Bot,
  ListChecks,
  Eye,
  CreditCard,
  Plus,
  Settings,
  MessageSquare,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore, type ViewMode } from '@/store/app-store'
import { cn } from '@/lib/utils'

// ---------- Constants ----------

interface NavItem {
  icon: LucideIcon
  label: string
  viewMode: ViewMode
}

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Workspace', viewMode: 'workspace' },
  { icon: House, label: 'Home', viewMode: 'landing' },
  { icon: Bot, label: 'Agents', viewMode: 'agents' },
  { icon: ListChecks, label: 'Tasks', viewMode: 'tasks' },
  { icon: Eye, label: 'Showcase', viewMode: 'showcase' },
  { icon: CreditCard, label: 'Pricing', viewMode: 'pricing' },
]

/** Provider-specific color map for agent instance indicators */
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

/** Status indicator colors for agent instances */
const STATUS_COLORS: Record<string, string> = {
  idle: 'bg-gray-300',
  working: 'bg-emerald-500 animate-pulse',
  completed: 'bg-blue-400',
  error: 'bg-red-500',
}

const STATUS_LABELS: Record<string, string> = {
  idle: 'Idle',
  working: 'Working',
  completed: 'Completed',
  error: 'Error',
}

// ---------- Sub-components ----------

interface SidebarIconProps {
  icon: LucideIcon
  label: string
  active?: boolean
  onClick?: () => void
}

function SidebarIcon({ icon: Icon, label, active = false, onClick }: SidebarIconProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className={cn(
            'group relative flex w-full flex-col items-center justify-center gap-1 py-2 rounded-lg transition-all duration-200 outline-none',
            active
              ? 'bg-slate-900 text-white'
              : 'text-gray-500 hover:bg-gray-100 hover:text-slate-700',
          )}
        >
          {active && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-slate-900" />
          )}
          <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.2 : 1.8} />
          <span className="text-[11px] leading-none font-medium select-none">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

// ---------- Main Component ----------

export function Sidebar() {
  const viewMode = useAppStore((s) => s.viewMode)
  const setViewMode = useAppStore((s) => s.setViewMode)
  const agentInstances = useAppStore((s) => s.agentInstances)
  const agentTypes = useAppStore((s) => s.agentTypes)
  const activeAgentInstanceId = useAppStore((s) => s.activeAgentInstanceId)
  const setActiveAgentInstanceId = useAppStore((s) => s.setActiveAgentInstanceId)

  // Resolve hired agent instances with their agent type info
  const hiredAgents = useMemo(() => {
    return agentInstances.map((instance) => {
      const agentType = agentTypes.find((t) => t.id === instance.agentTypeId)
      return {
        id: instance.id,
        name: instance.name,
        provider: agentType?.provider || 'Teamo',
        status: instance.status,
        currentTask: instance.currentTask,
      }
    })
  }, [agentInstances, agentTypes])

  const unreadCount = 0 // Could be derived from notifications

  const handleAgentClick = (instanceId: string) => {
    setActiveAgentInstanceId(instanceId)
    setViewMode('agent-chat')
  }

  return (
    <TooltipProvider delayDuration={300}>
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-[68px] items-center justify-center py-4">
        <nav className="flex h-full max-h-[calc(100vh-2rem)] w-[56px] flex-col items-center overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* ---- Top section: Logo + Nav + Agents ---- */}
          <ScrollArea className="flex-1 w-full">
            <div className="flex w-full flex-col items-center gap-1 px-1.5 py-3">
              {/* Logo */}
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-600 text-white text-[13px] font-bold tracking-tight select-none">
                AH
              </div>

              {/* Main nav items */}
              {NAV_ITEMS.map((item) => (
                <SidebarIcon
                  key={item.viewMode}
                  icon={item.icon}
                  label={item.label}
                  active={viewMode === item.viewMode}
                  onClick={() => setViewMode(item.viewMode)}
                />
              ))}

              {/* Separator */}
              <Separator className="my-2 w-8 !bg-gray-200" />

              {/* Hired agents section label */}
              {hiredAgents.length > 0 && (
                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1 select-none">
                  My Agents
                </span>
              )}

              {/* Hired agent instances */}
              {hiredAgents.map((agent) => {
                const providerLower = agent.provider.toLowerCase()
                const bgColor = PROVIDER_COLORS[providerLower] || 'bg-gray-500'
                const letter = PROVIDER_LETTERS[providerLower] || agent.name.slice(0, 2).toUpperCase()
                const statusColor = STATUS_COLORS[agent.status] || STATUS_COLORS.idle
                const isActive = viewMode === 'agent-chat' && activeAgentInstanceId === agent.id

                return (
                  <Tooltip key={agent.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handleAgentClick(agent.id)}
                        className={cn(
                          'group relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 outline-none',
                          isActive
                            ? 'ring-2 ring-slate-900 ring-offset-1'
                            : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white select-none',
                            bgColor,
                          )}
                        >
                          {letter}
                        </span>
                        <span
                          className={cn(
                            'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white',
                            statusColor,
                          )}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{agent.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {STATUS_LABELS[agent.status] || agent.status}
                          {agent.currentTask && ` · ${agent.currentTask}`}
                        </span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </ScrollArea>

          {/* ---- Bottom actions ---- */}
          <div className="flex w-full flex-col items-center gap-1 border-t border-gray-100 px-1.5 py-2">
            {/* Add Agent */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setViewMode('agents')}
                  className="flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-slate-700 outline-none"
                >
                  <Plus className="h-5 w-5" strokeWidth={1.8} />
                  <span className="text-[11px] leading-none font-medium select-none">Hire</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Hire Agent
              </TooltipContent>
            </Tooltip>

            {/* Settings */}
            <SidebarIcon
              icon={Settings}
              label="Settings"
              active={viewMode === 'settings'}
              onClick={() => setViewMode('settings')}
            />
          </div>
        </nav>
      </aside>
    </TooltipProvider>
  )
}
