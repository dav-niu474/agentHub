'use client'

import {
  CreditCard,
  Check,
  Sparkles,
  Zap,
  HelpCircle,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/lib/utils'

// --- Pricing Card ---
function PricingCard({
  plan,
  highlighted,
}: {
  plan: { id: string; name: string; creditsPerMonth: number; price: number; features: string[]; popular?: boolean }
  highlighted: boolean
}) {
  const isPro = plan.id === 'pro'
  const isFree = plan.price === 0

  return (
    <Card
      className={cn(
        'relative flex flex-col rounded-2xl border py-0 transition-all duration-300',
        highlighted
          ? 'border-2 border-orange-500 shadow-lg shadow-orange-500/10 scale-[1.03] z-10'
          : 'border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1',
      )}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="rounded-full bg-orange-500 px-4 py-1 text-xs font-semibold text-white border-0 shadow-sm">
            <Sparkles className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className={cn('pt-6 pb-0', highlighted ? 'text-left' : 'text-left')}>
        <CardTitle className="text-xl font-bold text-gray-900">{plan.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {plan.creditsPerMonth.toLocaleString()} Credits / month
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 pb-0">
        {/* Price */}
        <div className="mb-6">
          <span className="text-4xl font-bold text-gray-900">
            {isFree ? 'Free' : `$${plan.price}`}
          </span>
          {!isFree && (
            <span className="ml-1 text-base text-muted-foreground">/ month</span>
          )}
        </div>

        {/* Feature list */}
        <ul className="space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm">
              <div
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5',
                  highlighted ? 'bg-orange-100' : 'bg-emerald-100',
                )}
              >
                <Check
                  className={cn(
                    'h-3 w-3',
                    highlighted ? 'text-orange-600' : 'text-emerald-600',
                  )}
                />
              </div>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-6">
        <Button
          className={cn(
            'h-11 w-full rounded-xl text-sm font-semibold transition-all',
            highlighted
              ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/20'
              : 'bg-gray-900 text-white hover:bg-gray-800',
          )}
        >
          {isFree ? 'Get Started Free' : 'Upgrade to Pro'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

// --- Credits Usage Examples ---
const CREDITS_EXAMPLES = [
  { action: 'GPT-5.4 conversation', credits: '~1 credit', note: 'Per message exchange' },
  { action: 'Claude Sonnet 4.6', credits: '~2 credits', note: 'Per message exchange' },
  { action: 'Light research task', credits: '~50 credits', note: 'Quick topic summary' },
  { action: 'Deep research report', credits: '~200 credits', note: 'Full 10k-word analysis' },
  { action: 'Code generation task', credits: '~10 credits', note: 'Small utility / script' },
]

// --- Main Pricing View ---
export default function PricingView() {
  const plans = useAppStore((s) => s.plans)

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1.5">
            <CreditCard className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Simple Pricing</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h1>
          <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto">
            All plans include all 8 models. Unified Credits billing. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3 max-w-4xl mx-auto mb-16">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              highlighted={!!plan.popular}
            />
          ))}
        </div>

        {/* How Credits Work */}
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <HelpCircle className="h-4 w-4 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">How do Credits work?</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Credits are consumed based on the complexity and duration of each AI task. Here are typical
            costs for common operations:
          </p>

          <Card className="rounded-xl border-gray-200 overflow-hidden py-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                  <TableHead className="font-semibold text-gray-900 px-4 py-3">Action</TableHead>
                  <TableHead className="font-semibold text-gray-900 px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      Credits
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 px-4 py-3 hidden sm:table-cell">
                    Note
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CREDITS_EXAMPLES.map((row) => (
                  <TableRow key={row.action} className="hover:bg-gray-50/50">
                    <TableCell className="px-4 py-3 font-medium text-gray-800 text-sm">
                      {row.action}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <Badge
                        variant="secondary"
                        className="rounded-full bg-amber-50 text-amber-700 border-amber-200 font-semibold text-xs"
                      >
                        {row.credits}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      {row.note}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Bottom note */}
          <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">
              Credit costs are estimates and may vary based on task complexity and model selection.
              Unused credits roll over for up to 3 months.
            </p>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
