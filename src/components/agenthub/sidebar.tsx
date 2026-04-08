'use client'

import { useMemo } from 'react'
import {
  House,
  LayoutDashboard,
  Bot,
  ListChecks,
  Eye,
  CreditCard,
  GitCompareArrows,
  Plus,
  Settings,
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
  { icon: ListChecks, label: 'Tasks', viewMode: 'tasks' },
  { icon: Eye, label: 'Showcase', viewMode: 'showcase' },
  { icon: CreditCard, label: 'Pricing', viewMode: 'pricing' },
  { icon: GitCompareArrows, label: 'Compare', viewMode: 'compare' },
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
  working: 'bg-green-400',
  paused: 'bg-amber-400',
  completed: 'bg-blue-400',
  error: 'bg-red-400',
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
          {/* Active indicator bar */}
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

interface PinnedAgentProps {
  instanceId: string
  name: string
  provider: string
  status: string
  active?: boolean
  onClick?: () => void
}

function PinnedAgent({ name, provider, status, active, onClick }: PinnedAgentProps) {
  const providerLower = provider.toLowerCase()
  const bgColor = PROVIDER_COLORS[providerLower] || 'bg-gray-500'
  const letter = PROVIDER_LETTERS[providerLower] || name.slice(0, 2).toUpperCase()
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.idle

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className={cn(
            'group relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 outline-none',
            active
              ? 'ring-2 ring-slate-900 ring-offset-1'
              : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1',
          )}
        >
          {/* Colored circle with provider initials */}
          <span
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white select-none',
              bgColor,
            )}
          >
            {letter}
          </span>
          {/* Status indicator dot */}
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
          <span className="font-medium">{name}</span>
          <span className="text-xs text-muted-foreground capitalize">{status}</span>
        </div>
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

  // Resolve pinned agent instances (up to 4) with their agent type info
  const pinnedAgents = useMemo(() => {
    return agentInstances.slice(0, 4).map((instance) => {
      const agentType = agentTypes.find((t) => t.id === instance.agentTypeId)
      return {
        id: instance.id,
        name: instance.name,
        provider: agentType?.provider || 'teamo',
        status: instance.status,
      }
    })
  }, [agentInstances, agentTypes])

  return (
    <TooltipProvider delayDuration={300}>
      {/* Fixed sidebar track – full height, 68px wide, centered */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-[68px] items-center justify-center py-4">
        {/* Card container */}
        <nav className="flex h-full max-h-[calc(100vh-2rem)] w-[56px] flex-col items-center overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <ScrollArea className="flex-1 w-full">
            <div className="flex w-full flex-col items-center gap-1 px-1.5 py-3">
              {/* ---- Logo ---- */}
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-600 text-white text-[13px] font-bold tracking-tight select-none">
                AH
              </div>

              {/* ---- Main nav items ---- */}
              {NAV_ITEMS.map((item) => (
                <SidebarIcon
                  key={item.viewMode}
                  icon={item.icon}
                  label={item.label}
                  active={viewMode === item.viewMode}
                  onClick={() => setViewMode(item.viewMode)}
                />
              ))}

              {/* ---- Separator ---- */}
              <Separator className="my-2 w-8 !bg-gray-200" />

              {/* ---- Pinned agent instances ---- */}
              {pinnedAgents.length > 0 && (
                <div className="flex w-full flex-col items-center gap-1">
                  {pinnedAgents.map((agent) => (
                    <PinnedAgent
                      key={agent.id}
                      instanceId={agent.id}
                      name={agent.name}
                      provider={agent.provider}
                      status={agent.status}
                      active={viewMode === 'workspace'}
                      onClick={() => {
                        // When clicking a pinned agent, go to workspace and focus on it
                        setViewMode('workspace')
                      }}
                    />
                  ))}
                </div>
              )}
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
                  <span className="text-[11px] leading-none font-medium select-none">Add</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Add Agent
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
