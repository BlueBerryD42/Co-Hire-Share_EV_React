import { createApiClient } from '@/services/api'
import type { CreateGroupDto, GroupDto, GroupRole } from '@/models/group'
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
const normalizeGroupStatus = (status: number | string): GroupStatus => {
  if (typeof status === 'string') {
    return status as GroupStatus
  }
  // Backend returns: 0=Active, 1=Inactive, 2=Dissolved
  const statusMap: Record<number, GroupStatus> = {
    0: 'Active',
    1: 'Inactive',
    2: 'Dissolved',
  }
  return statusMap[status] ?? 'Active'
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
  return {
    ...group,
    status: normalizeGroupStatus(group.status),
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
    const { data } = await http.post<GroupDto>('/', payload)
    return data
  },
}

export type GroupApi = typeof groupApi

