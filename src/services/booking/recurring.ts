import axios from 'axios'
import type {
  CreateRecurringBookingDto,
  RecurringBookingDto,
  UpdateRecurringBookingDto,
} from '@/models/bookingExtras'

const http = axios.create({
  baseURL: '/api/booking/recurring',
})

export const recurringBookingsApi = {
  create: async (payload: CreateRecurringBookingDto) => {
    const { data } = await http.post<RecurringBookingDto>('/', payload)
    return data
  },
  get: async (recurringId: string) => {
    const { data } = await http.get<RecurringBookingDto>(`/${recurringId}`)
    return data
  },
  update: async (recurringId: string, payload: UpdateRecurringBookingDto) => {
    const { data } = await http.put<RecurringBookingDto>(`/${recurringId}`, payload)
    return data
  },
  remove: async (recurringId: string) => {
    await http.delete(`/${recurringId}`)
  },
}

export type RecurringBookingsApi = typeof recurringBookingsApi
