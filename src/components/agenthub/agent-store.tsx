'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Bot,
  Search,
  Terminal,
  Brain,
  Zap,
  MousePointer2,
  BookOpen,
  Megaphone,
  Scale,
  GraduationCap,
  BarChart3,
  Eye,
  Plus,
  Cpu,
  Code2,
  Globe,
  Shield,
  Sparkles,
  ArrowRight,
  Filter,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react'
import { useAppStore, DEFAULT_AGENT_TYPES, DEFAULT_MODELS, type AgentType } from '@/store/app-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

// ==================== Constants ====================

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'coding', label: 'Coding', icon: Code2 },
  { id: 'research', label: 'Research', icon: BookOpen },
  { id: 'creative', label: 'Creative', icon: Globe },
  { id: 'automation', label: 'Automation', icon: Zap },
  { id: 'strategy', label: 'Strategy', icon: Shield },
] as const

const PROVIDER_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Anthropic: { bg: 'bg-orange-100 dark:bg-orange-950/50', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
  OpenAI: { bg: 'bg-emerald-100 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  'Open Source': { bg: 'bg-slate-100 dark:bg-slate-800/50', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' },
  Cursor: { bg: 'bg-purple-100 dark:bg-purple-950/50', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  Teamo: { bg: 'bg-amber-100 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  available: { bg: 'bg-green-100 dark:bg-green-950/50', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
  beta: { bg: 'bg-yellow-100 dark:bg-yellow-950/50', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500' },
  'coming-soon': { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' },
}

const STATUS_LABELS: Record<string, string> = {
  available: 'Available',
  beta: 'Beta',
  'coming-soon': 'Coming Soon',
}

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  claude: Terminal,
  openai: Brain,
  openclaw: Cpu,
  cursor: MousePointer2,
  research: BookOpen,
  marketing: Megaphone,
  legal: Scale,
  academic: GraduationCap,
  data: BarChart3,
  review: Eye,
}

const CATEGORY_BG_MAP: Record<string, string> = {
  coding: 'from-emerald-500/10 to-teal-500/10',
  research: 'from-blue-500/10 to-cyan-500/10',
  creative: 'from-pink-500/10 to-rose-500/10',
  automation: 'from-orange-500/10 to-amber-500/10',
  strategy: 'from-violet-500/10 to-purple-500/10',
}

const CATEGORY_ICON_COLOR_MAP: Record<string, string> = {
  coding: 'text-emerald-600 dark:text-emerald-400',
  research: 'text-blue-600 dark:text-blue-400',
  creative: 'text-pink-600 dark:text-pink-400',
  automation: 'text-orange-600 dark:text-orange-400',
  strategy: 'text-violet-600 dark:text-violet-400',
}

const MODEL_PROVIDER_ICONS: Record<string, string> = {
  claude: 'C',
  openai: 'G',
  google: 'G',
  deepseek: 'D',
  meta: 'M',
}

// ==================== Helper Components ====================

function AgentIcon({ icon, category }: { icon: string; category: string }) {
  const IconComponent = CATEGORY_ICON_MAP[icon] || Bot
  const bgColor = CATEGORY_BG_MAP[category] || 'from-gray-500/10 to-gray-500/10'
  const iconColor = CATEGORY_ICON_COLOR_MAP[category] || 'text-gray-600 dark:text-gray-400'

  return (
    <div className={cn('w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto', bgColor)}>
      <IconComponent className={cn('w-8 h-8', iconColor)} />
    </div>
  )
}

function ProviderBadge({ provider }: { provider: string }) {
  const style = PROVIDER_STYLES[provider] || PROVIDER_STYLES['Open Source']
  return (
    <span className={cn('inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md border', style.bg, style.text, style.border)}>
      {provider}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES['coming-soon']
  const label = STATUS_LABELS[status] || status
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full', style.bg, style.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', style.dot)} />
      {label}
    </span>
  )
}

function SupportedModels({ modelIds }: { modelIds: string[] }) {
  const models = DEFAULT_MODELS.filter((m) => modelIds.includes(m.id))
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {models.map((model) => {
        const letter = MODEL_PROVIDER_ICONS[model.icon] || model.provider[0]
        const colors: Record<string, string> = {
          Claude: 'bg-orange-500 text-white',
          GPT: 'bg-emerald-500 text-white',
          Gemini: 'bg-blue-500 text-white',
          DeepSeek: 'bg-sky-500 text-white',
          Llama: 'bg-slate-600 text-white',
        }
        const prefix = model.name.split(' ')[0]
        const color = colors[prefix] || 'bg-gray-500 text-white'
        return (
          <span
            key={model.id}
            className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold', color)}
            title={model.name}
          >
            {letter}
          </span>
        )
      })}
    </div>
  )
}

function CapabilityPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 whitespace-nowrap">
      {label}
    </span>
  )
}

// ==================== Skeleton Loading ====================

function AgentCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="flex justify-center">
        <Skeleton className="w-16 h-16 rounded-2xl" />
      </div>
      <div className="space-y-2 text-center">
        <Skeleton className="h-5 w-32 mx-auto" />
        <Skeleton className="h-3 w-24 mx-auto" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5 mx-auto" />
      </div>
      <div className="flex flex-wrap gap-1 justify-center">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-18 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <AgentCardSkeleton key={i} />
      ))}
    </div>
  )
}

// ==================== Agent Card ====================

function AgentCard({ agent, onHire, alreadyHired }: { agent: AgentType; onHire: (agent: AgentType) => void; alreadyHired: boolean }) {
  const isComingSoon = agent.status === 'coming-soon'

  return (
    <div
      className={cn(
        'group relative rounded-xl border bg-white dark:bg-gray-950 p-5 flex flex-col gap-4 transition-all duration-200',
        'hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:border-gray-300 dark:hover:border-gray-700',
        'hover:-translate-y-0.5',
        isComingSoon ? 'opacity-70' : '',
      )}
    >
      {/* Provider badge (top-left) + Status (top-right) */}
      <div className="flex items-start justify-between">
        <ProviderBadge provider={agent.provider} />
        <StatusBadge status={agent.status} />
      </div>

      {/* Icon */}
      <AgentIcon icon={agent.icon} category={agent.category} />

      {/* Name + Provider */}
      <div className="text-center space-y-1">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">
          {agent.name}
        </h3>
        <p className="text-xs text-muted-foreground">{agent.provider}</p>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center leading-relaxed line-clamp-2 min-h-[2.5rem]">
        {agent.description}
      </p>

      {/* Capabilities */}
      <div className="flex flex-wrap gap-1 justify-center">
        {agent.capabilities.slice(0, 4).map((cap) => (
          <CapabilityPill key={cap} label={cap} />
        ))}
        {agent.capabilities.length > 4 && (
          <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500">
            +{agent.capabilities.length - 4}
          </span>
        )}
      </div>

      {/* Divider */}
      <Separator />

      {/* Bottom: Models + Button */}
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Models</p>
          <SupportedModels modelIds={agent.supportedModelIds} />
        </div>

        <Button
          size="sm"
          disabled={isComingSoon}
          onClick={() => onHire(agent)}
          className={cn(
            'gap-1.5 shrink-0 font-medium transition-all',
            alreadyHired && !isComingSoon && 'bg-emerald-600 hover:bg-emerald-700',
            !isComingSoon && !alreadyHired && 'group-hover:gap-2',
          )}
        >
          {isComingSoon ? (
            'Coming Soon'
          ) : alreadyHired ? (
            <>
              <CheckCircle2 className="size-3.5" />
              Hired
            </>
          ) : (
            <>
              <Plus className="size-3.5" />
              Hire Agent
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// ==================== Empty State ====================

function EmptyState({ query, category }: { query: string; category: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No agents found</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {query && category !== 'all'
          ? `No agents match "${query}" in the ${category} category. Try a different search or category.`
          : query
            ? `No agents match "${query}". Try a different search term.`
            : `No agents available in the ${category} category yet. Check back soon!`}
      </p>
    </div>
  )
}

// ==================== Main Component ====================

export default function AgentStore() {
  const {
    agentTypes,
    setAgentTypes,
    searchQuery,
    setSearchQuery,
    selectedAgentCategory,
    setSelectedAgentCategory,
    agentInstances,
    addAgentInstance,
  } = useAppStore()

  const [loading, setLoading] = useState(true)

  // Initialize agent types and show skeleton for 600ms
  useEffect(() => {
    if (agentTypes.length === 0) {
      setAgentTypes(DEFAULT_AGENT_TYPES)
    }
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [agentTypes.length, setAgentTypes])

  // Filter agents by category and search
  const filteredAgents = useMemo(() => {
    let agents = agentTypes

    // Category filter
    if (selectedAgentCategory !== 'all') {
      agents = agents.filter((a) => a.category === selectedAgentCategory)
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      agents = agents.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.provider.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.capabilities.some((c) => c.toLowerCase().includes(q)) ||
          a.tags.toLowerCase().includes(q),
      )
    }

    return agents
  }, [agentTypes, selectedAgentCategory, searchQuery])

  // Count agents per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: agentTypes.length }
    agentTypes.forEach((a) => {
      counts[a.category] = (counts[a.category] || 0) + 1
    })
    return counts
  }, [agentTypes])

  // Check if an agent type is already hired
  const isHired = useCallback(
    (agentTypeId: string) => agentInstances.some((inst) => inst.agentTypeId === agentTypeId),
    [agentInstances],
  )

  const handleHire = useCallback(
    (agent: AgentType) => {
      if (isHired(agent.id)) {
        toast.info(`${agent.name} is already hired`, {
          description: 'Find it in the left sidebar to start chatting.',
        })
        return
      }
      const instanceId = `${agent.id}-${Date.now()}`
      addAgentInstance({
        id: instanceId,
        agentTypeId: agent.id,
        name: agent.name,
        modelId: agent.defaultModelId,
        status: 'idle',
        createdAt: new Date(),
      })
      toast.success(`${agent.name} hired!`, {
        description: `${agent.name} is now available in the sidebar. Click the icon to start chatting.`,
      })
    },
    [addAgentInstance, isHired],
  )

  return (
    <ScrollArea className="h-full">
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Agent Store
              </h1>
            </div>
          </div>
          <p className="text-sm md:text-base text-muted-foreground ml-[52px] max-w-xl">
            Hire AI agents for your projects. Hired agents appear in the sidebar — click to chat and assign tasks.
          </p>
        </div>

        {/* ── Search Bar (mobile) ── */}
        <div className="md:hidden mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-3 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
            />
          </div>
        </div>

        {/* ── Category Filter Pills ── */}
        <div className="mb-8">
          <ScrollArea className="w-full" type="scroll">
            <div className="flex items-center gap-2 pb-2 min-w-max md:min-w-0">
              {CATEGORIES.map((cat) => {
                const isActive = selectedAgentCategory === cat.id
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedAgentCategory(cat.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                      isActive
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
                    )}
                  >
                    <Icon className="size-3.5" />
                    {cat.label}
                    <span
                      className={cn(
                        'text-[11px] font-semibold tabular-nums',
                        isActive ? 'text-white/70 dark:text-gray-900/70' : 'text-muted-foreground',
                      )}
                    >
                      {categoryCounts[cat.id] || 0}
                    </span>
                  </button>
                )
              })}
            </div>
            <ScrollBar orientation="horizontal" className="invisible md:hidden" />
          </ScrollArea>
        </div>

        {/* ── Results count ── */}
        {!loading && (
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-muted-foreground">
              {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} found
              {selectedAgentCategory !== 'all' && (
                <span className="text-gray-900 dark:text-gray-100 font-medium ml-1">
                  in {CATEGORIES.find((c) => c.id === selectedAgentCategory)?.label}
                </span>
              )}
            </p>
            {(searchQuery || selectedAgentCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedAgentCategory('all')
                }}
                className="text-xs text-muted-foreground hover:text-gray-900 dark:hover:text-gray-100 underline underline-offset-2 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* ── Agent Grid ── */}
        {loading ? (
          <LoadingSkeleton />
        ) : filteredAgents.length === 0 ? (
          <EmptyState query={searchQuery} category={selectedAgentCategory} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onHire={handleHire} alreadyHired={isHired(agent.id)} />
            ))}
          </div>
        )}

        {/* ── Footer info ── */}
        {!loading && filteredAgents.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              Can&apos;t find what you need?{' '}
              <button className="text-orange-600 dark:text-orange-400 font-medium hover:underline underline-offset-2">
                Request an agent
              </button>
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
