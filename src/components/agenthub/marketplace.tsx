'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Megaphone,
  Search,
  Target,
  Scale,
  GraduationCap,
  PenTool,
  Code,
  BarChart3,
  Globe,
  DollarSign,
  Palette,
  Kanban,
  Star,
  Zap,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore, type AgentSkill } from '@/store/app-store'

// --- Category Config ---

const CATEGORIES = [
  'All',
  'Marketing',
  'Research',
  'Strategy',
  'Legal',
  'Academic',
  'Development',
  'Writing',
  'Design',
] as const

type Category = (typeof CATEGORIES)[number]

const CATEGORY_COLOR_MAP: Record<string, { bg: string; text: string; border: string; light: string }> = {
  marketing: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-200',
    light: 'bg-orange-50',
  },
  research: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    light: 'bg-emerald-50',
  },
  strategy: {
    bg: 'bg-violet-100',
    text: 'text-violet-700',
    border: 'border-violet-200',
    light: 'bg-violet-50',
  },
  legal: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    light: 'bg-amber-50',
  },
  academic: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    light: 'bg-cyan-50',
  },
  development: {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    border: 'border-rose-200',
    light: 'bg-rose-50',
  },
  writing: {
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    border: 'border-teal-200',
    light: 'bg-teal-50',
  },
  design: {
    bg: 'bg-fuchsia-100',
    text: 'text-fuchsia-700',
    border: 'border-fuchsia-200',
    light: 'bg-fuchsia-50',
  },
}

// --- Icon Map ---

const ICON_MAP: Record<string, LucideIcon> = {
  megaphone: Megaphone,
  search: Search,
  target: Target,
  scale: Scale,
  graduationcap: GraduationCap,
  pentool: PenTool,
  code: Code,
  barchart3: BarChart3,
  globe: Globe,
  dollarsign: DollarSign,
  palette: Palette,
  kanban: Kanban,
}

// --- Pre-defined Skills ---

const BUILT_IN_SKILLS: AgentSkill[] = [
  {
    id: 'marketing-strategist',
    name: 'Marketing Strategist',
    description: 'Create comprehensive marketing plans, campaigns, and growth strategies tailored to your business goals and target audience.',
    icon: 'megaphone',
    category: 'marketing',
    prompt: 'You are an expert marketing strategist. Help users create comprehensive marketing plans, campaigns, and growth strategies.',
    isBuiltIn: true,
    usageCount: 12580,
    rating: 4.8,
    tags: 'marketing, strategy, growth, campaign',
  },
  {
    id: 'market-researcher',
    name: 'Market Researcher',
    description: 'Analyze market trends, competitive landscapes, and consumer behavior to provide actionable business intelligence.',
    icon: 'search',
    category: 'research',
    prompt: 'You are an expert market researcher. Analyze market trends, competitors, and consumer behavior to provide actionable insights.',
    isBuiltIn: true,
    usageCount: 9843,
    rating: 4.7,
    tags: 'research, market analysis, competition, trends',
  },
  {
    id: 'business-strategy',
    name: 'Business Strategy',
    description: 'Strategic planning and business analysis to help you make informed decisions and drive organizational growth.',
    icon: 'target',
    category: 'strategy',
    prompt: 'You are an expert business strategist. Provide strategic planning, business analysis, and decision-making frameworks.',
    isBuiltIn: true,
    usageCount: 8721,
    rating: 4.9,
    tags: 'strategy, planning, business, analysis',
  },
  {
    id: 'legal-analyst',
    name: 'Legal Analyst',
    description: 'Legal research and document analysis to help you understand regulations, contracts, and compliance requirements.',
    icon: 'scale',
    category: 'legal',
    prompt: 'You are an expert legal analyst. Assist with legal research, document analysis, and regulatory compliance guidance.',
    isBuiltIn: true,
    usageCount: 6450,
    rating: 4.6,
    tags: 'legal, research, compliance, documents',
  },
  {
    id: 'academic-writer',
    name: 'Academic Writer',
    description: 'Research papers, academic content, literature reviews, and scholarly writing assistance with proper citations.',
    icon: 'graduationcap',
    category: 'academic',
    prompt: 'You are an expert academic writer. Help with research papers, academic content, and scholarly writing with proper citations.',
    isBuiltIn: true,
    usageCount: 11230,
    rating: 4.8,
    tags: 'academic, research, writing, papers',
  },
  {
    id: 'content-creator',
    name: 'Content Creator',
    description: 'Blog posts, articles, social media content, and creative writing that engages your audience and drives traffic.',
    icon: 'pentool',
    category: 'writing',
    prompt: 'You are an expert content creator. Help users write engaging blog posts, articles, social media content, and creative writing.',
    isBuiltIn: true,
    usageCount: 15640,
    rating: 4.7,
    tags: 'content, writing, blog, social media',
  },
  {
    id: 'code-assistant',
    name: 'Code Assistant',
    description: 'Programming help, code review, debugging, and software development guidance across multiple languages and frameworks.',
    icon: 'code',
    category: 'development',
    prompt: 'You are an expert code assistant. Help with programming, code review, debugging, and software development guidance.',
    isBuiltIn: true,
    usageCount: 21450,
    rating: 4.9,
    tags: 'code, programming, development, debugging',
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Data analysis, visualization, statistical modeling, and insights extraction from complex datasets.',
    icon: 'barchart3',
    category: 'research',
    prompt: 'You are an expert data analyst. Help with data analysis, visualization, statistical modeling, and insights extraction.',
    isBuiltIn: true,
    usageCount: 10890,
    rating: 4.7,
    tags: 'data, analysis, visualization, statistics',
  },
  {
    id: 'seo-optimizer',
    name: 'SEO Optimizer',
    description: 'SEO analysis, keyword research, on-page optimization, and strategies to improve your search engine rankings.',
    icon: 'globe',
    category: 'marketing',
    prompt: 'You are an expert SEO optimizer. Help with SEO analysis, keyword research, on-page optimization, and ranking strategies.',
    isBuiltIn: true,
    usageCount: 7890,
    rating: 4.6,
    tags: 'seo, optimization, keywords, ranking',
  },
  {
    id: 'financial-analyst',
    name: 'Financial Analyst',
    description: 'Financial modeling, investment analysis, budgeting, and comprehensive financial planning for businesses and individuals.',
    icon: 'dollarsign',
    category: 'strategy',
    prompt: 'You are an expert financial analyst. Help with financial modeling, investment analysis, budgeting, and financial planning.',
    isBuiltIn: true,
    usageCount: 9320,
    rating: 4.8,
    tags: 'finance, analysis, modeling, investment',
  },
  {
    id: 'ux-designer',
    name: 'UX Designer',
    description: 'User experience research, interface design, usability testing, and creating intuitive digital product experiences.',
    icon: 'palette',
    category: 'design',
    prompt: 'You are an expert UX designer. Help with user experience research, interface design, usability, and creating intuitive experiences.',
    isBuiltIn: true,
    usageCount: 8150,
    rating: 4.7,
    tags: 'ux, design, interface, usability',
  },
  {
    id: 'project-manager',
    name: 'Project Manager',
    description: 'Project planning, task management, timeline optimization, and team coordination for successful project delivery.',
    icon: 'kanban',
    category: 'strategy',
    prompt: 'You are an expert project manager. Help with project planning, task management, timeline optimization, and team coordination.',
    isBuiltIn: true,
    usageCount: 13670,
    rating: 4.8,
    tags: 'project, management, planning, timeline',
  },
]

// --- Helper: Format usage count ---
function formatUsageCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

// --- Rating Stars ---
function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : star <= rating
                ? 'fill-amber-400/50 text-amber-400'
                : 'text-gray-200'
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground font-medium">{rating}</span>
    </div>
  )
}

// --- Skill Card ---
function SkillCard({ skill }: { skill: AgentSkill }) {
  const setActiveAgentId = useAppStore((s) => s.setActiveAgentId)
  const setViewMode = useAppStore((s) => s.setViewMode)
  const colors = CATEGORY_COLOR_MAP[skill.category] || CATEGORY_COLOR_MAP.strategy
  const IconComponent = ICON_MAP[skill.icon] || Sparkles

  const handleActivate = () => {
    setActiveAgentId(skill.id)
    setViewMode('chat')
  }

  return (
    <Card
      className="group relative cursor-pointer rounded-xl border border-gray-100 bg-white py-0 shadow-sm transition-all duration-300 ease-out hover:shadow-lg hover:shadow-black/[0.08] hover:-translate-y-1 hover:border-gray-200"
      onClick={handleActivate}
    >
      <CardContent className="p-5 pb-4">
        {/* Icon + Category Badge */}
        <div className="relative mb-4 flex items-start justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} transition-transform duration-300 group-hover:scale-110`}
          >
            <IconComponent className={`h-6 w-6 ${colors.text}`} strokeWidth={1.8} />
          </div>
          <Badge
            variant="secondary"
            className={`rounded-full border ${colors.light} ${colors.text} text-[11px] font-medium capitalize`}
          >
            {skill.category}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="mb-1.5 text-[15px] font-semibold leading-snug text-gray-900">
          {skill.name}
        </h3>

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
          {skill.description}
        </p>

        {/* Bottom: Rating + Usage + Activate */}
        <div className="flex items-center justify-between border-t border-gray-50 pt-3">
          <div className="flex items-center gap-3">
            <RatingStars rating={skill.rating} />
            <span className="text-[11px] text-muted-foreground">
              {formatUsageCount(skill.usageCount)} uses
            </span>
          </div>
          <Button
            size="sm"
            className="h-7 gap-1.5 rounded-lg bg-gray-900 px-3 text-[12px] font-medium text-white hover:bg-gray-800"
            onClick={(e) => {
              e.stopPropagation()
              handleActivate()
            }}
          >
            <Zap className="h-3 w-3" />
            Activate
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// --- Skeleton Card ---
function SkillCardSkeleton() {
  return (
    <Card className="rounded-xl border border-gray-100 py-0">
      <CardContent className="p-5 pb-4">
        <div className="relative mb-4 flex items-start justify-between">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="mb-1.5 h-4 w-32" />
        <Skeleton className="mb-4 h-3 w-full" />
        <Skeleton className="mb-2 h-3 w-24" />
        <div className="flex items-center justify-between border-t border-gray-50 pt-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

// --- Main Marketplace Component ---
export default function Marketplace() {
  const { selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, setSkills, skills } =
    useAppStore()
  const [isLoading, setIsLoading] = useState(true)

  // Load built-in skills into store on mount
  useEffect(() => {
    // Only set if skills are empty (avoid overwriting API-fetched skills later)
    if (skills.length === 0) {
      setSkills(BUILT_IN_SKILLS)
    }
    // Simulate brief loading state for polish
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [skills.length, setSkills])

  // Filter skills based on search query and selected category
  const filteredSkills = useMemo(() => {
    const source = skills.length > 0 ? skills : BUILT_IN_SKILLS
    return source.filter((skill) => {
      const matchesCategory =
        selectedCategory === 'All' || skill.category === selectedCategory.toLowerCase()
      const matchesSearch =
        searchQuery.trim() === '' ||
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.tags.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [skills, selectedCategory, searchQuery])

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Skills Marketplace
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Discover and activate powerful AI agents for your workflow
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search skills, agents, or capabilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 rounded-xl border-gray-200 bg-gray-50 pl-10 text-sm transition-colors focus:bg-white focus:border-gray-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="mb-8 -mx-1">
            <div className="flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
              {CATEGORIES.map((category) => {
                const isActive = selectedCategory === category
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    {category}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filteredSkills.length}</span>{' '}
              {filteredSkills.length === 1 ? 'skill' : 'skills'} found
              {selectedCategory !== 'All' && (
                <span>
                  {' '}
                  in <span className="capitalize font-medium text-foreground">{selectedCategory}</span>
                </span>
              )}
              {searchQuery && (
                <span>
                  {' '}
                  for &ldquo;<span className="font-medium text-foreground">{searchQuery}</span>&rdquo;
                </span>
              )}
            </p>
          </div>

          {/* Skills Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkillCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredSkills.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSkills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-7 w-7 text-gray-400" />
              </div>
              <h3 className="mb-1 text-base font-semibold text-gray-900">No skills found</h3>
              <p className="mb-4 max-w-sm text-center text-sm text-muted-foreground">
                Try adjusting your search query or selecting a different category to discover more skills.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('All')
                }}
                className="rounded-lg"
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
