'use client'

import { useState } from 'react'
import {
  Settings,
  Bell,
  Shield,
  Info,
  Trash2,
  Download,
  Moon,
  Globe,
  type LucideIcon,
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

// ---------- Sub-components ----------

interface SettingRowProps {
  icon?: LucideIcon
  title: string
  description?: string
  children: React.ReactNode
}

function SettingRow({ icon: Icon, title, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && <Icon className="size-4 text-gray-400 shrink-0" />}
        <div className="min-w-0">
          <p className="text-sm font-medium leading-none">{title}</p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

// ---------- Main Component ----------

export default function SettingsView() {
  const chatSessions = useAppStore((s) => s.chatSessions)
  const deleteChatSession = useAppStore((s) => s.deleteChatSession)

  // Local UI state (visual only)
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState('en')
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [pushNotifs, setPushNotifs] = useState(true)

  /** Clear all chat history */
  const handleClearHistory = () => {
    chatSessions.forEach((session) => deleteChatSession(session.id))
    toast.success('Chat history cleared', {
      description: 'All chat sessions have been deleted.',
    })
  }

  /** Export data (UI-only) */
  const handleExportData = () => {
    toast.success('Export started', {
      description: 'Your data will be downloaded shortly.',
    })
  }

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-600">
              <Settings className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Settings
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your application preferences
              </p>
            </div>
          </div>
        </div>

        {/* ── General Settings ── */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="size-4 text-gray-500" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <SettingRow
              icon={Moon}
              title="Dark Mode"
              description="Switch between light and dark theme"
            >
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </SettingRow>
            <Separator className="my-1" />
            <SettingRow
              icon={Globe}
              title="Language"
              description="Select your preferred language"
            >
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[140px] h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          </CardContent>
        </Card>

        {/* ── Notifications ── */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="size-4 text-gray-500" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <SettingRow
              icon={Bell}
              title="Email Notifications"
              description="Receive updates via email"
            >
              <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
            </SettingRow>
            <Separator className="my-1" />
            <SettingRow
              icon={Bell}
              title="Push Notifications"
              description="Get push notifications in your browser"
            >
              <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
            </SettingRow>
          </CardContent>
        </Card>

        {/* ── Data & Privacy ── */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="size-4 text-gray-500" />
              Data &amp; Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <SettingRow
              icon={Trash2}
              title="Clear Chat History"
              description="Delete all chat sessions permanently"
            >
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearHistory}
                disabled={chatSessions.length === 0}
              >
                <Trash2 className="size-3.5 mr-1.5" />
                Clear All
              </Button>
            </SettingRow>
            <Separator className="my-1" />
            <SettingRow
              icon={Download}
              title="Export Data"
              description="Download all your data as a file"
            >
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="size-3.5 mr-1.5" />
                Export
              </Button>
            </SettingRow>
          </CardContent>
        </Card>

        {/* ── About ── */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="size-4 text-gray-500" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Version</span>
                <span className="text-sm font-medium">1.0.0</span>
              </div>
              <Separator />
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">AgentHub</strong> — AI Multi-Agent Platform.
                Empowering knowledge workers with intelligent AI agents for content creation,
                data analysis, coding assistance, and more.
              </p>
              <p className="text-sm text-muted-foreground">
                Made with ❤️ by AgentHub Team
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
