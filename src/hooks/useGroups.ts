import { useCallback, useEffect, useState } from 'react'
import type { GroupDto } from '@/models/group'
import type { UUID } from '@/models/booking'
import { groupApi } from '@/services/group/groups'

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
      // Only use real API data - empty array means user has no groups (not an error)
      const populated = Array.isArray(data) ? data : []
      setState({ data: populated, loading: false, error: null })
    } catch (error) {
      // Only use fallback on actual API errors, not when user has no groups
      console.warn('useGroups: API error, user has no groups', error)
      setState({ data: [], loading: false, error: error as Error })
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
      // Don't use fallback data - return null if group not found
      console.warn(`useGroup: unable to load ${groupId}`, error)
      setState({ data: null, loading: false, error: error as Error })
    }
  }, [groupId])

  useEffect(() => {
    void load()
  }, [load])

  return { ...state, reload: load }
}

