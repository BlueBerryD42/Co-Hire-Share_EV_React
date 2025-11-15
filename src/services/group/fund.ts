import axios from 'axios'
import type {
  AllocateReserveDto,
  DepositFundDto,
  FundBalanceDto,
  FundHistoryFilters,
  FundSummaryDto,
  FundTransactionDto,
  FundTransactionHistoryDto,
  ReleaseReserveDto,
  WithdrawFundDto,
} from '@/models/fund'
import type { ISODate, UUID } from '@/models/booking'

const http = axios.create({
  baseURL: '/api/fund',
})

export const fundApi = {
  async getBalance(groupId: UUID) {
    const { data } = await http.get<FundBalanceDto>(`/${groupId}`)
    return data
  },

  async deposit(groupId: UUID, payload: DepositFundDto) {
    const { data } = await http.post<FundTransactionDto>(`/${groupId}/deposit`, payload)
    return data
  },

  async withdraw(groupId: UUID, payload: WithdrawFundDto) {
    const { data } = await http.post<FundTransactionDto>(`/${groupId}/withdraw`, payload)
    return data
  },

  async allocateReserve(groupId: UUID, payload: AllocateReserveDto) {
    const { data } = await http.post<FundTransactionDto>(`/${groupId}/allocate-reserve`, payload)
    return data
  },

  async releaseReserve(groupId: UUID, payload: ReleaseReserveDto) {
    const { data } = await http.post<FundTransactionDto>(`/${groupId}/release-reserve`, payload)
    return data
  },

  async getTransactions(groupId: UUID, filters: FundHistoryFilters = {}) {
    const { data } = await http.get<FundTransactionHistoryDto>(`/${groupId}/transactions`, {
      params: filters,
    })
    return data
  },

  async getSummary(groupId: UUID, period: string) {
    const { data } = await http.get<FundSummaryDto>(`/${groupId}/summary/${period}`)
    return data
  },
}

export type FundApi = typeof fundApi

