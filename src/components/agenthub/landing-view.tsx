'use client'

import Image from 'next/image'
import { useAppStore, DEFAULT_AGENT_TYPES, DEFAULT_SHOWCASE } from '@/store/app-store'
import {
  Zap,
  ArrowRight,
  Bot,
  Target,
  Rocket,
  Plus,
  CheckCircle2,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

// ---------- Provider color mapping ----------

const PROVIDER_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  anthropic: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: 'bg-gradient-to-br from-orange-500 to-amber-600',
  },
  openai: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  },
  'open source': {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    icon: 'bg-gradient-to-br from-violet-500 to-purple-600',
  },
  teamo: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    icon: 'bg-gradient-to-br from-slate-700 to-slate-900',
  },
}

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  coding: 'bg-blue-50 text-blue-600 border-blue-200',
  research: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  creative: 'bg-pink-50 text-pink-600 border-pink-200',
  automation: 'bg-violet-50 text-violet-600 border-violet-200',
  strategy: 'bg-amber-50 text-amber-600 border-amber-200',
}

// ---------- Featured agents ----------

const FEATURED_AGENT_IDS = ['claude-code', 'codex', 'openclaw', 'deep-research']

// ---------- Step data ----------

const STEPS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Bot,
    title: 'Choose Your Agents',
    description: 'Select from Claude Code, Codex, OpenClaw and more. Pick the right AI agents for your task.',
  },
  {
    icon: Target,
    title: 'Define Your Goal',
    description: 'Describe what you want to build, research, or accomplish in plain language.',
  },
  {
    icon: Rocket,
    title: 'Wake Up to Results',
    description: 'Agents work 24/7 autonomously in the cloud. You rest, they never stop.',
  },
]

// ---------- Trusted logos ----------

const TRUSTED_LOGOS = [
  { name: 'Anthropic', className: 'text-orange-600' },
  { name: 'OpenAI', className: 'text-emerald-600' },
  { name: 'Google DeepSeek', className: 'text-sky-600' },
  { name: 'Meta', className: 'text-slate-600' },
]

// ---------- Main Component ----------

export default function LandingView() {
  const { setViewMode, addAgentInstance, agentInstances } = useAppStore()

  const featuredAgents = DEFAULT_AGENT_TYPES.filter((a) =>
    FEATURED_AGENT_IDS.includes(a.id),
  )

  const showcaseItems = DEFAULT_SHOWCASE.slice(0, 3)

  const handleAddToTeam = (agentId: string, agentName: string) => {
    // Check if already added
    const exists = agentInstances.some((i) => i.agentTypeId === agentId)
    if (exists) {
      setViewMode('workspace')
      return
    }
    addAgentInstance({
      id: `inst-${agentId}-${Date.now()}`,
      agentTypeId: agentId,
      name: agentName,
      modelId: DEFAULT_AGENT_TYPES.find((a) => a.id === agentId)?.defaultModelId || 'claude-sonnet-4-6',
      status: 'idle',
      createdAt: new Date(),
    })
    setViewMode('workspace')
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {/* ========== HERO SECTION ========== */}
        <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: '75vh' }}>
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero-bg.png"
              alt="AI Agent Orchestration"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/80" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-4 py-24 max-w-4xl mx-auto">
            {/* Badge */}
            <Badge
              variant="secondary"
              className="mb-8 px-4 py-1.5 text-sm font-medium bg-white/10 text-white/90 border-white/20 backdrop-blur-sm"
            >
              <Zap className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
              AI Multi-Agent Orchestration Platform
            </Badge>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Your 7×24 AI Computer
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed mb-10">
              Deploy Claude Code, Codex, OpenClaw, and more. Cloud-hosted AI agents work
              autonomously 24/7. You rest, they never stop.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button
                size="lg"
                className="h-12 px-8 rounded-full bg-white text-gray-900 font-semibold text-base hover:bg-gray-100 shadow-lg shadow-white/20 transition-all"
                onClick={() => setViewMode('workspace')}
              >
                Start Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 rounded-full border-white/30 text-white font-semibold text-base hover:bg-white/10 transition-all"
                onClick={() => setViewMode('showcase')}
              >
                View Showcase
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 sm:gap-12 md:gap-16 mt-16">
              {[
                { value: '10+', label: 'Agents' },
                { value: '8', label: 'AI Models' },
                { value: '10K+', label: 'Users' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== TRUSTED BY SECTION ========== */}
        <section className="py-14 px-4 border-b border-gray-100">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-8">
              Trusted by 5,000+ teams worldwide
            </p>
            <div className="flex items-center justify-center gap-10 sm:gap-16 flex-wrap">
              {TRUSTED_LOGOS.map((logo) => (
                <span
                  key={logo.name}
                  className={`text-lg sm:text-xl font-bold tracking-tight ${logo.className} opacity-70 hover:opacity-100 transition-opacity`}
                >
                  {logo.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ========== HOW IT WORKS SECTION ========== */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                Get started in 3 steps
              </h2>
              <p className="mt-3 text-muted-foreground text-lg max-w-xl mx-auto">
                From idea to autonomous execution in minutes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STEPS.map((step, index) => {
                const Icon = step.icon
                return (
                  <Card
                    key={step.title}
                    className="group rounded-xl border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 py-0 relative"
                  >
                    {/* Step number */}
                    <div className="absolute -top-3 -left-3 flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 mb-5 transition-transform group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* ========== FEATURED AGENTS SECTION ========== */}
        <section className="py-20 px-4 bg-gray-50/80">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                  Powerful AI Agents
                </h2>
                <p className="mt-3 text-muted-foreground text-lg">
                  Deploy the best AI coding and research agents
                </p>
              </div>
              <Button
                variant="ghost"
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                onClick={() => setViewMode('agents')}
              >
                View All Agents
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredAgents.map((agent) => {
                const colors = PROVIDER_COLORS[agent.provider.toLowerCase()] || PROVIDER_COLORS.teamo
                const alreadyAdded = agentInstances.some((i) => i.agentTypeId === agent.id)

                return (
                  <Card
                    key={agent.id}
                    className="group rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 py-0"
                  >
                    <CardContent className="p-5 flex flex-col h-full">
                      {/* Agent icon + status */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors.icon} text-white shadow-sm`}>
                          <Bot className="h-5 w-5" />
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-semibold uppercase tracking-wide border ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          {agent.status === 'available' ? 'Live' : agent.status}
                        </Badge>
                      </div>

                      {/* Name + Provider */}
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {agent.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        {agent.provider}
                      </p>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
                        {agent.description}
                      </p>

                      {/* Capability badges */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {agent.capabilities.slice(0, 3).map((cap) => (
                          <Badge
                            key={cap}
                            variant="secondary"
                            className={`text-[10px] font-medium border ${CATEGORY_BADGE_COLORS[agent.category] || 'bg-gray-50 text-gray-600 border-gray-200'}`}
                          >
                            {cap}
                          </Badge>
                        ))}
                        {agent.capabilities.length > 3 && (
                          <Badge variant="secondary" className="text-[10px] font-medium bg-gray-50 text-gray-500 border-gray-200">
                            +{agent.capabilities.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Add button */}
                      <Button
                        size="sm"
                        className={`w-full gap-1.5 rounded-lg text-xs font-semibold transition-all ${
                          alreadyAdded
                            ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                        onClick={() => handleAddToTeam(agent.id, agent.name)}
                      >
                        {alreadyAdded ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            In Your Team
                          </>
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5" />
                            Add to Team
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Mobile View All */}
            <div className="flex sm:hidden justify-center mt-8">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setViewMode('agents')}
              >
                View All Agents
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* ========== SHOWCASE PREVIEW ========== */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                  See what AgentHub builds
                </h2>
                <p className="mt-3 text-muted-foreground text-lg">
                  Real projects created by autonomous AI agents
                </p>
              </div>
              <Button
                variant="ghost"
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                onClick={() => setViewMode('showcase')}
              >
                View all showcases
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {showcaseItems.map((item) => (
                <Card
                  key={item.id}
                  className="group rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer py-0"
                  onClick={() => setViewMode('showcase')}
                >
                  <CardContent className="p-0">
                    {/* Placeholder image area */}
                    <div className="relative h-40 rounded-t-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                      <Sparkles className="h-8 w-8 text-slate-300 transition-transform group-hover:scale-110" />
                      <div className="absolute bottom-3 left-3">
                        <Badge variant="secondary" className="text-[10px] font-medium bg-white/90 backdrop-blur-sm text-slate-700 border-0 shadow-sm">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1.5 line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mobile View All */}
            <div className="flex sm:hidden justify-center mt-8">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setViewMode('showcase')}
              >
                View all showcases
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* ========== PRICING TEASER ========== */}
        <section className="py-20 px-4 bg-gray-50/80">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              No API keys to manage. One Credits balance for everything.
            </p>
            <Button
              size="lg"
              className="h-12 px-8 rounded-full bg-gray-900 text-white font-semibold text-base hover:bg-gray-800 shadow-lg transition-all"
              onClick={() => setViewMode('pricing')}
            >
              View pricing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* ========== FOOTER ========== */}
        <footer className="border-t bg-gray-50 py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-600">
                <span className="text-white text-[10px] font-bold">AH</span>
              </div>
              <p className="text-sm text-muted-foreground">
                &copy; 2025 AgentHub. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="hover:text-foreground cursor-pointer transition-colors">
                Privacy
              </span>
              <span className="hover:text-foreground cursor-pointer transition-colors">
                Terms
              </span>
              <span className="hover:text-foreground cursor-pointer transition-colors">
                Contact
              </span>
            </div>
          </div>
        </footer>
      </div>
    </ScrollArea>
  )
}
