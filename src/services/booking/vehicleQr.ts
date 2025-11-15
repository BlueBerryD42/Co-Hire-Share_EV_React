import axios from 'axios'
import type { VehicleQrCodeResponseDto } from '@/models/bookingExtras'

const http = axios.create({
  baseURL: '/api/vehicle',
})

export const vehicleQrApi = {
  getQrAsDataUrl: async (vehicleId: string) => {
    const { data } = await http.get<VehicleQrCodeResponseDto>(`/${vehicleId}/qr`, {
      params: { format: 'dataUrl' },
    })
    return data
  },
}

export type VehicleQrApi = typeof vehicleQrApi
