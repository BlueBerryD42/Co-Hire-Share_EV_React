import axios from 'axios'
import type { DamageReportDto } from '@/models/bookingExtras'

const http = axios.create({
  baseURL: '/api/damage-reports',
})

export const damageReportsApi = {
  getByBooking: async (bookingId: string) => {
    const { data } = await http.get<DamageReportDto[]>(`/by-booking/${bookingId}`)
    return data
  },
  getByVehicle: async (vehicleId: string) => {
    const { data } = await http.get<DamageReportDto[]>(`/by-vehicle/${vehicleId}`)
    return data
  },
  updateStatus: async (reportId: string, payload: { status: string; notes?: string; estimatedCost?: number }) => {
    const { data } = await http.put<DamageReportDto>(`/${reportId}/status`, payload)
    return data
  },
}

export type DamageReportsApi = typeof damageReportsApi
