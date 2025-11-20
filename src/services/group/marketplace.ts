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
      // Fetch analytics data for groups
      const { data: analyticsData } = await analyticsHttp.get<
        GroupAnalyticsDto[]
      >("/groups", {
        params: { limit: params.limit, offset: params.offset },
      });

      if (!analyticsData || analyticsData.length === 0) {
        return [];
      }

      // Fetch group details and vehicle information for each group
      const marketplaceGroups: MarketplaceGroupDto[] = [];

      for (const analytics of analyticsData) {
        try {
          // Get group details
          let groupDetails: any = null;
          let groupFullDetails: GroupDto | null = null;
          try {
            groupDetails = await groupApi.getGroupDetails(analytics.groupId);
            // Also get full group details for description
            groupFullDetails = await groupApi.getGroup(analytics.groupId);
          } catch (error) {
            console.warn(
              `Failed to fetch group details for ${analytics.groupId}:`,
              error
            );
          }

          // Calculate available ownership percentage
          const totalOwnership =
            groupDetails?.members?.reduce(
              (sum: number, m: any) =>
                sum + (m.ownershipPercentage || m.sharePercentage || 0),
              0
            ) || 0;
          const availableOwnership = Math.max(0, 100 - totalOwnership);

          // Try to get vehicle information (get first vehicle from group)
          let vehicleInfo: any = null;
          try {
            // Get vehicles for this group - we'll need to fetch from vehicle service
            // For now, we'll extract vehicle info from group if available
            // In a real implementation, you might need to call vehicle service with groupId filter
            const vehicles = await vehicleService.getAllVehicles();
            const groupVehicles = vehicles.filter(
              (v) => v.groupId === analytics.groupId
            );
            vehicleInfo = groupVehicles[0] || null;
          } catch (error) {
            console.warn(
              `Failed to fetch vehicle for group ${analytics.groupId}:`,
              error
            );
          }

          // Calculate monthly estimated cost (simplified - based on expenses)
          const monthlyCost = analytics.totalExpenses
            ? analytics.totalExpenses / (analytics.totalMembers || 1)
            : null;

          // Extract vehicle make/model from vehicle model string (e.g., "Tesla Model 3 Performance")
          const vehicleModelParts = vehicleInfo?.model?.split(" ") || [];
          const vehicleMake = vehicleModelParts[0] || null;
          const vehicleModel =
            vehicleModelParts.slice(1).join(" ") || vehicleInfo?.model || null;

          marketplaceGroups.push({
            groupId: analytics.groupId,
            groupName: analytics.groupName,
            description: groupFullDetails?.description || null,
            status: groupFullDetails?.status || "Active",
            vehicleId: vehicleInfo?.id || null,
            vehiclePhoto:
              vehicleInfo?.imageUrl || vehicleInfo?.images?.[0] || null,
            vehicleMake,
            vehicleModel,
            vehicleYear: vehicleInfo?.year || null,
            vehiclePlateNumber: vehicleInfo?.plateNumber || null,
            location: null, // Location not available in current API - may need backend support
            totalOwnershipPercentage: totalOwnership,
            availableOwnershipPercentage: availableOwnership,
            totalMembers: analytics.totalMembers,
            currentMembers: analytics.activeMembers,
            monthlyEstimatedCost: monthlyCost,
            utilizationRate: analytics.utilizationRate,
            participationRate: analytics.participationRate,
            totalBookings: analytics.totalBookings,
            totalVehicles: analytics.totalVehicles,
          });
        } catch (error) {
          console.warn(`Failed to process group ${analytics.groupId}:`, error);
          // Still add basic info from analytics
          marketplaceGroups.push({
            groupId: analytics.groupId,
            groupName: analytics.groupName,
            description: null,
            status: "Active",
            totalOwnershipPercentage: 100,
            availableOwnershipPercentage: 0,
            totalMembers: analytics.totalMembers,
            currentMembers: analytics.activeMembers,
            monthlyEstimatedCost: null,
            utilizationRate: analytics.utilizationRate,
            participationRate: analytics.participationRate,
            totalBookings: analytics.totalBookings,
            totalVehicles: analytics.totalVehicles,
          });
        }
      }

      return marketplaceGroups;
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
