import { createApiClient } from '@/services/api'
import type {
  CastVoteDto,
  CreateProposalDto,
  ProposalDetailsDto,
  ProposalDto,
  ProposalListDto,
  ProposalResultsDto,
} from '@/models/proposal'
import type { UUID } from '@/models/booking'

const http = createApiClient('/api/proposal')

export interface ProposalListFilters {
  status?: string
}

export const proposalApi = {
  async create(payload: CreateProposalDto) {
    const { data } = await http.post<ProposalDto>('/', payload)
    return data
  },

  async getByGroup(groupId: UUID, filters: ProposalListFilters = {}) {
    const { data } = await http.get<ProposalListDto[]>(`/group/${groupId}`, {
      params: filters,
    })
    return data
  },

  async getById(proposalId: UUID) {
    const { data } = await http.get<ProposalDetailsDto>(`/${proposalId}`)
    return data
  },

  async vote(proposalId: UUID, payload: CastVoteDto) {
    const { data } = await http.post(`${proposalId}/vote`, payload)
    return data
  },

  async getResults(proposalId: UUID) {
    const { data } = await http.get<ProposalResultsDto>(`/${proposalId}/results`)
    return data
  },

  async close(proposalId: UUID) {
    const { data } = await http.put<ProposalDto>(`/${proposalId}/close`)
    return data
  },

  async cancel(proposalId: UUID) {
    await http.delete(`/${proposalId}`)
  },
}

export type ProposalApi = typeof proposalApi

