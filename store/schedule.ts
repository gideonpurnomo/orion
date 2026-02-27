import { create } from 'zustand'

export interface ScheduleItem {
  id: string
  activityId: string
  scheduledFor: Date
  duration?: number
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'
  notes?: string
  activity?: {
    id: string
    title: string
    description?: string
    difficulty: number
    duration: number
    domain?: {
      id: string
      name: string
      icon?: string
    }
    category?: {
      id: string
      name: string
    }
  }
}

export interface Schedule {
  id: string
  name: string
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  startDate: Date
  endDate?: Date
  items: ScheduleItem[]
}

interface ScheduleState {
  currentSchedule: Schedule | null
  isLoading: boolean
  error: string | null

  // Actions
  setSchedule: (schedule: Schedule | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  addItem: (item: ScheduleItem) => void
  updateItem: (id: string, updates: Partial<ScheduleItem>) => void
  deleteItem: (id: string) => void
  updateItemStatus: (id: string, status: ScheduleItem['status']) => void

  // Derived
  getTodayItems: () => ScheduleItem[]
  getCompletionRate: () => number
  getStreak: () => number
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  currentSchedule: null,
  isLoading: false,
  error: null,

  setSchedule: (schedule) => set({ currentSchedule: schedule }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  addItem: (item) => set((state) => ({
    currentSchedule: state.currentSchedule
      ? {
          ...state.currentSchedule,
          items: [...state.currentSchedule.items, item],
        }
      : null,
  })),

  updateItem: (id, updates) => set((state) => ({
    currentSchedule: state.currentSchedule
      ? {
          ...state.currentSchedule,
          items: state.currentSchedule.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }
      : null,
  })),

  deleteItem: (id) => set((state) => ({
    currentSchedule: state.currentSchedule
      ? {
          ...state.currentSchedule,
          items: state.currentSchedule.items.filter((item) => item.id !== id),
        }
      : null,
  })),

  updateItemStatus: (id, status) => set((state) => ({
    currentSchedule: state.currentSchedule
      ? {
          ...state.currentSchedule,
          items: state.currentSchedule.items.map((item) =>
            item.id === id ? { ...item, status } : item
          ),
        }
      : null,
  })),

  getTodayItems: () => {
    const state = get()
    if (!state.currentSchedule) return []

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return state.currentSchedule.items.filter((item) => {
      const itemDate = new Date(item.scheduledFor)
      itemDate.setHours(0, 0, 0, 0)
      return itemDate.getTime() === today.getTime()
    })
  },

  getCompletionRate: () => {
    const state = get()
    if (!state.currentSchedule) return 0

    // Filter for today's items only
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayItems = state.currentSchedule.items.filter((item) => {
      const itemDate = new Date(item.scheduledFor)
      itemDate.setHours(0, 0, 0, 0)
      return itemDate.getTime() === today.getTime()
    })

    const completed = todayItems.filter(
      (item) => item.status === 'COMPLETED'
    ).length
    const total = todayItems.length

    return total > 0 ? Math.round((completed / total) * 100) : 0
  },

  getStreak: () => {
    // Simplified streak calculation - in production, this would use actual progress data
    const state = get()
    if (!state.currentSchedule) return 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayItems = state.currentSchedule.items.filter((item) => {
      const itemDate = new Date(item.scheduledFor)
      itemDate.setHours(0, 0, 0, 0)
      return itemDate.getTime() === today.getTime() && item.status === 'COMPLETED'
    })

    // This is a placeholder - real streak tracking needs progress history
    return todayItems.length > 0 ? 1 : 0
  },
}))
