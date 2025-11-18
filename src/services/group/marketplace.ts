import { createApiClient } from '@/services/api'
import type { GroupAnalyticsDto, UsageVsOwnershipDto } from '@/models/analytics'
import type { UUID } from '@/models/booking'

const http = createApiClient('/api/analytics')

export interface MarketplaceQuery {
  limit?: number
  offset?: number
  search?: string
}

export const marketplaceApi = {
  async getGroups(params: MarketplaceQuery = {}) {
    const { data } = await http.get<GroupAnalyticsDto[]>('/groups', {
      params,
    })
    return data
  },

  async getUsageVsOwnership(groupId: UUID) {
    const { data } = await http.get<UsageVsOwnershipDto>(`/usage-vs-ownership/${groupId}`)
    return data
  },
}

export type MarketplaceApi = typeof marketplaceApi



