'use client'

import { useEffect, useState } from 'react'
import {
  Search,
  Coins,
  Menu,
  User,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

/** Map viewMode to a human-readable page title */
const viewModeTitles: Record<string, string> = {
  landing: '',
  chat: 'Chat',
  marketplace: 'Skill Store',
  history: 'History',
  favorites: 'Favorites',
  profile: 'My Profile',
  settings: 'Settings',
}

export function Topbar() {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    userCredits,
    userName,
    userAvatar,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useAppStore()

  const [scrolled, setScrolled] = useState(false)

  // Track scroll position for backdrop-blur effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Derive user initials from userName
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const pageTitle = viewModeTitles[viewMode] ?? ''

  // Placeholder text for the search input
  const searchPlaceholder =
    viewMode === 'marketplace'
      ? 'Search skills & agents…'
      : viewMode === 'chat'
        ? 'Search conversations…'
        : viewMode === 'history'
          ? 'Search history…'
          : 'Search…'

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-40 flex items-center h-[52px] transition-all duration-200',
        'md:left-[80px]',
        scrolled
          ? 'bg-white/80 backdrop-blur-lg border-b border-gray-200/60 shadow-sm'
          : 'bg-transparent',
      )}
    >
      {/* ── Left: Logo + Page title ── */}
      <div className="flex items-center gap-3 pl-4 min-w-0">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden size-8 shrink-0"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <Menu className="size-5" />
        </Button>

        {/* Logo */}
        <span className="text-lg font-bold tracking-tight text-gray-900 select-none whitespace-nowrap">
          Agent<span className="text-orange-500">Hub</span>
        </span>

        {/* Current page title (desktop only) */}
        {pageTitle && (
          <>
            <Separator orientation="vertical" className="hidden md:block h-4" />
            <span className="hidden md:inline text-sm font-medium text-gray-500 truncate">
              {pageTitle}
            </span>
          </>
        )}
      </div>

      {/* ── Center: Search input (desktop only) ── */}
      <div className="hidden md:flex flex-1 justify-center px-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'h-8 pl-9 pr-3 rounded-full text-sm bg-gray-100 border-0',
              'focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:bg-white',
              'placeholder:text-gray-400',
            )}
          />
        </div>
      </div>

      {/* ── Right: Credits + User avatar ── */}
      <div className="flex items-center gap-3 pr-4 ml-auto md:ml-0">
        {/* Credits display */}
        <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600">
          <Coins className="size-4 text-amber-500" />
          <span className="font-semibold tabular-nums">{userCredits}</span>
          <Badge
            variant="secondary"
            className="ml-1 text-[10px] font-semibold px-1.5 py-0 h-5 bg-orange-100 text-orange-600 border-0"
          >
            Free
          </Badge>
        </div>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative size-8 rounded-full p-0 hover:bg-gray-100 focus-visible:ring-1 focus-visible:ring-gray-300"
              aria-label="User menu"
            >
              <Avatar className="size-8">
                {userAvatar ? (
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            {/* User name header */}
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <p className="mt-1 text-xs text-muted-foreground truncate">
                alex@example.com
              </p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => setViewMode('profile')}
              className="cursor-pointer"
            >
              <User className="size-4" />
              My Profile
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setViewMode('settings')}
              className="cursor-pointer"
            >
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onClick={() => toast('Signed out successfully', { description: 'You have been signed out of AgentHub.' })}
              className="cursor-pointer"
            >
              <LogOut className="size-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
