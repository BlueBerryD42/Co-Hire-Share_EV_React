import axios from 'axios'
import type {
  CheckInDto,
  CheckInHistoryFilterDto,
  CheckInRecordDetailDto,
  EndTripDto,
  StartTripDto,
} from '@/models/bookingExtras'

const http = axios.create({
  baseURL: '/api/checkin',
})

export const checkInApi = {
  getCheckIn: async (id: string) => {
    const { data } = await http.get<CheckInDto>(`/${id}`)
    return data
  },
  compare: async (id: string) => {
    const { data } = await http.get(`/` + id + '/comparison')
    return data
  },
  filterHistory: async (filter?: CheckInHistoryFilterDto) => {
    const { data } = await http.get<CheckInRecordDetailDto[]>('/', {
      params: filter,
    })
    return data
  },
  exportBookingHistoryPdf: async (bookingId: string) => {
    const response = await http.get<ArrayBuffer>(`/booking/${bookingId}/export/pdf`, {
      responseType: 'arraybuffer',
    })
    return response.data
  },
  startTrip: async (payload: StartTripDto) => {
    const { data } = await http.post<CheckInDto>('/start-trip', payload)
    return data
  },
  endTrip: async (payload: EndTripDto) => {
    const { data } = await http.post('/complete-trip', payload)
    return data
  },
  createCheckIn: async (payload: CheckInDto) => {
    const { data } = await http.post('/', payload)
    return data
  },
  updateCheckIn: async (id: string, payload: Partial<CheckInDto>) => {
    const { data } = await http.put<CheckInDto>(`/${id}`, payload)
    return data
  },
  deleteCheckIn: async (id: string) => {
    await http.delete(`/${id}`)
  },
}

export type CheckInApi = typeof checkInApi
