import { createApiClient } from '@/services/api'
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
  CreateFundDepositPaymentDto,
  FundDepositPaymentResponse,
} from '@/models/fund'
import type { UUID } from '@/models/booking'

const http = createApiClient('/api/fund')
const paymentHttp = createApiClient('/api/payment')

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

  async createDepositPayment(groupId: UUID, payload: CreateFundDepositPaymentDto) {
    const { data } = await paymentHttp.post<FundDepositPaymentResponse>(
      `/fund/${groupId}/deposit-vnpay`,
      payload
    )
    return data
  },

  async approveWithdrawal(groupId: UUID, transactionId: UUID) {
    const { data } = await http.post<FundTransactionDto>(
      `/${groupId}/withdrawals/${transactionId}/approve`
    )
    return data
  },

  async rejectWithdrawal(groupId: UUID, transactionId: UUID, reason?: string) {
    const { data } = await http.post<FundTransactionDto>(
      `/${groupId}/withdrawals/${transactionId}/reject`,
      reason ? { reason } : undefined
    )
    return data
  },
}

export type FundApi = typeof fundApi

