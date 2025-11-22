import { createApiClient } from "@/services/api";
import type {
  GroupAnalyticsDto,
  UsageVsOwnershipDto,
  MarketplaceGroupDto,
} from "@/models/analytics";
import type { GroupDto } from "@/models/group";
import type { UUID } from "@/models/booking";
import { groupApi } from "./groups";
import vehicleService from "@/services/vehicleService";

const analyticsHttp = createApiClient("/api/analytics");
const groupHttp = createApiClient("/api/group");

export interface MarketplaceQuery {
  limit?: number;
  offset?: number;
  search?: string;
  location?: string;
  vehicleType?: string;
  minPrice?: number;
  maxPrice?: number;
  minMembers?: number;
  maxMembers?: number;
  availability?: "Any" | "Open" | "Full";
}

export const marketplaceApi = {
  async getGroups(
    params: MarketplaceQuery = {}
  ): Promise<MarketplaceGroupDto[]> {
    try {
      // Use the new BrowseGroups endpoint from Group service
      const { data: response } = await groupHttp.get<{
        groups: MarketplaceGroupDto[];
        totalCount: number;
        page: number;
        pageSize: number;
        totalPages: number;
      }>("/browse", {
        params: {
          search: params.search || undefined,
          location: params.location || undefined,
          vehicleType: params.vehicleType || undefined,
          minPrice: params.minPrice || undefined,
          maxPrice: params.maxPrice || undefined,
          minMembers: params.minMembers || undefined,
          maxMembers: params.maxMembers || undefined,
          availability: params.availability || undefined,
          sortBy: "members", // Default sort
          sortDescending: true,
          page: params.offset ? Math.floor(params.offset / (params.limit || 20)) + 1 : 1,
          pageSize: params.limit || 50,
        },
      });

      // Return groups array from response (backend returns "Groups" with capital G)
      const groups = (response as any).Groups || (response as any).groups || [];
      
      // Normalize property names and ensure numeric values are not null
      return groups.map((group: any) => ({
        groupId: group.GroupId || group.groupId,
        groupName: group.GroupName || group.groupName || '',
        description: group.Description || group.description || null,
        status: group.Status || group.status || 'Active',
        vehicleId: group.VehicleId || group.vehicleId || null,
        vehiclePhoto: group.VehiclePhoto || group.vehiclePhoto || null,
        vehicleMake: group.VehicleMake || group.vehicleMake || null,
        vehicleModel: group.VehicleModel || group.vehicleModel || null,
        vehicleYear: group.VehicleYear ?? group.vehicleYear ?? null,
        vehiclePlateNumber: group.VehiclePlateNumber || group.vehiclePlateNumber || null,
        location: group.Location || group.location || null,
        totalOwnershipPercentage: group.TotalOwnershipPercentage ?? group.totalOwnershipPercentage ?? 0,
        availableOwnershipPercentage: group.AvailableOwnershipPercentage ?? group.availableOwnershipPercentage ?? 0,
        totalMembers: group.TotalMembers ?? group.totalMembers ?? 0,
        currentMembers: group.CurrentMembers ?? group.currentMembers ?? 0,
        monthlyEstimatedCost: group.MonthlyEstimatedCost ?? group.monthlyEstimatedCost ?? null,
        utilizationRate: group.UtilizationRate ?? group.utilizationRate ?? null,
        participationRate: group.ParticipationRate ?? group.participationRate ?? null,
        totalBookings: group.TotalBookings ?? group.totalBookings ?? null,
        totalVehicles: group.TotalVehicles ?? group.totalVehicles ?? null,
      }));
    } catch (error) {
      console.error("Error fetching marketplace groups:", error);
      throw error;
    }
  },

  async getGroupDetails(groupId: UUID): Promise<GroupDto> {
    const { data } = await groupHttp.get<GroupDto>(`/${groupId}`);
    return data;
  },

  async getUsageVsOwnership(groupId: UUID) {
    const { data } = await analyticsHttp.get<UsageVsOwnershipDto>(
      `/usage-vs-ownership/${groupId}`
    );
    return data;
  },
};

export type MarketplaceApi = typeof marketplaceApi;

