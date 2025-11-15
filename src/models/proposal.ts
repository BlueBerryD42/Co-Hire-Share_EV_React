import type { ISODate, UUID } from '@/models/booking'

export type ProposalType =
  | 'VehicleUpgrade'
  | 'VehicleSale'
  | 'MaintenanceBudget'
  | 'PolicyChange'
  | 'MembershipChange'
  | 'Other'

export type ProposalStatus = 'Active' | 'Passed' | 'Rejected' | 'Expired' | 'Cancelled'
export type VoteChoice = 'Yes' | 'No' | 'Abstain'

export interface VoteDto {
  id: UUID
  proposalId: UUID
  voterId: UUID
  voterName: string
  weight: number
  choice: VoteChoice
  comment?: string | null
  votedAt: ISODate
}

export interface VoteTallyDto {
  yesWeight: number
  noWeight: number
  abstainWeight: number
  totalWeight: number
  yesPercentage: number
  noPercentage: number
  abstainPercentage: number
}

export interface VoteBreakdownDto {
  voterId: UUID
  voterName: string
  choice: VoteChoice
  weight: number
  weightPercentage: number
  votedAt: ISODate
  comment?: string | null
}

export interface ProposalDto {
  id: UUID
  groupId: UUID
  createdBy: UUID
  title: string
  description: string
  type: ProposalType
  amount?: number | null
  status: ProposalStatus
  votingStartDate: ISODate
  votingEndDate: ISODate
  requiredMajority: number
  createdAt: ISODate
  updatedAt: ISODate
  creatorName: string
}

export interface ProposalListDto {
  id: UUID
  title: string
  description: string
  type: ProposalType
  status: ProposalStatus
  amount?: number | null
  createdAt: ISODate
  votingEndDate: ISODate
  totalVotes: number
  yesVotes: number
  noVotes: number
  abstainVotes: number
  votingProgress: number
}

export interface ProposalDetailsDto {
  id: UUID
  groupId: UUID
  createdBy: UUID
  title: string
  description: string
  type: ProposalType
  amount?: number | null
  status: ProposalStatus
  votingStartDate: ISODate
  votingEndDate: ISODate
  requiredMajority: number
  createdAt: ISODate
  updatedAt: ISODate
  creatorName: string
  votes: VoteDto[]
  voteTally: VoteTallyDto
  votingProgress: number
  timeRemaining?: string | null
}

export interface ProposalResultsDto {
  proposalId: UUID
  status: ProposalStatus
  voteTally: VoteTallyDto
  quorumMet: boolean
  quorumPercentage: number
  requiredMajority: number
  passed: boolean
  voteBreakdown: VoteBreakdownDto[]
  closedAt?: ISODate | null
}

export interface CreateProposalDto {
  groupId: UUID
  title: string
  description: string
  type: ProposalType
  amount?: number
  votingStartDate: ISODate
  votingEndDate: ISODate
  requiredMajority?: number
}

export interface CastVoteDto {
  choice: VoteChoice
  comment?: string
}

