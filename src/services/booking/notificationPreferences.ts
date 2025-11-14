import axios from 'axios'
import type {
  BookingNotificationPreferenceDto,
  UpdateBookingNotificationPreferenceDto,
} from '@/models/booking'

const http = axios.create({
  baseURL: '/api/booking/notification-preferences',
})

export const notificationPreferencesApi = {
  getPreferences: async () => {
    const { data } = await http.get<BookingNotificationPreferenceDto>('/')
    return data
  },
  updatePreferences: async (payload: UpdateBookingNotificationPreferenceDto) => {
    const { data } = await http.put<BookingNotificationPreferenceDto>('/', payload)
    return data
  },
}

export type NotificationPreferencesApi = typeof notificationPreferencesApi
