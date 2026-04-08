'use client'

import {
  Eye,
  FileText,
  Lightbulb,
  Share2,
  BarChart3,
  GraduationCap,
  Code2,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/store/app-store'

// --- Category gradient + icon config ---
const CATEGORY_CONFIG: Record<
  string,
  {
    gradient: string
    badgeClass: string
    icon: typeof Eye
  }
> = {
  'Deep Research': {
    gradient: 'from-emerald-500/10 via-teal-500/5 to-cyan-500/10',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: FileText,
  },
  'Creative Brainstorming': {
    gradient: 'from-amber-500/10 via-orange-500/5 to-rose-500/10',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Lightbulb,
  },
  'Social Media': {
    gradient: 'from-sky-500/10 via-blue-500/5 to-indigo-500/10',
    badgeClass: 'bg-sky-100 text-sky-700 border-sky-200',
    icon: Share2,
  },
  'Strategy Dashboard': {
    gradient: 'from-violet-500/10 via-purple-500/5 to-fuchsia-500/10',
    badgeClass: 'bg-violet-100 text-violet-700 border-violet-200',
    icon: BarChart3,
  },
  'Research Topic': {
    gradient: 'from-cyan-500/10 via-teal-500/5 to-emerald-500/10',
    badgeClass: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    icon: GraduationCap,
  },
  'Code Generation': {
    gradient: 'from-rose-500/10 via-pink-500/5 to-red-500/10',
    badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
    icon: Code2,
  },
}

// --- Showcase Card ---
function ShowcaseCard({
  item,
}: {
  item: { id: string; title: string; description: string; category: string; tags: string }
}) {
  const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG['Deep Research']
  const IconComp = config.icon
  const tags = item.tags.split(',').map((t) => t.trim())

  return (
    <Card className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-black/[0.06] hover:-translate-y-1 py-0">
      {/* Gradient background strip */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-60 transition-opacity duration-300 group-hover:opacity-100`} />

      <CardContent className="relative p-6 flex flex-col gap-4">
        {/* Top: category badge + icon */}
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={`rounded-full text-[11px] font-semibold border ${config.badgeClass}`}
          >
            {item.category}
          </Badge>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/80 shadow-sm backdrop-blur-sm">
            <IconComp className="h-4.5 w-4.5 text-gray-600" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 leading-snug">{item.title}</h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-white/70 px-2.5 py-0.5 text-[11px] font-medium text-gray-600 backdrop-blur-sm border border-gray-100"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* View Details button */}
        <Button
          variant="ghost"
          className="mt-1 h-9 w-full justify-between rounded-lg border border-gray-200/80 bg-white/60 px-4 text-sm font-medium text-gray-700 backdrop-blur-sm hover:bg-white hover:border-gray-300 hover:text-gray-900 transition-all"
        >
          View Details
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

// --- Main Showcase View ---
export default function ShowcaseView() {
  const showcaseItems = useAppStore((s) => s.showcaseItems)

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Showcase
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Real AI work results from our users
              </p>
            </div>
          </div>
        </div>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {showcaseItems.map((item) => (
            <ShowcaseCard key={item.id} item={item} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50/50 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Have an impressive AI project?
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Share your best AI agent results with the community and get featured in our showcase.
          </p>
          <Button className="h-10 rounded-full bg-gray-900 px-6 font-medium text-white hover:bg-gray-800">
            Submit Your Work
          </Button>
        </div>
      </div>
    </ScrollArea>
  )
}
