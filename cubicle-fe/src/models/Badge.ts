import type { User } from './User'

export interface Badge {
  badge_id: number
  badge_name: string
  description?: string
  date_obtained?: Date
  icon_url?: string
  users?: User[]
}
