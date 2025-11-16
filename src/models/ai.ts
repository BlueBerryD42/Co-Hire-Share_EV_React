import type { UUID, ISODate } from "./booking";

// ============================================
// Fairness Analysis Types
// ============================================

export interface MemberFairness {
  userId: UUID;
  userFirstName?: string | null;
  userLastName?: string | null;
  ownershipPercentage: number; // 0-100
  usagePercentage: number; // 0-100
  fairnessScore: number; // (Usage% / Ownership%) * 100
  isOverUtilizer: boolean;
  isUnderUtilizer: boolean;
}

export interface FairnessAlerts {
  hasSevereOverUtilizers: boolean;
  hasSevereUnderUtilizers: boolean;
  groupFairnessLow: boolean;
  overUtilizerUserIds: UUID[];
  underUtilizerUserIds: UUID[];
}

export interface FairnessRecommendations {
  groupRecommendations: string[];
  memberRecommendations: Record<UUID, string[]>;
}

export interface OwnershipVsUsagePoint {
  userId: UUID;
  ownershipPercentage: number;
  usagePercentage: number;
}

export interface FairnessTrendPoint {
  periodStart: ISODate;
  periodEnd: ISODate;
  groupFairnessScore: number;
}

export interface MemberComparisonPoint {
  userId: UUID;
  fairnessScore: number;
}

export interface FairnessVisualization {
  ownershipVsUsageChart: OwnershipVsUsagePoint[];
  fairnessTimeline: FairnessTrendPoint[];
  memberComparison: MemberComparisonPoint[];
}

export interface FairnessAnalysisResponse {
  groupId: UUID;
  periodStart: ISODate;
  periodEnd: ISODate;
  groupFairnessScore: number; // 0-100
  fairnessIndex: number; // alias for group score or composite
  giniCoefficient: number; // 0-1
  standardDeviationFromOwnership: number; // percentage points
  members: MemberFairness[];
  alerts: FairnessAlerts;
  recommendations: FairnessRecommendations;
  visualization: FairnessVisualization;
  trend: FairnessTrendPoint[];
}

// ============================================
// Booking Suggestion Types
// ============================================

export interface SuggestBookingRequest {
  userId: UUID;
  groupId: UUID;
  preferredDate?: ISODate | null;
  durationMinutes: number;
}

export interface BookingSuggestionItem {
  start: ISODate;
  end: ISODate;
  confidence: number; // 0-1
  reasons: string[];
}

export interface SuggestBookingResponse {
  userId: UUID;
  groupId: UUID;
  suggestions: BookingSuggestionItem[];
}

// ============================================
// UI Helper Types (for frontend display)
// ============================================

// Helper type for displaying fairness factors in UI
export interface FairnessFactorDisplay {
  name: string;
  score: number;
  description: string;
}

// Helper type for displaying suggestions in UI
export interface FairnessSuggestionDisplay {
  title: string;
  description: string;
}

// Helper type for admin booking recommendation display
export interface BookingRecommendationDisplay {
  dateTime: ISODate;
  duration: number; // hours
  confidence: number; // 0-1
  fairUsageImpact?: number; // percentage change
  reasoning?: string;
}
