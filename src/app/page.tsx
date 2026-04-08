'use client'

import { useInitializeStore } from '@/hooks/use-initialize-store'
import { useAppStore } from '@/store/app-store'
import { Sidebar } from '@/components/agenthub/sidebar'
import { Topbar } from '@/components/agenthub/topbar'
import Marketplace from '@/components/agenthub/marketplace'
import ChatPanel from '@/components/agenthub/chat-panel'
import HistoryView from '@/components/agenthub/history-view'
import FavoritesView from '@/components/agenthub/favorites-view'
import SettingsView from '@/components/agenthub/settings-view'
import ProfileView from '@/components/agenthub/profile-view'
import LandingView from '@/components/agenthub/landing-view'
import MobileDrawer from '@/components/agenthub/mobile-drawer'

export default function Home() {
  useInitializeStore()
  const viewMode = useAppStore((s) => s.viewMode)

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      <MobileDrawer />

      {/* Top Bar */}
      <Topbar />

      {/* Main Content */}
      <main className="h-full pt-[52px] md:pl-[80px]">
        {viewMode === 'landing' && <LandingView />}
        {viewMode === 'chat' && <ChatPanel />}
        {viewMode === 'marketplace' && <Marketplace />}
        {viewMode === 'history' && <HistoryView />}
        {viewMode === 'favorites' && <FavoritesView />}
        {viewMode === 'settings' && <SettingsView />}
        {viewMode === 'profile' && <ProfileView />}
      </main>
    </div>
  )
}
