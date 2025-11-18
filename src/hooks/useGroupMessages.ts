import { useCallback, useEffect, useState } from 'react'
import type { UUID } from '@/models/booking'
import type { GroupMessageDto } from '@/models/message'
import { messagesApi } from '@/services/group/messages'

export const useGroupMessages = (groupId?: UUID) => {
  const [state, setState] = useState<{
    data: GroupMessageDto[] | null
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
      const data = await messagesApi.getGroupMessages(groupId)
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error })
    }
  }, [groupId])

  useEffect(() => {
    void load()
  }, [load])

  const sendMessage = useCallback(
    async (message: string, displayName?: string) => {
      if (!groupId) return
      await messagesApi.sendMessage(groupId, message, displayName)
      await load()
    },
    [groupId, load],
  )

  return { ...state, reload: load, sendMessage }
}



