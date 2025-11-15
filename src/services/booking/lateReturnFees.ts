import axios from 'axios'
import type { LateReturnFeeDto } from '@/models/bookingExtras'

const http = axios.create({
  baseURL: '/api/late-return-fees',
})

export const lateReturnFeesApi = {
  getByBooking: async (bookingId: string) => {
    const { data } = await http.get<LateReturnFeeDto[]>(`/by-booking/${bookingId}`)
    return data
  },
  getHistory: async (take?: number) => {
    const { data } = await http.get<LateReturnFeeDto[]>('/history', {
      params: take ? { take } : undefined,
    })
    return data
  },
  waiveFee: async (feeId: string, reason?: string) => {
    const { data } = await http.post<LateReturnFeeDto>(`/${feeId}/waive`, { reason })
    return data
  },
}

export type LateReturnFeesApi = typeof lateReturnFeesApi
