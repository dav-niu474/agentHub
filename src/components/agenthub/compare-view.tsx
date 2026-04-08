'use client'

import {
  GitCompareArrows,
  Check,
  X,
  Minus,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// --- Comparison data ---
interface ComparisonRow {
  feature: string
  openclaw: string | React.ReactNode
  kimiClaw: string | React.ReactNode
  agenthub: string | React.ReactNode
}

function CellValue({ value }: { value: string | React.ReactNode }) {
  if (value === 'Yes' || value === 'SOTA-level') {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-sm">
        <Check className="h-4 w-4" />
        {value}
      </span>
    )
  }
  if (value === 'No') {
    return (
      <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
        <X className="h-4 w-4" />
        {value}
      </span>
    )
  }
  if (value === 'Basic' || value === 'Limited') {
    return (
      <span className="inline-flex items-center gap-1 text-amber-500 font-medium text-sm">
        <Minus className="h-4 w-4" />
        {value}
      </span>
    )
  }
  return <span className="text-sm text-gray-700">{value}</span>
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: 'Deployment',
    openclaw: 'Self-hosted',
    kimiClaw: 'Self-hosted',
    agenthub: <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-sm"><Check className="h-4 w-4" />Fully managed cloud</span>,
  },
  {
    feature: 'API Key required',
    openclaw: 'Yes (BYO)',
    kimiClaw: 'Yes',
    agenthub: <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-sm"><Check className="h-4 w-4" />No (built-in)</span>,
  },
  {
    feature: 'Built-in models',
    openclaw: '0 (BYO)',
    kimiClaw: 'Limited',
    agenthub: <Badge variant="secondary" className="rounded-full bg-emerald-100 text-emerald-700 border-emerald-200 text-xs font-semibold">8 pre-installed</Badge>,
  },
  {
    feature: 'Deep research',
    openclaw: 'No',
    kimiClaw: 'Basic',
    agenthub: <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-sm"><Check className="h-4 w-4" />SOTA-level</span>,
  },
  {
    feature: 'Task visibility',
    openclaw: 'Limited',
    kimiClaw: 'Limited',
    agenthub: <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-sm"><Check className="h-4 w-4" />Full task tree</span>,
  },
  {
    feature: '24/7 autonomous',
    openclaw: 'Self-maintain',
    kimiClaw: 'No',
    agenthub: <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-sm"><Check className="h-4 w-4" />Yes</span>,
  },
  {
    feature: 'Team collaboration',
    openclaw: 'No',
    kimiClaw: 'No',
    agenthub: <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-sm"><Check className="h-4 w-4" />Yes</span>,
  },
  {
    feature: 'Starting price',
    openclaw: 'Free + API costs',
    kimiClaw: '$39/mo',
    agenthub: <Badge variant="secondary" className="rounded-full bg-emerald-100 text-emerald-700 border-emerald-200 text-xs font-semibold">Free (limited)</Badge>,
  },
]

// --- Main Compare View ---
export default function CompareView() {
  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 shadow-sm">
              <GitCompareArrows className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Compare AI Agent Platforms
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                See how AgentHub stacks up against the competition
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <Card className="rounded-2xl border-gray-200 overflow-hidden py-0">
          <CardContent className="p-0">
            {/* Column headers */}
            <div className="grid grid-cols-4 gap-0 border-b border-gray-200 bg-gray-50/80">
              {/* Feature column header */}
              <div className="px-4 sm:px-6 py-4">
                <span className="text-sm font-semibold text-gray-500">Feature</span>
              </div>
              {/* OpenClaw */}
              <div className="px-4 py-4 text-center border-l border-gray-100">
                <span className="text-sm font-bold text-gray-700">OpenClaw</span>
              </div>
              {/* Kimi Claw */}
              <div className="px-4 py-4 text-center border-l border-gray-100">
                <span className="text-sm font-bold text-gray-700">Kimi Claw</span>
              </div>
              {/* AgentHub - highlighted */}
              <div className={cn(
                'px-4 py-4 text-center border-l border-orange-200 bg-orange-50/50',
              )}>
                <Badge className="rounded-full bg-gray-900 text-white border-0 text-xs font-semibold px-3">
                  AgentHub
                </Badge>
              </div>
            </div>

            {/* Data rows */}
            {COMPARISON_ROWS.map((row, index) => (
              <div
                key={row.feature}
                className={cn(
                  'grid grid-cols-4 gap-0 transition-colors hover:bg-gray-50/50',
                  index < COMPARISON_ROWS.length - 1 && 'border-b border-gray-100',
                )}
              >
                {/* Feature name */}
                <div className="px-4 sm:px-6 py-4 flex items-center">
                  <span className="text-sm font-medium text-gray-900">{row.feature}</span>
                </div>
                {/* OpenClaw value */}
                <div className="px-4 py-4 flex items-center justify-center border-l border-gray-100">
                  <CellValue value={row.openclaw} />
                </div>
                {/* Kimi Claw value */}
                <div className="px-4 py-4 flex items-center justify-center border-l border-gray-100">
                  <CellValue value={row.kimiClaw} />
                </div>
                {/* AgentHub value - highlighted */}
                <div className="px-4 py-4 flex items-center justify-center border-l border-orange-200 bg-orange-50/30">
                  {row.agenthub}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="mt-10 rounded-xl border border-gray-200 bg-gray-50/50 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ready to try AgentHub?
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Start for free with 1,000 credits. No API keys required, no setup needed.
            Just sign up and start building with AI agents.
          </p>
          <Button className="h-10 rounded-full bg-gray-900 px-6 font-medium text-white hover:bg-gray-800">
            Get Started Free
          </Button>
        </div>
      </div>
    </ScrollArea>
  )
}
