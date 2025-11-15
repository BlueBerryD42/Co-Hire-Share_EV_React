import { useCallback, useEffect, useState } from 'react'
import type { ProposalDetailsDto, ProposalListDto } from '@/models/proposal'
import type { UUID } from '@/models/booking'
import { proposalApi, type ProposalListFilters } from '@/services/group/proposals'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export const useProposals = (groupId?: UUID, filters: ProposalListFilters = {}) => {
  const [state, setState] = useState<AsyncState<ProposalListDto[]>>({
    data: null,
    loading: Boolean(groupId),
    error: null,
  })

  const load = useCallback(async () => {
    if (!groupId) return
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const data = await proposalApi.getByGroup(groupId, filters)
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error })
    }
  }, [filters, groupId])

  useEffect(() => {
    void load()
  }, [load])

  return { ...state, reload: load }
}

export const useProposal = (proposalId?: UUID) => {
  const [state, setState] = useState<AsyncState<ProposalDetailsDto>>({
    data: null,
    loading: Boolean(proposalId),
    error: null,
  })

  const load = useCallback(async () => {
    if (!proposalId) return
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const data = await proposalApi.getById(proposalId)
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error })
    }
  }, [proposalId])

  useEffect(() => {
    void load()
  }, [load])

  return { ...state, reload: load }
}

