import type { ISODate, UUID } from '@/models/booking'

export interface GroupAnalyticsDto {
  id: UUID
  groupId: UUID
  groupName: string
  periodStart: ISODate
  periodEnd: ISODate
  period: string
  totalMembers: number
  activeMembers: number
  newMembers: number
  leftMembers: number
  totalVehicles: number
  totalBookings: number
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  averageMemberContribution: number
  utilizationRate: number
  participationRate: number
}

export interface UsageVsOwnershipDto {
  groupId: UUID
  groupName: string
  periodStart: ISODate
  periodEnd: ISODate
  generatedAt: ISODate
  members: MemberUsageMetricsDto[]
  groupMetrics: GroupFairnessMetricsDto
}

export interface MemberUsageMetricsDto {
  memberId: UUID
  memberName: string
  ownershipPercentage: number
  overallUsagePercentage: number
  usageDifference: number
  fairnessScore: number
  overallUsageLabel: 'Fair' | 'Over' | 'Under'
}

export interface GroupFairnessMetricsDto {
  overallFairnessScore: number
  distributionBalance: number
  usageConcentration: number
  giniCoefficient: number
  recommendations: string[]
}

export interface MarketplaceFilterState {
  search: string
  minMembers: number
  maxMembers: number
  availability: 'Any' | 'Open' | 'Full'
  sortBy: 'members' | 'utilization' | 'profit'
}



