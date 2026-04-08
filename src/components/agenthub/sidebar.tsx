'use client'

import { useMemo } from 'react'
import {
  House,
  Compass,
  MessageSquare,
  Clock,
  Heart,
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
  { icon: Compass, label: 'Explore', viewMode: 'marketplace' },
  { icon: MessageSquare, label: 'Chat', viewMode: 'chat' },
  { icon: Clock, label: 'History', viewMode: 'history' },
  { icon: Heart, label: 'Favorites', viewMode: 'favorites' },
]

// Small palette for pinned app avatars – cycled through by index
const AVATAR_COLORS = [
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-violet-500',
]

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

// ---------- Main Component ----------

export function Sidebar() {
  const viewMode = useAppStore((s) => s.viewMode)
  const setViewMode = useAppStore((s) => s.setViewMode)
  const pinnedApps = useAppStore((s) => s.pinnedApps)
  const skills = useAppStore((s) => s.skills)

  // Resolve pinned skill objects (max 5)
  const pinnedSkills = useMemo(() => {
    return pinnedApps
      .slice(0, 5)
      .map((id) => skills.find((s) => s.id === id))
      .filter(Boolean) as (typeof skills)[number][]
  }, [pinnedApps, skills])

  return (
    <TooltipProvider delayDuration={300}>
      {/* Fixed sidebar track – full height, 68px wide, centered */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-[68px] items-center justify-center py-4">
        {/* Card container */}
        <nav className="flex h-full max-h-[calc(100vh-2rem)] w-[56px] flex-col items-center overflow-hidden rounded-2xl border border-gray-200 bg-[#fdfdfe] shadow-sm">
          <ScrollArea className="flex-1 w-full">
            <div className="flex w-full flex-col items-center gap-1 px-1.5 py-3">
              {/* ---- Logo ---- */}
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 text-white text-[13px] font-bold tracking-tight select-none">
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

              {/* ---- Pinned agent apps ---- */}
              {pinnedSkills.length > 0 && (
                <div className="flex w-full flex-col items-center gap-1">
                  {pinnedSkills.map((skill, i) => (
                    <Tooltip key={skill.id}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => {
                            useAppStore.getState().setActiveAgentId(skill.id)
                            setViewMode('chat')
                          }}
                          className={cn(
                            'group flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 outline-none',
                            viewMode === 'chat' && useAppStore.getState().activeAgentId === skill.id
                              ? 'ring-2 ring-slate-900 ring-offset-1'
                              : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1',
                          )}
                        >
                          {/* Colored circle with initials */}
                          <span
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-white select-none',
                              AVATAR_COLORS[i % AVATAR_COLORS.length],
                            )}
                          >
                            {skill.name
                              .split(/\s+/)
                              .map((w) => w[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8}>
                        {skill.name}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* ---- Bottom actions ---- */}
          <div className="flex w-full flex-col items-center gap-1 border-t border-gray-100 px-1.5 py-2">
            {/* Add / Discover */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setViewMode('marketplace')}
                  className="flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-slate-700 outline-none"
                >
                  <Plus className="h-5 w-5" strokeWidth={1.8} />
                  <span className="text-[11px] leading-none font-medium select-none">Add</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Discover Skills
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
