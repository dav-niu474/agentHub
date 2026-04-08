'use client'

import { useEffect, useState } from 'react'
import {
  Search,
  Coins,
  Menu,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  Check,
} from 'lucide-react'
import { useAppStore, DEFAULT_MODELS } from '@/store/app-store'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

/** Map viewMode to a human-readable page title */
const VIEW_MODE_TITLES: Record<string, string> = {
  landing: '',
  workspace: 'Workspace',
  agents: 'Agent Store',
  tasks: 'Task History',
  showcase: 'Showcase',
  pricing: 'Pricing',
  compare: 'Compare',
  history: 'History',
  profile: 'Profile',
  settings: 'Settings',
}

/** Provider-specific badge colors for model selector */
const PROVIDER_BADGE: Record<string, string> = {
  anthropic: 'bg-orange-100 text-orange-700',
  openai: 'bg-emerald-100 text-emerald-700',
  google: 'bg-blue-100 text-blue-700',
  deepseek: 'bg-cyan-100 text-cyan-700',
  meta: 'bg-violet-100 text-violet-700',
}

/** Provider-specific dot colors */
const PROVIDER_DOT: Record<string, string> = {
  anthropic: 'bg-orange-500',
  openai: 'bg-emerald-500',
  google: 'bg-blue-500',
  deepseek: 'bg-cyan-600',
  meta: 'bg-violet-500',
}

export function Topbar() {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    userCredits,
    userName,
    selectedModelId,
    setSelectedModelId,
    models,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useAppStore()

  const [scrolled, setScrolled] = useState(false)
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false)

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

  const pageTitle = VIEW_MODE_TITLES[viewMode] ?? ''

  // Current selected model
  const currentModel = models.find((m) => m.id === selectedModelId) ?? DEFAULT_MODELS[0]
  const providerLower = currentModel.provider.toLowerCase()

  // Placeholder text for the search input
  const searchPlaceholder =
    viewMode === 'agents'
      ? 'Search agents & capabilities…'
      : viewMode === 'tasks'
        ? 'Search tasks…'
        : viewMode === 'showcase'
          ? 'Search showcase…'
          : viewMode === 'pricing'
            ? 'Search plans…'
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

      {/* ── Right: Model selector + Credits + User avatar ── */}
      <div className="flex items-center gap-2 pr-4 ml-auto md:ml-0">
        {/* Model Selector Popover */}
        <Popover open={modelPopoverOpen} onOpenChange={setModelPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'hidden sm:flex items-center gap-2 h-8 px-2.5 rounded-lg',
                'hover:bg-gray-100 text-gray-700 font-medium text-sm',
                'transition-colors duration-150',
              )}
            >
              {/* Provider color dot */}
              <span
                className={cn(
                  'h-2 w-2 rounded-full shrink-0',
                  PROVIDER_DOT[providerLower] || 'bg-gray-500',
                )}
              />
              <span className="truncate max-w-[120px]">{currentModel.name}</span>
              <ChevronDown className="size-3.5 text-gray-400 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-0">
            <div className="px-3 py-2.5 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">Select AI Model</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Choose the model for your workspace
              </p>
            </div>
            <ScrollArea className="max-h-[280px]">
              <div className="py-1">
                {models.map((model) => {
                  const isActive = model.id === selectedModelId
                  const mProviderLower = model.provider.toLowerCase()
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        setSelectedModelId(model.id)
                        setModelPopoverOpen(false)
                        toast.success(`Switched to ${model.name}`, {
                          description: `Credits per conversation: ${model.creditsPerConversation}`,
                        })
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-100',
                        isActive
                          ? 'bg-gray-50'
                          : 'hover:bg-gray-50',
                      )}
                    >
                      {/* Provider color dot */}
                      <span
                        className={cn(
                          'h-3 w-3 rounded-full shrink-0',
                          PROVIDER_DOT[mProviderLower] || 'bg-gray-500',
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {model.name}
                          </span>
                          {isActive && (
                            <Check className="size-3.5 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">{model.provider}</span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-500">
                            {model.creditsPerConversation} credits
                          </span>
                          {model.tier === 'pro' && (
                            <Badge
                              variant="secondary"
                              className="text-[9px] font-semibold px-1.5 py-0 h-4 bg-amber-100 text-amber-700 border-0"
                            >
                              PRO
                            </Badge>
                          )}
                          {model.tier === 'enterprise' && (
                            <Badge
                              variant="secondary"
                              className="text-[9px] font-semibold px-1.5 py-0 h-4 bg-violet-100 text-violet-700 border-0"
                            >
                              ENT
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* Mobile-only model indicator */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden size-8 shrink-0"
          aria-label="Model selector"
        >
          <Sparkles className="size-4 text-gray-500" />
        </Button>

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

        {/* Mobile credits */}
        <div className="sm:hidden">
          <Coins className="size-4 text-amber-500" />
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
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
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
              Profile
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
