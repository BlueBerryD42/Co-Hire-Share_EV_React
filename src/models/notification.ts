import type { ISODate, UUID } from '@/models/booking'

export interface NotificationDto {
  id: UUID
  userId: UUID
  groupId?: UUID | null
  groupName?: string
  title: string
  message: string
  type: string
  priority: string
  status: string
  createdAt: ISODate
  readAt?: ISODate | null
  scheduledFor: ISODate
  actionUrl?: string | null
  actionText?: string | null
}

export interface CreateNotificationDto {
  userId: UUID
  groupId?: UUID
  title: string
  message: string
  type?: string
  priority?: 'Normal' | 'High' | 'Low'
  actionUrl?: string
  actionText?: string
}

export interface CreateBulkNotificationDto {
  userIds: UUID[]
  groupId?: UUID
  title: string
  message: string
  type?: string
  priority?: 'Normal' | 'High' | 'Low'
  actionUrl?: string
  actionText?: string
}

export interface NotificationRequestDto {
  userId?: UUID
  groupId?: UUID
  type?: string
  priority?: string
  status?: string
  startDate?: ISODate
  endDate?: ISODate
  limit?: number
  offset?: number
}




