import type { BookingPriority, ISODate, UUID } from '@/models/booking'

export interface BookingTemplateResponse {
  id: UUID
  userId: UUID
  name: string
  vehicleId?: UUID | null
  duration: string
  preferredStartTime: string
  purpose?: string | null
  notes?: string | null
  priority: BookingPriority
  usageCount: number
  createdAt: ISODate
  updatedAt: ISODate
}

export interface CreateBookingTemplateRequest {
  name: string
  vehicleId?: UUID | null
  duration: string
  preferredStartTime: string
  purpose?: string
  notes?: string
  priority?: BookingPriority
}

export type UpdateBookingTemplateRequest = Partial<CreateBookingTemplateRequest>

export interface CreateBookingFromTemplateRequest {
  startDateTime: ISODate
  vehicleId?: UUID | null
}

export type CheckInType = 'CheckOut' | 'CheckIn'

export interface CheckInHistoryFilterDto {
  vehicleId?: UUID
  userId?: UUID
  from?: ISODate
  to?: ISODate
  type?: CheckInType
}

export interface CheckInPhotoDto {
  id: UUID
  url: string
  type: string
  capturedAt: ISODate
}

export interface DamageReportDto {
  id: UUID
  checkInId: UUID
  bookingId: UUID
  vehicleId: UUID
  groupId: UUID
  reportedByUserId: UUID
  description: string
  severity: string
  location: string
  estimatedCost?: number
  status: string
  notes?: string
  photoIds: UUID[]
  createdAt: ISODate
  updatedAt: ISODate
}

export interface CheckInDto {
  id: UUID
  bookingId: UUID
  type: CheckInType
  createdAt: ISODate
  odometer?: number
  batteryPercentage?: number
  notes?: string
}

export interface CheckInRecordMetricsDto {
  timestamp: ISODate
  minutesFromBookingStart?: number
  minutesUntilBookingEnd?: number
  minutesSincePreviousEvent?: number
  odometer?: number
}

export interface CheckInRecordDetailDto {
  record: CheckInDto
  photosByCategory: Record<string, CheckInPhotoDto[]>
  damageReports: DamageReportDto[]
  metrics: CheckInRecordMetricsDto
}

export interface StartTripDto {
  bookingId: UUID
  odometerReading: number
  notes?: string
  signatureReference?: string
}

export interface EndTripDto {
  bookingId: UUID
  odometerReading: number
  notes?: string
  signatureReference?: string
}

export interface LateReturnFeeDto {
  id: UUID
  bookingId: UUID
  checkInId: UUID
  userId: UUID
  vehicleId: UUID
  groupId: UUID
  lateDurationMinutes: number
  feeAmount: number
  originalFeeAmount?: number
  calculationMethod?: string
  status: string
  expenseId?: UUID
  invoiceId?: UUID
  waivedBy?: UUID
  waivedReason?: string
  waivedAt?: ISODate
  createdAt: ISODate
  updatedAt: ISODate
}

export interface RecurringBookingDto {
  id: UUID
  vehicleId: UUID
  groupId: UUID
  userId: UUID
  pattern: string
  interval: number
  daysOfWeek: string[]
  startTime: string
  endTime: string
  recurrenceStartDate: ISODate
  recurrenceEndDate?: ISODate
  status: string
  notes?: string
  purpose?: string
  timeZoneId?: string
  cancellationReason?: string
  createdAt: ISODate
  updatedAt: ISODate
}

export interface CreateRecurringBookingDto {
  vehicleId: UUID
  groupId: UUID
  pattern: string
  interval?: number
  daysOfWeek?: string[]
  startTime: string
  endTime: string
  recurrenceStartDate: ISODate
  recurrenceEndDate?: ISODate
  notes?: string
  purpose?: string
  timeZoneId?: string
}

export type UpdateRecurringBookingDto = Partial<CreateRecurringBookingDto> & {
  status?: string
  pausedUntilUtc?: ISODate
}

export interface BookingNotificationPreferencesUpdate {
  enableReminders?: boolean
  enableEmail?: boolean
  enableSms?: boolean
  preferredTimeZoneId?: string
}

export interface VehicleQrCodeResponseDto {
  vehicleId: UUID
  format: 'dataUrl' | 'payload'
  payload: string
  expiresAt: ISODate
}
