import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GroupAnalyticsDto, MarketplaceFilterState } from '@/models/analytics'
import { marketplaceApi, type MarketplaceQuery } from '@/services/group/marketplace'

const defaultFilters: MarketplaceFilterState = {
  search: '',
  minMembers: 0,
  maxMembers: 50,
  availability: 'Any',
  sortBy: 'members',
}

export const useGroupMarketplace = (initialQuery: MarketplaceQuery = {}) => {
  const queryRef = useRef(initialQuery)
  const [state, setState] = useState<{
    data: GroupAnalyticsDto[] | null
    loading: boolean
    error: Error | null
  }>({
    data: null,
    loading: true,
    error: null,
  })

  const [filters, setFilters] = useState<MarketplaceFilterState>(defaultFilters)

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const data = await marketplaceApi.getGroups(queryRef.current)
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error })
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const dataset = Array.isArray(state.data) ? state.data : []
    return dataset
      .filter((group) => {
        if (filters.search && !group.groupName.toLowerCase().includes(filters.search.toLowerCase())) {
          return false
        }
        if (group.totalMembers < filters.minMembers || group.totalMembers > filters.maxMembers) {
          return false
        }
        if (filters.availability === 'Open' && group.activeMembers >= group.totalMembers) {
          return false
        }
        if (filters.availability === 'Full' && group.activeMembers < group.totalMembers) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'utilization':
            return b.utilizationRate - a.utilizationRate
          case 'profit':
            return b.netProfit - a.netProfit
          default:
            return b.totalMembers - a.totalMembers
        }
      })
  }, [state.data, filters])

  return {
    ...state,
    filtered,
    filters,
    setFilters,
    reload: load,
  }
}

