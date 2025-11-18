import { useCallback, useEffect, useState } from 'react'
import type { UUID } from '@/models/booking'
import type { NotificationDto } from '@/models/notification'
import { notificationApi } from '@/services/notification/notifications'

export const useGroupApplications = (groupId?: UUID) => {
  const [state, setState] = useState<{
    data: NotificationDto[] | null
    loading: boolean
    error: Error | null
  }>({
    data: null,
    loading: Boolean(groupId),
    error: null,
  })

  const load = useCallback(async () => {
    if (!groupId) return
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const data = await notificationApi.getMine({
        groupId,
        type: 'GroupApplication',
      })
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



