import { useCallback, useEffect, useState } from 'react'
import type { FundBalanceDto, FundTransactionHistoryDto } from '@/models/fund'
import type { UUID } from '@/models/booking'
import { fundApi } from '@/services/group/fund'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export const useFundBalance = (groupId?: UUID) => {
  const [state, setState] = useState<AsyncState<FundBalanceDto>>({
    data: null,
    loading: Boolean(groupId),
    error: null,
  })

  const load = useCallback(async () => {
    if (!groupId) return
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const data = await fundApi.getBalance(groupId)
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

export const useFundTransactions = (groupId?: UUID, page = 1, pageSize = 20) => {
  const [state, setState] = useState<AsyncState<FundTransactionHistoryDto>>({
    data: null,
    loading: Boolean(groupId),
    error: null,
  })

  const load = useCallback(async () => {
    if (!groupId) return
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const data = await fundApi.getTransactions(groupId, { page, pageSize })
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error })
    }
  }, [groupId, page, pageSize])

  useEffect(() => {
    void load()
  }, [load])

  return { ...state, reload: load }
}

