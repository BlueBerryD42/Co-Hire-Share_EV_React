import { createApiClient } from '@/services/api'
import type { VehicleQrCodeResponseDto } from '@/models/booking'

const http = createApiClient('/api/vehicle')

export const vehicleQrApi = {
  getQrAsDataUrl: async (vehicleId: string) => {
    const { data } = await http.get<VehicleQrCodeResponseDto>(`/${vehicleId}/qr`, {
      params: { format: 'dataUrl' },
    })
    return data
  },
}

export type VehicleQrApi = typeof vehicleQrApi
