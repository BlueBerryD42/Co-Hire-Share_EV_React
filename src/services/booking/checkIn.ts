import { createApiClient } from '@/services/api'
import type { CheckInDto, EndTripDto, StartTripDto } from '@/models/booking'

const http = createApiClient('/api/CheckIn')

export const checkInApi = {
  startTrip: async (payload: StartTripDto) => {
    const { data } = await http.post<CheckInDto>('/start', payload)
    return data
  },
  endTrip: async (payload: EndTripDto) => {
    const { data } = await http.post<CheckInDto>('/end', payload)
    return data
  },
  getHistory: async (bookingId: string) => {
    const { data } = await http.get<CheckInDto[]>(`/history/${bookingId}`)
    return data
  },
}

export type CheckInApi = typeof checkInApi
