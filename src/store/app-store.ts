import { create } from 'zustand'

export type ViewMode = 'landing' | 'chat' | 'marketplace' | 'history' | 'favorites' | 'profile' | 'settings'

export interface AgentSkill {
  id: string
  name: string
  description: string
  icon: string
  category: string
  prompt: string
  isBuiltIn: boolean
  usageCount: number
  rating: number
  tags: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  agentId?: string
  agentName?: string
  createdAt: Date
}

export interface ChatSession {
  id: string
  title: string
  agentId?: string
  createdAt: Date
  updatedAt: Date
  messages: ChatMessage[]
}

interface AppState {
  // Navigation
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void

  // Sidebar pinned apps
  pinnedApps: string[]
  togglePinApp: (skillId: string) => void

  // Current chat
  currentChatId: string | null
  setCurrentChatId: (id: string | null) => void
  chatSessions: ChatSession[]
  addChatSession: (session: ChatSession) => void
  updateChatSession: (id: string, updates: Partial<ChatSession>) => void
  deleteChatSession: (id: string) => void

  // Skills
  skills: AgentSkill[]
  setSkills: (skills: AgentSkill[]) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Chat messages
  isChatLoading: boolean
  setIsChatLoading: (loading: boolean) => void
  addMessage: (chatId: string, message: ChatMessage) => void

  // Active agent for chat
  activeAgentId: string | null
  setActiveAgentId: (id: string | null) => void

  // User
  userCredits: number
  setUserCredits: (credits: number) => void
  userName: string
  setUserName: (name: string) => void
  userAvatar: string
  setUserAvatar: (avatar: string) => void

  // UI
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  viewMode: 'landing',
  setViewMode: (mode) => set({ viewMode: mode }),

  // Sidebar pinned apps
  pinnedApps: [],
  togglePinApp: (skillId) => {
    const { pinnedApps } = get()
    if (pinnedApps.includes(skillId)) {
      set({ pinnedApps: pinnedApps.filter(id => id !== skillId) })
    } else {
      set({ pinnedApps: [...pinnedApps, skillId] })
    }
  },

  // Current chat
  currentChatId: null,
  setCurrentChatId: (id) => set({ currentChatId: id }),
  chatSessions: [],
  addChatSession: (session) => set((state) => ({ chatSessions: [session, ...state.chatSessions] })),
  updateChatSession: (id, updates) => set((state) => ({
    chatSessions: state.chatSessions.map(s => s.id === id ? { ...s, ...updates } : s)
  })),
  deleteChatSession: (id) => set((state) => ({
    chatSessions: state.chatSessions.filter(s => s.id !== id),
    currentChatId: state.currentChatId === id ? null : state.currentChatId
  })),

  // Skills
  skills: [],
  setSkills: (skills) => set({ skills }),
  selectedCategory: 'all',
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Chat
  isChatLoading: false,
  setIsChatLoading: (loading) => set({ isChatLoading: loading }),
  addMessage: (chatId, message) => set((state) => ({
    chatSessions: state.chatSessions.map(s =>
      s.id === chatId ? { ...s, messages: [...s.messages, message], updatedAt: new Date() } : s
    )
  })),

  // Active agent
  activeAgentId: null,
  setActiveAgentId: (id) => set({ activeAgentId: id }),

  // User
  userCredits: 100,
  setUserCredits: (credits) => set({ userCredits: credits }),
  userName: 'Alex Chen',
  setUserName: (name) => set({ userName: name }),
  userAvatar: '',
  setUserAvatar: (avatar) => set({ userAvatar: avatar }),

  // UI
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}))
