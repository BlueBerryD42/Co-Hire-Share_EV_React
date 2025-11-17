import { createApiClient } from '@/services/api'
import type {
  BookingNotificationPreferenceDto,
  UpdateBookingNotificationPreferenceDto,
} from '@/models/booking'

const http = createApiClient('/api/booking/notification-preferences')

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
