import axios from 'axios'
import type {
  BookingTemplateResponse,
  CreateBookingFromTemplateRequest,
  CreateBookingTemplateRequest,
  UpdateBookingTemplateRequest,
} from '@/models/bookingExtras'

const http = axios.create({
  baseURL: '/api/booking',
})

export const bookingTemplatesApi = {
  getTemplates: async () => {
    const { data } = await http.get<BookingTemplateResponse[]>('/templates')
    return data
  },
  getTemplate: async (templateId: string) => {
    const { data } = await http.get<BookingTemplateResponse>(`/template/${templateId}`)
    return data
  },
  createTemplate: async (payload: CreateBookingTemplateRequest) => {
    const { data } = await http.post<BookingTemplateResponse>('/template', payload)
    return data
  },
  createBookingFromTemplate: async (templateId: string, payload: CreateBookingFromTemplateRequest) => {
    const { data } = await http.post('/from-template/' + templateId, payload)
    return data
  },
  updateTemplate: async (templateId: string, payload: UpdateBookingTemplateRequest) => {
    const { data } = await http.put<BookingTemplateResponse>(`/template/${templateId}`, payload)
    return data
  },
  deleteTemplate: async (templateId: string) => {
    await http.delete(`/template/${templateId}`)
  },
}

export type BookingTemplatesApi = typeof bookingTemplatesApi
