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
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error })
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
      setState({ data: null, loading: false, error: error as Error })
    }
  }, [groupId])

  useEffect(() => {
    void load()
  }, [load])

  return { ...state, reload: load }
}

