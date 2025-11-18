import type { ISODate, UUID } from '@/models/booking'

export interface GroupMessageDto {
  id: UUID
  groupId: UUID
  userId: UUID
  userName: string
  message: string
  type: 'Chat' | 'System' | 'Announcement'
  priority?: 'Normal' | 'High' | 'Low'
  createdAt: ISODate
  readAt?: ISODate | null
}

export interface MessageRequestFilters {
  groupId?: UUID
  type?: string
  limit?: number
  offset?: number
}

export interface SendGroupMessageDto {
  groupId: UUID
  message: string
  type?: string
}



