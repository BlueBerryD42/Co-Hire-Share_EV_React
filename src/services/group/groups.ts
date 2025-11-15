import axios from 'axios'
import type { CreateGroupDto, GroupDto, GroupRole } from '@/models/group'
import type { UUID } from '@/models/booking'

const http = axios.create({
  baseURL: '/api/group',
})

export interface GroupDetailsLite {
  groupId: UUID
  groupName: string
  members: {
    userId: UUID
    ownershipPercentage: number
    role: GroupRole | string
  }[]
}

export const groupApi = {
  async getUserGroups() {
    const { data } = await http.get<GroupDto[]>('/')
    return data
  },

  async getGroup(groupId: UUID) {
    const { data } = await http.get<GroupDto>(`/${groupId}`)
    return data
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

