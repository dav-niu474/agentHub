'use client'

import {
  User,
  Mail,
  Calendar,
  Coins,
  Crown,
  Edit2,
  MessageSquare,
  Zap,
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

// ---------- Sub-components ----------

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  description?: string
}

function StatCard({ icon, label, value, description }: StatCardProps) {
  return (
    <Card className="flex-1 min-w-0">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight text-gray-900">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        {description && (
          <p className="text-[11px] text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

// ---------- Main Component ----------

export default function ProfileView() {
  const userName = useAppStore((s) => s.userName)
  const userCredits = useAppStore((s) => s.userCredits)
  const chatSessions = useAppStore((s) => s.chatSessions)
  const skills = useAppStore((s) => s.skills)

  // Derive user initials
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* ── Profile Header Card ── */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Large avatar */}
              <Avatar className="size-24 shrink-0 ring-4 ring-orange-100">
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* User info */}
              <div className="flex-1 text-center sm:text-left min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  {userName}
                </h1>

                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    alex@example.com
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    January 2025
                  </span>
                </div>

                {/* Plan badge */}
                <div className="mt-3 flex items-center gap-2 justify-center sm:justify-start">
                  <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 border-0 font-semibold px-2.5 py-0.5">
                    <Crown className="size-3 mr-1" />
                    Free Plan
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-7 text-xs font-medium"
                    onClick={() =>
                      toast.info('Upgrade coming soon', {
                        description: 'Pro plan will be available shortly.',
                      })
                    }
                  >
                    Upgrade
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={<MessageSquare className="size-4" />}
            label="Total Chats"
            value={chatSessions.length}
            description="All-time conversations"
          />
          <StatCard
            icon={<Coins className="size-4" />}
            label="Credits Remaining"
            value={userCredits}
            description="Available for AI usage"
          />
          <StatCard
            icon={<Zap className="size-4" />}
            label="Active Skills"
            value={skills.length}
            description="Activated AI agents"
          />
        </div>

        {/* ── Quick Actions Card ── */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() =>
                  toast.info('Edit profile', {
                    description: 'Profile editing will be available soon.',
                  })
                }
              >
                <Edit2 className="size-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0"
                onClick={() =>
                  toast.info('Upgrade coming soon', {
                    description: 'Pro plan with unlimited features.',
                  })
                }
              >
                <Crown className="size-4 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Account Details Card ── */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="displayName" className="text-sm">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  defaultValue={userName}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email" className="text-sm">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="alex@example.com"
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
