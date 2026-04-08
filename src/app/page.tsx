'use client'

import { useInitializeStore } from '@/hooks/use-initialize-store'
import { useAppStore } from '@/store/app-store'
import { Sidebar } from '@/components/agenthub/sidebar'
import { Topbar } from '@/components/agenthub/topbar'
import MobileDrawer from '@/components/agenthub/mobile-drawer'
import LandingView from '@/components/agenthub/landing-view'
import UnifiedWorkspace from '@/components/agenthub/unified-workspace'
import AgentChatWorkspace from '@/components/agenthub/agent-chat'
import AgentStore from '@/components/agenthub/agent-store'
import TasksView from '@/components/agenthub/tasks-view'
import ShowcaseView from '@/components/agenthub/showcase-view'
import PricingView from '@/components/agenthub/pricing-view'
import SettingsView from '@/components/agenthub/settings-view'

export default function Home() {
  useInitializeStore()
  const viewMode = useAppStore((s) => s.viewMode)

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <Sidebar />
      <MobileDrawer />
      <Topbar />

      <main className="h-full pt-[52px] md:pl-[80px]">
        {viewMode === 'landing' && <LandingView />}
        {viewMode === 'workspace' && <UnifiedWorkspace />}
        {viewMode === 'agents' && <AgentStore />}
        {viewMode === 'agent-chat' && <AgentChatWorkspace />}
        {viewMode === 'tasks' && <TasksView />}
        {viewMode === 'showcase' && <ShowcaseView />}
        {viewMode === 'pricing' && <PricingView />}
        {viewMode === 'settings' && <SettingsView />}
      </main>
    </div>
  )
}
