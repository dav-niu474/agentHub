'use client'

import Image from 'next/image'
import { useAppStore } from '@/store/app-store'
import {
  Zap,
  Users,
  Sparkles,
  MessageSquare,
  Star,
  ArrowRight,
  Megaphone,
  Search,
  Target,
  Scale,
  GraduationCap,
  PenTool,
  Code,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

const ICON_MAP: Record<string, LucideIcon> = {
  megaphone: Megaphone,
  search: Search,
  target: Target,
  scale: Scale,
  graduationcap: GraduationCap,
  pentool: PenTool,
  code: Code,
  barchart3: BarChart3,
}

const CATEGORY_COLORS: Record<string, string> = {
  marketing: 'bg-orange-100 text-orange-700',
  research: 'bg-emerald-100 text-emerald-700',
  strategy: 'bg-violet-100 text-violet-700',
  legal: 'bg-amber-100 text-amber-700',
  academic: 'bg-cyan-100 text-cyan-700',
  development: 'bg-rose-100 text-rose-700',
  writing: 'bg-teal-100 text-teal-700',
  design: 'bg-fuchsia-100 text-fuchsia-700',
}

const FEATURED_SKILLS = [
  'marketing-strategist',
  'code-assistant',
  'academic-writer',
  'business-strategy',
  'data-analyst',
]

const features = [
  {
    icon: Users,
    title: 'Multi-Agent Collaboration',
    description:
      'Work with specialized AI agents that collaborate to solve complex tasks. Each agent brings unique expertise to your workflow.',
    color: 'bg-sky-100 text-sky-600',
  },
  {
    icon: Sparkles,
    title: 'Smart Skill Marketplace',
    description:
      'Choose from 12+ pre-built AI skills covering marketing, research, strategy, legal, and more. Activate what you need instantly.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: MessageSquare,
    title: 'Context-Aware Chat',
    description:
      'AI agents understand the context of your conversations and provide relevant, actionable responses that save you time.',
    color: 'bg-emerald-100 text-emerald-600',
  },
]

const stats = [
  { label: 'AI Agents', value: '12+' },
  { label: 'Active Users', value: '50K+' },
  { label: 'Conversations', value: '1M+' },
]

export default function LandingView() {
  const { skills, setViewMode, setActiveAgentId } = useAppStore()

  const featuredSkills = skills.filter((s) => FEATURED_SKILLS.includes(s.id))

  const handleActivate = (skillId: string) => {
    setActiveAgentId(skillId)
    setViewMode('chat')
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero-bg.png"
              alt="AI Agent Network"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-4 py-20 max-w-4xl mx-auto">
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-1.5 text-sm font-medium bg-white/10 text-white/90 border-white/20 backdrop-blur-sm"
            >
              <Zap className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
              AI-Powered Multi-Agent Platform
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
              Unlock Your{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                AI Agent Team
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed mb-10">
              AgentHub is a multi-agent platform boosting productivity for knowledge
              workers in complex business scenarios like marketing, strategy and all
              kinds of research.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button
                size="lg"
                className="h-12 px-8 rounded-full bg-white text-gray-900 font-semibold text-base hover:bg-gray-100 shadow-lg shadow-white/20 transition-all"
                onClick={() => setViewMode('chat')}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 rounded-full border-white/30 text-white font-semibold text-base hover:bg-white/10 transition-all"
                onClick={() => setViewMode('marketplace')}
              >
                Explore Skills
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <div className="flex items-center justify-center gap-8 md:gap-16 py-8 bg-gradient-to-t from-black/40 to-transparent">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                Why AgentHub?
              </h2>
              <p className="mt-3 text-muted-foreground text-lg max-w-xl mx-auto">
                Everything you need to supercharge your workflow with AI
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="group rounded-xl border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 py-0"
                >
                  <CardContent className="p-6">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} mb-5 transition-transform group-hover:scale-110`}
                    >
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Skills Preview */}
        <section className="py-20 px-4 bg-gray-50/80">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                  Popular Agent Skills
                </h2>
                <p className="mt-3 text-muted-foreground text-lg">
                  Get started with our most popular AI agents
                </p>
              </div>
              <Button
                variant="ghost"
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                onClick={() => setViewMode('marketplace')}
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {featuredSkills.map((skill) => {
                const IconComp = ICON_MAP[skill.icon] || Sparkles
                const colorClass =
                  CATEGORY_COLORS[skill.category] || 'bg-gray-100 text-gray-700'

                return (
                  <Card
                    key={skill.id}
                    className="group flex-shrink-0 w-64 rounded-xl border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer py-0"
                    onClick={() => handleActivate(skill.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass} transition-transform group-hover:scale-110`}
                        >
                          <IconComp className="h-5 w-5" />
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-medium capitalize ${colorClass} border-0`}
                        >
                          {skill.category}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
                        {skill.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                        {skill.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= Math.floor(skill.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-[11px] text-muted-foreground">
                            {skill.rating}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[11px] font-medium bg-gray-900 text-white border-0 hover:bg-gray-800"
                        >
                          Activate
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Mobile View All */}
            <div className="flex sm:hidden justify-center mt-6">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setViewMode('marketplace')}
              >
                View All Skills
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Ready to boost your productivity?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of knowledge workers who use AgentHub to streamline
              their workflow with AI-powered multi-agent collaboration.
            </p>
            <Button
              size="lg"
              className="h-12 px-8 rounded-full bg-gray-900 text-white font-semibold text-base hover:bg-gray-800 shadow-lg transition-all"
              onClick={() => setViewMode('chat')}
            >
              Start Chatting
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-gray-50 py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2025 AgentHub. All rights reserved.
            </p>
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
