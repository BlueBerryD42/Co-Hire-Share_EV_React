import axios from 'axios'
import type {
  CreateBulkNotificationDto,
  CreateNotificationDto,
  NotificationDto,
  NotificationRequestDto,
} from '@/models/notification'

const http = axios.create({
  baseURL: '/api/notification',
})

export const notificationApi = {
  async create(payload: CreateNotificationDto) {
    const { data } = await http.post<NotificationDto>('/', payload)
    return data
  },

  async createBulk(payload: CreateBulkNotificationDto) {
    const { data } = await http.post<NotificationDto[]>('/bulk', payload)
    return data
  },

  async getMine(filters: NotificationRequestDto = {}) {
    const { data } = await http.get<NotificationDto[]>('/my', {
      params: filters,
    })
    return data
  },

  async markAsRead(notificationId: string) {
    const { data } = await http.put<NotificationDto>(`/${notificationId}/read`)
    return data
  },
}

export type NotificationApi = typeof notificationApi


