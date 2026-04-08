'use client'

import { useMemo, useState } from 'react'
import {
  Search,
  Globe,
  Image,
  Mic,
  Headphones,
  Video,
  Code2,
  BarChart3,
  Mail,
  FolderOpen,
  Zap,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { useAppStore, type Skill } from '@/store/app-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

// ==================== Icon Map ====================

const SKILL_ICON_MAP: Record<string, LucideIcon> = {
  search: Search,
  globe: Globe,
  image: Image,
  mic: Mic,
  headphones: Headphones,
  video: Video,
  code: Code2,
  'bar-chart': BarChart3,
  mail: Mail,
  folder: FolderOpen,
}

const CATEGORY_CONFIG: Record<string, { label: string; gradient: string; iconBg: string; iconColor: string }> = {
  'web-search': { label: 'Web & Search', gradient: 'from-sky-500 to-blue-600', iconBg: 'bg-sky-50', iconColor: 'text-sky-600' },
  'image-gen': { label: 'Image', gradient: 'from-pink-500 to-rose-600', iconBg: 'bg-pink-50', iconColor: 'text-pink-600' },
  'tts': { label: 'Voice', gradient: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  'asr': { label: 'Voice', gradient: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  'video-gen': { label: 'Video', gradient: 'from-violet-500 to-purple-600', iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
  'code': { label: 'Code', gradient: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  'data': { label: 'Data', gradient: 'from-cyan-500 to-teal-600', iconBg: 'bg-cyan-50', iconColor: 'text-cyan-600' },
  'communication': { label: 'Communication', gradient: 'from-orange-500 to-red-600', iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
}

const CATEGORY_GROUP_ORDER = ['web-search', 'code', 'data', 'image-gen', 'tts', 'asr', 'video-gen', 'communication']

// ==================== Skill Card ====================

function SkillCard({ skill, onToggle }: { skill: Skill; onToggle: () => void }) {
  const IconComponent = SKILL_ICON_MAP[skill.icon] || Zap
  const config = CATEGORY_CONFIG[skill.category] || CATEGORY_CONFIG['code']

  return (
    <Card className={cn(
      'group relative rounded-xl border bg-white transition-all duration-200 overflow-hidden py-0',
      skill.enabled
        ? 'border-gray-200 shadow-sm hover:shadow-md'
        : 'border-gray-100 opacity-80 hover:opacity-100 hover:shadow-sm',
    )}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Icon */}
          <div className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
            skill.enabled
              ? cn('bg-gradient-to-br text-white shadow-sm', config.gradient)
              : cn('bg-gray-100 text-gray-400'),
          )}>
            <IconComponent className="h-5 w-5" />
          </div>

          {/* Toggle */}
          <Switch
            checked={skill.enabled}
            onCheckedChange={onToggle}
            className="shrink-0"
          />
        </div>

        {/* Name + Description */}
        <div className="mt-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{skill.name}</h3>
          <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">
            {skill.description}
          </p>
        </div>

        {/* Bottom: Category + Provider */}
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary" className={cn(
            'rounded-full text-[10px] font-medium border-0 px-2 py-0',
            skill.enabled
              ? cn(config.iconBg, config.iconColor)
              : 'bg-gray-100 text-gray-500',
          )}>
            {CATEGORY_CONFIG[skill.category]?.label || skill.category}
          </Badge>
          <span className="text-[10px] text-muted-foreground ml-auto">
            {skill.provider}
          </span>
        </div>
      </div>
    </Card>
  )
}

// ==================== Main Component ====================

export default function SkillsView() {
  const { skills, toggleSkill } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')

  // Group skills by category
  const groupedSkills = useMemo(() => {
    let filtered = skills
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = skills.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q),
      )
    }

    const groups: Record<string, Skill[]> = {}
    for (const skill of filtered) {
      if (!groups[skill.category]) groups[skill.category] = []
      groups[skill.category].push(skill)
    }

    // Sort by category order
    const sorted = CATEGORY_GROUP_ORDER.filter((cat) => groups[cat])
    return sorted.map((cat) => ({ category: cat, skills: groups[cat] }))
  }, [skills, searchQuery])

  const enabledCount = skills.filter((s) => s.enabled).length
  const totalCount = skills.length

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Skills
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Configure AI capabilities for your agents
              </p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-emerald-700">
              {enabledCount} active
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-gray-50 border border-gray-200 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-gray-400" />
            <span className="text-xs font-medium text-gray-600">
              {totalCount - enabledCount} inactive
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full pl-9 pr-3 rounded-lg text-sm bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 placeholder:text-gray-400"
          />
        </div>

        {/* Skills by category */}
        <div className="space-y-8">
          {groupedSkills.map((group) => {
            const config = CATEGORY_CONFIG[group.category]
            const enabledInGroup = group.skills.filter((s) => s.enabled).length

            return (
              <div key={group.category}>
                {/* Category header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br text-white text-xs font-bold',
                    config.gradient,
                  )}>
                    <Zap className="h-3.5 w-3.5" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">
                    {config?.label || group.category}
                  </h2>
                  <Badge variant="secondary" className="rounded-full bg-gray-100 text-gray-500 text-[10px] font-medium border-0 px-2 py-0">
                    {enabledInGroup}/{group.skills.length} active
                  </Badge>
                  <Separator className="flex-1 !bg-gray-100" />
                </div>

                {/* Skills grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.skills.map((skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      onToggle={() => {
                        toggleSkill(skill.id)
                        toast.success(skill.enabled ? `${skill.name} disabled` : `${skill.name} enabled`, {
                          description: skill.enabled
                            ? 'Agents will no longer use this skill.'
                            : 'Agents can now use this skill.',
                        })
                      }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty state */}
        {groupedSkills.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No skills found</h3>
            <p className="text-sm text-muted-foreground">
              Try a different search term.
            </p>
          </div>
        )}

        {/* Info footer */}
        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50/50 p-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 mx-auto mb-3">
            <Zap className="h-5 w-5 text-orange-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            How Skills Work
          </h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-4">
            Skills are AI capabilities that your agents can use. Enable skills to give agents
            access to tools like web search, image generation, code execution, and more.
            Agents will automatically use enabled skills based on task requirements.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Web Search', 'Image Gen', 'TTS', 'Code Exec', 'Email'].map((label) => (
              <Badge key={label} variant="secondary" className="rounded-full bg-white text-gray-600 text-xs border border-gray-200 px-3 py-1">
                {label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
