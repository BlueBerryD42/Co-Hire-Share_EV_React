import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  MarketplaceGroupDto,
  MarketplaceFilterState,
} from "@/models/analytics";
import {
  marketplaceApi,
  type MarketplaceQuery,
} from "@/services/group/marketplace";

const defaultFilters: MarketplaceFilterState = {
  search: "",
  location: "",
  vehicleType: "",
  minPrice: 0,
  maxPrice: 10000000,
  minMembers: 0,
  maxMembers: 50,
  availability: "Any",
  sortBy: "members",
};

export const useGroupMarketplace = (initialQuery: MarketplaceQuery = {}) => {
  const queryRef = useRef(initialQuery);
  const [state, setState] = useState<{
    data: MarketplaceGroupDto[] | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  const [filters, setFilters] =
    useState<MarketplaceFilterState>(defaultFilters);

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await marketplaceApi.getGroups(queryRef.current);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const dataset = Array.isArray(state.data) ? state.data : [];
    return dataset
      .filter((group) => {
        // Search filter (by group name, vehicle make/model, location)
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const matchesSearch =
            group.groupName.toLowerCase().includes(searchLower) ||
            group.vehicleMake?.toLowerCase().includes(searchLower) ||
            group.vehicleModel?.toLowerCase().includes(searchLower) ||
            group.location?.toLowerCase().includes(searchLower);
          if (!matchesSearch) return false;
        }

        // Location filter
        if (filters.location && group.location) {
          if (
            !group.location
              .toLowerCase()
              .includes(filters.location.toLowerCase())
          ) {
            return false;
          }
        }

        // Vehicle type filter (by make/model)
        if (filters.vehicleType) {
          const vehicleTypeLower = filters.vehicleType.toLowerCase();
          const matchesType =
            group.vehicleMake?.toLowerCase().includes(vehicleTypeLower) ||
            group.vehicleModel?.toLowerCase().includes(vehicleTypeLower);
          if (!matchesType) return false;
        }

        // Price range filter
        if (
          group.monthlyEstimatedCost !== null &&
          group.monthlyEstimatedCost !== undefined
        ) {
          if (
            group.monthlyEstimatedCost < filters.minPrice ||
            group.monthlyEstimatedCost > filters.maxPrice
          ) {
            return false;
          }
        }

        // Members count filter
        if (
          group.totalMembers < filters.minMembers ||
          group.totalMembers > filters.maxMembers
        ) {
          return false;
        }

        // Availability filter
        if (
          filters.availability === "Open" &&
          group.availableOwnershipPercentage <= 0
        ) {
          return false;
        }
        if (
          filters.availability === "Full" &&
          group.availableOwnershipPercentage > 0
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "utilization":
            return (b.utilizationRate || 0) - (a.utilizationRate || 0);
          case "price":
            return (
              (b.monthlyEstimatedCost || 0) - (a.monthlyEstimatedCost || 0)
            );
          case "name":
            return a.groupName.localeCompare(b.groupName);
          default:
            return b.totalMembers - a.totalMembers;
        }
      });
  }, [state.data, filters]);

  return {
    ...state,
    filtered,
    filters,
    setFilters,
    reload: load,
  };
};
