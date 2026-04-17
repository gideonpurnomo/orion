export interface ScheduleItem {
  id: string
  activityId?: string
  title?: string
  description?: string
  difficulty?: number
  duration?: number
  tags?: string[]
  status: string
  scheduledFor: string
  domain?: {
    name: string
    icon?: string
  }
  activity?: {
    id: string
    title: string
    duration?: number
    tags?: string[]
    domain?: {
      name: string
      icon?: string
    }
  }
}

export interface Activity {
  id: string
  title: string
  description: string
  difficulty: number
  duration: number
  tags: string[]
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

export interface ClipboardActivity {
  activityId: string
  title: string
  duration: number
  icon?: string
}
