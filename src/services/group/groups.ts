import { createApiClient } from '@/services/api'
import type {
  CreateGroupDto,
  GroupDto,
  GroupRole,
  GroupStatus,
  ApproveGroupDto,
  RejectGroupDto,
  PendingGroupDto,
} from '@/models/group'
import type { UUID } from '@/models/booking'

const http = createApiClient('/api/group')

export interface GroupDetailsLite {
  groupId: UUID
  groupName: string
  members: {
    userId: UUID
    ownershipPercentage: number
    role: GroupRole | string
  }[]
}

// Helper function to convert numeric status to string
// WORKAROUND: Backend has a bug where it returns "Active" for status 0 (PendingApproval)
// We need to check the actual numeric value if available, or use context clues
const normalizeGroupStatus = (status: number | string | undefined | null, rawData?: any): GroupStatus => {
  if (status === undefined || status === null) {
    console.warn('normalizeGroupStatus: status is undefined or null, defaulting to PendingApproval')
    return 'PendingApproval'
  }
  
  if (typeof status === 'string') {
    // Handle case-insensitive string matching
    const statusLower = status.toLowerCase().trim()
    
    // WORKAROUND: If backend incorrectly returns "Active" for PendingApproval,
    // check if we have context clues (like SubmittedAt without ReviewedAt)
    if (statusLower === 'active' && rawData) {
      // If group has SubmittedAt but no ReviewedAt, it's likely PendingApproval
      if (rawData.submittedAt && !rawData.reviewedAt) {
        console.warn('normalizeGroupStatus: Backend returned "Active" but group appears to be PendingApproval (has SubmittedAt, no ReviewedAt). Correcting to PendingApproval.')
        return 'PendingApproval'
      }
      // If group has RejectionReason, it should be Rejected, not Active
      if (rawData.rejectionReason) {
        console.warn('normalizeGroupStatus: Backend returned "Active" but group has RejectionReason. Correcting to Rejected.')
        return 'Rejected'
      }
    }
    
    const stringStatusMap: Record<string, GroupStatus> = {
      'pendingapproval': 'PendingApproval',
      'pending': 'PendingApproval',
      'active': 'Active',
      'inactive': 'Inactive',
      'dissolved': 'Dissolved',
      'rejected': 'Rejected',
    }
    const normalized = stringStatusMap[statusLower]
    if (normalized) {
      return normalized
    }
    // If not found in map, log warning and try to return as-is
    console.warn('normalizeGroupStatus: unknown string status:', status, 'returning as-is')
    return status as GroupStatus
  }
  
  // Backend returns: 0=PendingApproval, 1=Active, 2=Inactive, 3=Dissolved, 4=Rejected
  const statusMap: Record<number, GroupStatus> = {
    0: 'PendingApproval',
    1: 'Active',
    2: 'Inactive',
    3: 'Dissolved',
    4: 'Rejected',
  }
  const normalized = statusMap[status]
  if (normalized) {
    return normalized
  }
  console.warn('normalizeGroupStatus: unknown numeric status:', status, 'defaulting to PendingApproval')
  return 'PendingApproval'
}

// Helper function to normalize member data (backend may return PascalCase)
const normalizeMember = (member: any) => {
  return {
    ...member,
    userFirstName: member.UserFirstName || member.userFirstName || '',
    userLastName: member.UserLastName || member.userLastName || '',
    userEmail: member.UserEmail || member.userEmail || '',
    sharePercentage: member.SharePercentage ?? member.sharePercentage ?? 0,
    roleInGroup: member.RoleInGroup || member.roleInGroup || 'Member',
  }
}

// Helper function to normalize group data from backend
const normalizeGroup = (group: any): GroupDto => {
  // Pass the full group object for context-aware normalization
  const normalizedStatus = normalizeGroupStatus(group.status || group.Status, group)
  // Log for debugging when status is corrected
  const originalStatus = group.status || group.Status
  if (originalStatus !== normalizedStatus) {
    console.log('normalizeGroup: status corrected', {
      original: originalStatus,
      normalized: normalizedStatus,
      groupId: group.id || group.Id,
      groupName: group.name || group.Name,
      hasSubmittedAt: !!group.submittedAt,
      hasReviewedAt: !!group.reviewedAt,
      hasRejectionReason: !!group.rejectionReason,
    })
  }
  return {
    ...group,
    status: normalizedStatus,
    members: (group.Members || group.members || []).map(normalizeMember),
  }
}

export const groupApi = {
  async getUserGroups() {
    const { data } = await http.get<any[]>('/')
    return data.map(normalizeGroup)
  },

  async getGroup(groupId: UUID) {
    const { data } = await http.get<any>(`/${groupId}`)
    return normalizeGroup(data)
  },

  async getGroupDetails(groupId: UUID) {
    const { data } = await http.get<GroupDetailsLite>(`/${groupId}/details`)
    return data
  },

  async createGroup(payload: CreateGroupDto) {
    // Remove trailing slash to avoid routing issues
    const { data } = await http.post<GroupDto>('', payload)
    return normalizeGroup(data)
  },

  async getPendingGroups() {
    const { data } = await http.get<any[]>('/pending')
    return data.map(normalizeGroup) as PendingGroupDto[]
  },

  async approveGroup(groupId: UUID, payload?: ApproveGroupDto) {
    const { data } = await http.post<{ message: string; groupId: UUID }>(
      `/${groupId}/approve`,
      payload || {}
    )
    return data
  },

  async rejectGroup(groupId: UUID, payload: RejectGroupDto) {
    const { data } = await http.post<{ message: string; groupId: UUID }>(
      `/${groupId}/reject`,
      payload
    )
    return data
  },

  async resubmitGroup(groupId: UUID) {
    const { data } = await http.put<{ message: string; groupId: UUID }>(
      `/${groupId}/resubmit`
    )
    return data
  },
}

export type GroupApi = typeof groupApi

