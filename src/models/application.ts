import type { UUID } from '@/models/booking'

export interface JoinGroupApplicationDto {
  groupId: UUID
  desiredOwnershipPercentage: number
  intendedUsageHoursPerWeek: number
  introduction: string
  agreeToRules: boolean
  backgroundCheckConsent: boolean
  preferredContact: 'Email' | 'Phone' | 'InApp'
  emergencyContactName?: string
  emergencyContactPhone?: string
}

export interface JoinApplicationSubmissionResult {
  requestId: UUID
  status: 'Submitted' | 'Acknowledged'
  notifiedAdmins: UUID[]
}


