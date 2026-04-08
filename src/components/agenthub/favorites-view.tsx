'use client'

import { useMemo } from 'react'
import {
  Heart,
  Star,
  Zap,
  ExternalLink,
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
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/store/app-store'

// --- Category Config (shared pattern from marketplace) ---

const CATEGORY_COLOR_MAP: Record<string, { bg: string; text: string; border: string; light: string }> = {
  marketing: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', light: 'bg-orange-50' },
  research: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', light: 'bg-emerald-50' },
  strategy: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', light: 'bg-violet-50' },
  legal: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', light: 'bg-amber-50' },
  academic: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200', light: 'bg-cyan-50' },
  development: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', light: 'bg-rose-50' },
  writing: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200', light: 'bg-teal-50' },
  design: { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-200', light: 'bg-fuchsia-50' },
}

// --- Icon Map (shared pattern from marketplace) ---

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

// --- Favorite Skill Card ---
function FavoriteSkillCard({ skill }: { skill: import('@/store/app-store').AgentSkill }) {
  const setActiveAgentId = useAppStore((s) => s.setActiveAgentId)
  const setViewMode = useAppStore((s) => s.setViewMode)
  const togglePinApp = useAppStore((s) => s.togglePinApp)
  const colors = CATEGORY_COLOR_MAP[skill.category] || CATEGORY_COLOR_MAP.strategy
  const IconComponent = ICON_MAP[skill.icon] || Sparkles

  const handleOpenChat = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveAgentId(skill.id)
    setViewMode('chat')
  }

  const handleRemoveFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    togglePinApp(skill.id)
  }

  return (
    <Card className="group relative rounded-xl border border-gray-100 bg-white py-0 shadow-sm transition-all duration-300 ease-out hover:shadow-lg hover:shadow-black/[0.08] hover:-translate-y-1 hover:border-gray-200">
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

        {/* Bottom: Rating + Actions */}
        <div className="flex items-center justify-between border-t border-gray-50 pt-3">
          <RatingStars rating={skill.rating} />
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1.5 rounded-lg px-2.5 text-[12px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={handleRemoveFavorite}
            >
              <Heart className="h-3 w-3 fill-current" />
              Remove
            </Button>
            <Button
              size="sm"
              className="h-7 gap-1.5 rounded-lg bg-gray-900 px-3 text-[12px] font-medium text-white hover:bg-gray-800 transition-colors"
              onClick={handleOpenChat}
            >
              <ExternalLink className="h-3 w-3" />
              Open Chat
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// --- Main Favorites View ---
export default function FavoritesView() {
  const { skills, pinnedApps, setViewMode } = useAppStore()

  // Filter skills that are pinned/favorited
  const favoriteSkills = useMemo(() => {
    return skills.filter((skill) => pinnedApps.includes(skill.id))
  }, [skills, pinnedApps])

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Favorites
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Your saved agent skills
            </p>
          </div>

          {/* Favorite count */}
          {favoriteSkills.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{favoriteSkills.length}</span>{' '}
                {favoriteSkills.length === 1 ? 'skill' : 'skills'} saved to favorites
              </p>
            </div>
          )}

          {/* Skills Grid */}
          {favoriteSkills.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {favoriteSkills.map((skill) => (
                <FavoriteSkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Heart className="h-7 w-7 text-gray-400" />
              </div>
              <h3 className="mb-1 text-base font-semibold text-gray-900">
                No favorites yet
              </h3>
              <p className="mb-5 max-w-sm text-center text-sm text-muted-foreground">
                Browse the skills marketplace and pin your favorite agents to access them quickly.
              </p>
              <Button
                onClick={() => setViewMode('marketplace')}
                className="h-9 gap-2 rounded-lg bg-gray-900 px-5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
              >
                <Zap className="h-4 w-4" />
                Explore Skills
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
