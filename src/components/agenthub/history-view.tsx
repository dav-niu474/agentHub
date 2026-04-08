'use client'

import { Clock, ArrowRight, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/app-store'

// ---------- Main Component ----------

export default function HistoryView() {
  const setViewMode = useAppStore((s) => s.setViewMode)

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="mx-auto max-w-4xl w-full px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Task History
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Past tasks and results from your agent teams
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-24">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Inbox className="h-7 w-7 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            No tasks yet
          </h3>
          <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground leading-relaxed">
            Deploy your first agent team and watch them work.
          </p>
          <Button
            onClick={() => setViewMode('workspace')}
            className="h-10 gap-2 rounded-lg bg-gray-900 px-5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Go to Workspace
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
