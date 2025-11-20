import type { ISODate, UUID } from "@/models/booking";

export interface GroupAnalyticsDto {
  id: UUID;
  groupId: UUID;
  groupName: string;
  periodStart: ISODate;
  periodEnd: ISODate;
  period: string;
  totalMembers: number;
  activeMembers: number;
  newMembers: number;
  leftMembers: number;
  totalVehicles: number;
  totalBookings: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  averageMemberContribution: number;
  utilizationRate: number;
  participationRate: number;
}

export interface UsageVsOwnershipDto {
  groupId: UUID;
  groupName: string;
  periodStart: ISODate;
  periodEnd: ISODate;
  generatedAt: ISODate;
  members: MemberUsageMetricsDto[];
  groupMetrics: GroupFairnessMetricsDto;
}

export interface MemberUsageMetricsDto {
  memberId: UUID;
  memberName: string;
  ownershipPercentage: number;
  overallUsagePercentage: number;
  usageDifference: number;
  fairnessScore: number;
  overallUsageLabel: "Fair" | "Over" | "Under";
}

export interface GroupFairnessMetricsDto {
  overallFairnessScore: number;
  distributionBalance: number;
  usageConcentration: number;
  giniCoefficient: number;
  recommendations: string[];
}

export interface MarketplaceFilterState {
  search: string;
  location: string;
  vehicleType: string;
  minPrice: number;
  maxPrice: number;
  minMembers: number;
  maxMembers: number;
  availability: "Any" | "Open" | "Full";
  sortBy: "members" | "utilization" | "profit" | "price" | "name";
}

export interface MarketplaceGroupDto {
  groupId: UUID;
  groupName: string;
  description?: string | null;
  status: string;
  // Vehicle info
  vehicleId?: UUID | null;
  vehiclePhoto?: string | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehicleYear?: number | null;
  vehiclePlateNumber?: string | null;
  location?: string | null;
  // Ownership info
  totalOwnershipPercentage: number;
  availableOwnershipPercentage: number;
  totalMembers: number;
  currentMembers: number;
  // Cost info
  monthlyEstimatedCost?: number | null;
  // Analytics info (from GroupAnalyticsDto)
  utilizationRate?: number;
  participationRate?: number;
  totalBookings?: number;
  totalVehicles?: number;
}
