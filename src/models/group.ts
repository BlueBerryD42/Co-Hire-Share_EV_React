import type { ISODate, UUID } from '@/models/booking'

export type GroupStatus = 'PendingApproval' | 'Active' | 'Inactive' | 'Dissolved' | 'Rejected'
export type GroupRole = 'Member' | 'Admin'

export interface GroupMemberDto {
  id: UUID
  userId: UUID
  userFirstName: string
  userLastName: string
  userEmail: string
  sharePercentage: number
  roleInGroup: GroupRole
  joinedAt: ISODate
}

export type VehicleStatus = 'Available' | 'InUse' | 'Maintenance' | 'Unavailable'

export interface GroupVehicleDto {
  id: UUID
  vin: string
  plateNumber: string
  model: string
  year: number
  color?: string | null
  status: VehicleStatus
  odometer: number
  groupId?: UUID | null
  groupName?: string | null
  lastServiceDate?: ISODate | null
  createdAt: ISODate
  updatedAt?: ISODate
}

export interface GroupDto {
  id: UUID
  name: string
  description?: string | null
  status: GroupStatus
  createdBy: UUID
  createdAt: ISODate
  rejectionReason?: string | null
  submittedAt?: ISODate | null
  reviewedBy?: UUID | null
  reviewedAt?: ISODate | null
  members: GroupMemberDto[]
  vehicles: GroupVehicleDto[]
}

export interface CreateGroupMemberDto {
  userId: UUID
  sharePercentage: number
  roleInGroup?: GroupRole
}

export interface CreateGroupDto {
  name: string
  description?: string
  members: CreateGroupMemberDto[]
}

export interface UpdateGroupMemberShareDto {
  userId: UUID
  sharePercentage: number
}

export interface UpdateGroupSharesDto {
  members: UpdateGroupMemberShareDto[]
}

export interface ApproveGroupDto {
  notes?: string
}

export interface RejectGroupDto {
  reason: string
}

export interface PendingGroupDto extends GroupDto {
  memberCount: number
  pendingKycCount: number
  totalOwnershipPercentage: number
  hasGroupAdmin: boolean
}

