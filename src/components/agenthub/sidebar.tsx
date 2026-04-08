'use client'

import { useMemo } from 'react'
import {
  House,
  Bot,
  ListChecks,
  Eye,
  CreditCard,
  Sparkles,
  Plus,
  Settings,
  LayoutDashboard,
  Hexagon,
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
  { icon: House, label: 'Home', viewMode: 'landing' },
  { icon: LayoutDashboard, label: 'Workspace', viewMode: 'workspace' },
  { icon: Bot, label: 'Agents', viewMode: 'agents' },
  { icon: Sparkles, label: 'Skills', viewMode: 'skills' },
  { icon: ListChecks, label: 'Tasks', viewMode: 'tasks' },
  { icon: Eye, label: 'Showcase', viewMode: 'showcase' },
  { icon: CreditCard, label: 'Pricing', viewMode: 'pricing' },
]

/** Provider-specific color map for agent instance indicators */
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

/** Status indicator colors for agent instances */
const STATUS_COLORS: Record<string, string> = {
  idle: 'bg-gray-400',
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
            'group relative flex w-full flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all duration-200 outline-none',
            active
              ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-md shadow-slate-900/20'
              : 'text-gray-400 hover:bg-gray-50 hover:text-slate-700',
          )}
        >
          <Icon className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110" strokeWidth={active ? 2.2 : 1.8} />
          <span className="text-[10px] leading-none font-semibold select-none">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={12} className="rounded-lg">
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

  const handleAgentClick = (instanceId: string) => {
    setActiveAgentInstanceId(instanceId)
    setViewMode('agent-chat')
  }

  return (
    <TooltipProvider delayDuration={300}>
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-[72px] items-center justify-center py-3">
        <nav className="flex h-full max-h-[calc(100vh-1.5rem)] w-[60px] flex-col items-center overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 backdrop-blur-md shadow-lg shadow-gray-200/50">
          {/* ---- Top section: Logo + Nav + Agents ---- */}
          <ScrollArea className="flex-1 w-full">
            <div className="flex w-full flex-col items-center gap-0.5 px-2 pt-3 pb-2">
              {/* Logo */}
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white text-[12px] font-black tracking-tighter select-none shadow-md shadow-slate-800/30">
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
              <Separator className="my-2 w-8 !bg-gray-200/80" />

              {/* Hired agents section label */}
              {hiredAgents.length > 0 && (
                <span className="text-[8px] font-bold text-gray-300 uppercase tracking-[0.15em] mb-1 select-none">
                  Agents
                </span>
              )}

              {/* Hired agent instances */}
              {hiredAgents.map((agent) => {
                const providerLower = agent.provider.toLowerCase()
                const bgColor = PROVIDER_COLORS[providerLower] || 'bg-gradient-to-br from-gray-400 to-gray-500'
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
                          'group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 outline-none',
                          isActive
                            ? 'ring-2 ring-slate-800 ring-offset-2 shadow-md'
                            : 'hover:ring-2 hover:ring-gray-200 hover:ring-offset-2',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-bold text-white select-none shadow-sm transition-transform duration-200 group-hover:scale-105',
                            bgColor,
                          )}
                        >
                          {letter}
                        </span>
                        <span
                          className={cn(
                            'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-[2px] border-white shadow-sm',
                            statusColor,
                          )}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12} className="rounded-lg">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold">{agent.name}</span>
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
          <div className="flex w-full flex-col items-center gap-1 border-t border-gray-100 px-2 py-2">
            {/* Add Agent */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setViewMode('agents')}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-gray-400 transition-all duration-200 hover:bg-gray-50 hover:text-slate-700 outline-none"
                >
                  <Plus className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  <span className="text-[10px] leading-none font-semibold select-none">Hire</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12} className="rounded-lg">
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
