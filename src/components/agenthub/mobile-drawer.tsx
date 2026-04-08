'use client'

import {
  House,
  LayoutDashboard,
  Bot,
  ListChecks,
  Eye,
  CreditCard,
  Settings,
  Coins,
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
  { icon: Settings, label: 'Settings', viewMode: 'settings' },
]

// ---------- Main Component ----------

export default function MobileDrawer() {
  const mobileMenuOpen = useAppStore((s) => s.mobileMenuOpen)
  const setMobileMenuOpen = useAppStore((s) => s.setMobileMenuOpen)
  const viewMode = useAppStore((s) => s.viewMode)
  const setViewMode = useAppStore((s) => s.setViewMode)
  const userCredits = useAppStore((s) => s.userCredits)
  const userName = useAppStore((s) => s.userName)

  // Derive user initials
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

  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="px-5 pt-6 pb-4">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold tracking-tight text-gray-900">
            {/* Logo */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-600">
              <span className="text-white text-xs font-bold">AH</span>
            </div>
            Agent<span className="text-orange-500">Hub</span>
          </SheetTitle>
        </SheetHeader>

        <Separator />

        {/* ── Navigation Items ── */}
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
                  'w-full justify-start gap-3 h-11 px-3 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-slate-900 text-white hover:bg-slate-800 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Button>
            )
          })}
        </nav>

        <Separator />

        {/* ── Bottom Section ── */}
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
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                alex@example.com
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
