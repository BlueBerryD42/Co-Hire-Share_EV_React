import { useCallback, useEffect, useState } from 'react'
import type { GroupDto } from '@/models/group'
import type { UUID } from '@/models/booking'
import { groupApi } from '@/services/group/groups'

const fallbackGroups: GroupDto[] = [
  {
    id: 'd1111111-aaaa-4cf3-9a11-111111111111',
    name: 'Saigon Innovation Fleet',
    description: 'Shared Tesla fleet for enterprise clients and airport transfers.',
    status: 'Active',
    createdBy: '11111111-1111-1111-1111-111111111111',
    createdAt: '2025-02-01T09:00:00.000Z',
    members: [
      {
        id: 'a1111111-aaaa-4c11-b011-111100000001',
        userId: '11111111-1111-1111-1111-111111111111',
        userFirstName: 'John',
        userLastName: 'Doe',
        userEmail: 'john.coowner@seed.local',
        sharePercentage: 0.45,
        roleInGroup: 'Admin',
        joinedAt: '2025-02-02T08:00:00.000Z',
      },
      {
        id: 'a1111111-aaaa-4c11-b011-111100000002',
        userId: '22222222-2222-2222-2222-222222222222',
        userFirstName: 'Jane',
        userLastName: 'Smith',
        userEmail: 'jane.coowner@seed.local',
        sharePercentage: 0.35,
        roleInGroup: 'Member',
        joinedAt: '2025-02-04T08:00:00.000Z',
      },
      {
        id: 'a1111111-aaaa-4c11-b011-111100000003',
        userId: '33333333-3333-3333-3333-333333333333',
        userFirstName: 'Bob',
        userLastName: 'Wilson',
        userEmail: 'bob.coowner@seed.local',
        sharePercentage: 0.2,
        roleInGroup: 'Member',
        joinedAt: '2025-02-05T08:00:00.000Z',
      },
    ],
    vehicles: [
      {
        id: '00000000-0000-0000-0000-000000000001',
        vin: '5YJ3E1EA3LF70001',
        plateNumber: 'TESLA-03',
        model: 'Tesla Model 3 Performance',
        year: 2024,
        color: 'Pearl White',
        status: 'Available',
        odometer: 12800,
        groupId: 'd1111111-aaaa-4cf3-9a11-111111111111',
        groupName: 'Saigon Innovation Fleet',
        lastServiceDate: '2025-03-01T03:00:00.000Z',
        createdAt: '2025-02-03T02:30:00.000Z',
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        vin: 'KNDC44LC4P5123901',
        plateNumber: 'KIA-EV6',
        model: 'Kia EV6 GT-Line',
        year: 2023,
        color: 'Steel Grey',
        status: 'Maintenance',
        odometer: 7600,
        groupId: 'd1111111-aaaa-4cf3-9a11-111111111111',
        groupName: 'Saigon Innovation Fleet',
        lastServiceDate: '2025-02-25T05:00:00.000Z',
        createdAt: '2025-02-06T04:00:00.000Z',
      },
    ],
  },
  {
    id: 'd2222222-bbbb-4cf3-9a11-222222222222',
    name: 'Heritage Coastal Club',
    description: 'Coastal ownership circle for retreats and tourism.',
    status: 'Active',
    createdBy: '44444444-4444-4444-4444-444444444444',
    createdAt: '2025-02-10T04:00:00.000Z',
    members: [
      {
        id: 'a2222222-bbbb-4c22-b022-222200000001',
        userId: '44444444-4444-4444-4444-444444444444',
        userFirstName: 'Mai',
        userLastName: 'Pham',
        userEmail: 'mai.pham@seed.local',
        sharePercentage: 0.4,
        roleInGroup: 'Admin',
        joinedAt: '2025-02-11T04:00:00.000Z',
      },
      {
        id: 'a2222222-bbbb-4c22-b022-222200000002',
        userId: '22222222-2222-2222-2222-222222222222',
        userFirstName: 'Jane',
        userLastName: 'Smith',
        userEmail: 'jane.coowner@seed.local',
        sharePercentage: 0.3,
        roleInGroup: 'Member',
        joinedAt: '2025-02-12T04:00:00.000Z',
      },
      {
        id: 'a2222222-bbbb-4c22-b022-222200000003',
        userId: '33333333-3333-3333-3333-333333333333',
        userFirstName: 'Bob',
        userLastName: 'Wilson',
        userEmail: 'bob.coowner@seed.local',
        sharePercentage: 0.3,
        roleInGroup: 'Member',
        joinedAt: '2025-02-12T08:00:00.000Z',
      },
    ],
    vehicles: [
      {
        id: '00000000-0000-0000-0000-000000000003',
        vin: 'KM8KNDAF4RU123456',
        plateNumber: 'IONIQ-5',
        model: 'Hyundai Ioniq 5 Limited',
        year: 2024,
        color: 'Neptune Blue',
        status: 'Available',
        odometer: 9800,
        groupId: 'd2222222-bbbb-4cf3-9a11-222222222222',
        groupName: 'Heritage Coastal Club',
        lastServiceDate: '2025-02-28T06:00:00.000Z',
        createdAt: '2025-02-15T06:30:00.000Z',
      },
      {
        id: '00000000-0000-0000-0000-000000000004',
        vin: 'WMW13DJ08P2A12345',
        plateNumber: 'MINI-E',
        model: 'Mini Cooper SE',
        year: 2023,
        color: 'Seafoam Green',
        status: 'InUse',
        odometer: 4300,
        groupId: 'd2222222-bbbb-4cf3-9a11-222222222222',
        groupName: 'Heritage Coastal Club',
        lastServiceDate: '2025-02-20T02:00:00.000Z',
        createdAt: '2025-02-16T03:45:00.000Z',
      },
    ],
  },
]

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export const useGroups = () => {
  const [state, setState] = useState<AsyncState<GroupDto[]>>({
    data: null,
    loading: true,
    error: null,
  })

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const data = await groupApi.getUserGroups()
      const populated = Array.isArray(data) && data.length > 0 ? data : fallbackGroups
      setState({ data: populated, loading: false, error: null })
    } catch (error) {
      console.warn('useGroups: falling back to local dataset', error)
      setState({ data: fallbackGroups, loading: false, error: error as Error })
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { ...state, reload: load }
}

export const useGroup = (groupId?: UUID) => {
  const [state, setState] = useState<AsyncState<GroupDto>>({
    data: null,
    loading: Boolean(groupId),
    error: null,
  })

  const load = useCallback(async () => {
    if (!groupId) return
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const data = await groupApi.getGroup(groupId)
      setState({ data, loading: false, error: null })
    } catch (error) {
      const fallback = fallbackGroups.find((group) => group.id === groupId) ?? null
      console.warn(`useGroup: unable to load ${groupId}, using fallback`, error)
      setState({ data: fallback, loading: false, error: error as Error })
    }
  }, [groupId])

  useEffect(() => {
    void load()
  }, [load])

  return { ...state, reload: load }
}

