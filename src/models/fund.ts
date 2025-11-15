import type { ISODate, UUID } from '@/models/booking'

export type FundTransactionType = 'Deposit' | 'Withdrawal' | 'Allocation' | 'Release' | 'ExpensePayment'
export type FundTransactionStatus = 'Pending' | 'Approved' | 'Completed' | 'Rejected'

export interface FundTransactionDto {
  id: UUID
  groupId: UUID
  initiatedBy: UUID
  initiatorName: string
  type: FundTransactionType
  amount: number
  balanceBefore: number
  balanceAfter: number
  description: string
  status: FundTransactionStatus
  approvedBy?: UUID | null
  approverName?: string | null
  transactionDate: ISODate
  reference?: string | null
  createdAt: ISODate
}

export interface FundStatisticsDto {
  totalDeposits: number
  totalWithdrawals: number
  netChange: number
  memberContributions: Record<string, number>
}

export interface FundBalanceDto {
  groupId: UUID
  totalBalance: number
  reserveBalance: number
  availableBalance: number
  lastUpdated: ISODate
  recentTransactions: FundTransactionDto[]
  statistics: FundStatisticsDto
}

export interface FundTransactionHistoryDto {
  transactions: FundTransactionDto[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface FundSummaryDto {
  period: string
  totalDeposits: number
  totalWithdrawals: number
  netChange: number
  averageBalance: number
  memberContributions: Record<string, number>
  reserveAllocationChanges: number
}

export interface DepositFundDto {
  amount: number
  description: string
  reference?: string
  autoAllocateToReservePercent?: number
}

export interface WithdrawFundDto {
  amount: number
  reason: string
  recipient?: string
}

export interface AllocateReserveDto {
  amount: number
  reason: string
}

export type ReleaseReserveDto = AllocateReserveDto

export interface FundHistoryFilters {
  page?: number
  pageSize?: number
  type?: FundTransactionType
  fromDate?: ISODate
  toDate?: ISODate
}

