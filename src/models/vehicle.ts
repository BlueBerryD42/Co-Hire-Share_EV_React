/**
 * Vehicle Models & DTOs
 * Dựa trên backend Vehicle Service API
 */

// Vehicle Status Enum
export type VehicleStatus = 'Available' | 'InUse' | 'Maintenance' | 'Unavailable'

// Health Category Enum
export type HealthCategory = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical'

// Service Type Enum
export type ServiceType =
  | 'OilChange'
  | 'TireRotation'
  | 'BrakeInspection'
  | 'BatteryCheck'
  | 'AirFilterReplacement'
  | 'TransmissionService'
  | 'CoolantService'
  | 'WheelAlignment'
  | 'TireReplacement'
  | 'EngineTuneUp'
  | 'WiperReplacement'
  | 'LightingService'
  | 'AirConditioningService'
  | 'GeneralInspection'
  | 'SuspensionService'
  | 'ExhaustService'
  | 'EVBatteryCheck'
  | 'EVChargingSystemService'
  | 'EVSoftwareUpdate'
  | 'Other'

// Maintenance Status
export type MaintenanceStatus = 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled' | 'Overdue'

// Maintenance Priority
export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Urgent'

// Health Score Summary
export interface VehicleHealthSummary {
  overallScore: number
  category: HealthCategory
}

// Vehicle Interface
export interface Vehicle {
  id: string
  vin: string
  plateNumber: string
  model: string
  year: number
  color?: string
  status: VehicleStatus
  lastServiceDate?: string
  odometer: number
  groupId: string
  createdAt: string
  updatedAt: string
  ownershipPercentage?: number
  usagePercentage?: number
  imageUrl?: string
  images?: string[]
  healthScore?: VehicleHealthSummary
}

// Vehicle List Item DTO
export interface VehicleListItemDto extends Vehicle {
  healthScore?: VehicleHealthSummary
}

// Vehicle Statistics
export interface VehicleStatistics {
  usage: {
    totalTrips: number
    totalDistance: number
    totalHours: number
    averageDistance: number
    averageDuration: number
    mostFrequentUser?: string
  }
  utilization: {
    rate: number
    availableHours: number
    idleHours: number
    maintenanceHours: number
    unavailableHours: number
  }
  efficiency: {
    distancePerCharge?: number
    costPerKm: number
    costPerHour: number
    revenue?: number
    costs?: number
    profit?: number
  }
  patterns: {
    peakHours: string[]
    peakDays: string[]
    busiestTime: string
  }
  trendsOverTime: Array<{
    period: string
    tripCount: number
    distance: number
    hours: number
    utilization: number
  }>
  comparison?: {
    previousPeriod: {
      trips: number
      distance: number
      hours: number
      utilization: number
    }
    growth: {
      trips: number
      distance: number
      hours: number
      utilization: number
    }
  }
  benchmarks?: {
    groupAverage: number
    similarVehicles: number
    rank: number
  }
  costs?: {
    thisMonth: number
  }
  startDate?: string
  endDate?: string
}

// Health Score Response
export interface HealthScoreResponse {
  overallScore: number
  category: HealthCategory
  breakdown?: Array<{
    component: string
    score: number
    maxScore: number
    weight: number
    description: string
    status: string
  }>
  factors?: {
    positive: string[]
    negative: string[]
  }
  recommendations?: Array<{
    recommendation: string
    priority: string
    potentialScoreIncrease: number
  }>
  alerts?: Array<{
    severity: string
    type: string
    message: string
  }>
  historicalTrend?: Array<{
    date: string
    score: number
    category: HealthCategory
  }>
  benchmark?: {
    percentile: number
    comparisonGroupSize: number
  }
  futurePrediction?: {
    oneMonth: number
    threeMonths: number
    sixMonths: number
    trend: string
    confidence: number
  }
}

// Maintenance Schedule
export interface MaintenanceSchedule {
  id: string
  vehicleId: string
  serviceType: ServiceType
  scheduledDate: string
  status: MaintenanceStatus
  estimatedCost?: number
  estimatedDuration?: number
  serviceProvider?: string
  notes?: string
  priority: MaintenancePriority
  createdBy?: string
  cancellationReason?: string
  cancelledBy?: string
  originalScheduledDate?: string
  rescheduleCount?: number
  lastRescheduleReason?: string
  lastRescheduledBy?: string
  createdAt: string
  updatedAt: string
}

// Maintenance Record
export interface MaintenanceRecord {
  id: string
  vehicleId: string
  groupId: string
  serviceType: ServiceType
  status: MaintenanceStatus
  priority: MaintenancePriority
  scheduledDate: string
  serviceCompletedDate?: string
  provider?: string
  serviceProvider?: string
  notes?: string
  estimatedCost?: number
  actualCost?: number
  estimatedDurationMinutes?: number
  actualDurationMinutes?: number
  odometerReading?: number
  odometerAtService?: number
  workPerformed?: string
  partsUsed?: string
  partsReplaced?: string
  nextServiceDue?: string
  nextServiceOdometer?: number
  serviceProviderRating?: number
  serviceProviderReview?: string
  completionPercentage?: number
  performedBy?: string
  expenseId?: string
  createdAt: string
  updatedAt: string
}

// Create Vehicle DTO
export interface CreateVehicleDto {
  vin: string
  plateNumber: string
  model: string
  year: number
  color?: string
  odometer: number
  groupId: string
}

// Update Vehicle Status DTO
export interface UpdateVehicleStatusDto {
  status: VehicleStatus
  from?: string
  to?: string
}

// Update Odometer DTO
export interface UpdateOdometerDto {
  odometer: number
}

// Schedule Maintenance Request
export interface ScheduleMaintenanceRequest {
  vehicleId: string
  serviceType: ServiceType
  scheduledDate: string
  estimatedDuration: number
  priority: MaintenancePriority
  serviceProvider?: string
  notes?: string
  estimatedCost?: number
  forceSchedule?: boolean
}

// Complete Maintenance Request
export interface CompleteMaintenanceRequest {
  actualCost: number
  odometerReading: number
  workPerformed: string
  partsReplaced?: string
  nextServiceDue?: string
  nextServiceOdometer?: number
  completionPercentage?: number
  createExpenseRecord?: boolean
  expenseCategory?: string
  serviceProviderRating?: number
  serviceProviderReview?: string
}

// ============================================================================
// ADDITIONAL TYPES FROM BACKEND VEHICLECONTROLLER
// ============================================================================

// Priority enum (for recommendations, alerts, etc.)
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical'

// ============================================================================
// STATISTICS & ANALYTICS TYPES (Enhanced from backend)
// ============================================================================

export interface DailyUsageData {
  date: string
  trips: number
  distance: number
  duration: number // in minutes
  averageSpeed: number
}

export interface TrendAnalysis {
  distanceTrend: number // percentage change
  tripsTrend: number
  utilizationTrend: number
  efficiencyTrend: number
}

export interface BenchmarkComparison {
  averageUtilization: number
  yourUtilization: number
  averageCostPerKm: number
  yourCostPerKm: number
  averageTripDistance: number
  yourAverageTripDistance: number
  performanceRating: string // "Above Average", "Average", "Below Average"
}

export interface VehicleStatisticsRequest {
  startDate?: string
  endDate?: string
  groupBy?: 'daily' | 'weekly' | 'monthly'
  includeBenchmarks?: boolean
}

export interface VehicleStatisticsResponse {
  vehicleId: string
  vehicleName: string
  plateNumber: string
  startDate: string
  endDate: string
  groupBy: string

  // Usage metrics
  totalTrips: number
  totalDistance: number
  totalDuration: number // in minutes
  averageSpeed: number
  averageTripDistance: number
  averageTripDuration: number

  // Utilization
  utilizationRate: number // percentage
  daysActive: number
  daysIdle: number
  totalDays: number

  // Efficiency
  fuelEfficiency: number | null
  costPerKm: number
  costPerTrip: number

  // Time series data
  dailyUsage: DailyUsageData[]

  // Trends
  trends: TrendAnalysis

  // Benchmarks
  benchmarks: BenchmarkComparison | null

  // Peak usage analysis
  peakUsageDays: string[] // ["Monday", "Friday"]
  peakUsageHours: number[] // [8, 9, 17, 18]
}

// ============================================================================
// COST ANALYSIS TYPES
// ============================================================================

export interface CostBreakdown {
  maintenance: number
  fuel: number
  insurance: number
  registration: number
  repairs: number
  parking: number
  tolls: number
  cleaning: number
  other: number
}

export interface PeriodCost {
  period: string // "2024-01", "2024-Q1", "2024"
  startDate: string
  endDate: string
  totalCost: number
  breakdown: CostBreakdown
}

export interface CostAnalysisRequest {
  startDate?: string
  endDate?: string
  groupBy?: 'month' | 'quarter' | 'year'
}

export interface CostAnalysisResponse {
  vehicleId: string
  vehicleName: string
  plateNumber: string
  startDate: string
  endDate: string
  groupBy: string

  // Total costs
  totalCost: number
  averageMonthlyCost: number

  // Cost breakdown by category
  breakdown: CostBreakdown

  // Cost by period
  costByPeriod: PeriodCost[]

  // Cost per usage metrics
  costPerKm: number
  costPerTrip: number
  costPerDay: number

  // Trends
  costTrend: number // percentage change (e.g., +5.2 means 5.2% increase)
  costTrendDirection: 'Increasing' | 'Decreasing' | 'Stable'

  // Predictions
  projectedAnnualCost: number
  projectedMonthlyCost: number

  // Insights
  highestCostCategory: string
  highestCostMonth: string | null
  costSavingsOpportunities: string[]
}

// ============================================================================
// MEMBER USAGE ANALYSIS TYPES
// ============================================================================

export interface MemberUsage {
  memberId: string
  memberName: string
  memberEmail: string
  ownershipPercentage: number

  // Usage metrics
  totalTrips: number
  totalDistance: number
  totalDuration: number // in minutes
  usagePercentage: number

  // Cost allocation
  costShare: number // based on ownership
  actualCostContribution: number // based on usage
  costBalance: number // difference

  // Fairness
  fairnessScore: number // 0-100, 100 = perfectly fair
  usageVsOwnershipRatio: number // 1.0 = fair, >1 = overusing, <1 = underusing
}

export interface FairnessMetrics {
  giniCoefficient: number // 0 = perfect equality, 1 = perfect inequality
  usageBalance: 'Balanced' | 'SlightlyImbalanced' | 'ModeratelyImbalanced' | 'HighlyImbalanced'
  recommendations: string[]
}

export interface MemberUsageRequest {
  startDate?: string
  endDate?: string
}

export interface MemberUsageResponse {
  vehicleId: string
  vehicleName: string
  plateNumber: string
  groupId: string
  groupName: string
  startDate: string
  endDate: string

  // Total metrics
  totalTrips: number
  totalDistance: number
  totalCost: number

  // Member breakdown
  memberUsage: MemberUsage[]

  // Fairness analysis
  fairnessMetrics: FairnessMetrics

  // Top users
  mostActiveUser: string | null
  leastActiveUser: string | null
}

// ============================================================================
// ENHANCED HEALTH SCORE TYPES
// ============================================================================

export interface ComponentScore {
  componentName: string
  points: number
  maxPoints: number
  weight: number
  percentage: number
  description: string
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Unknown'
}

export interface ScoreBreakdown {
  maintenanceAdherence: ComponentScore
  odometerVsAge: ComponentScore
  damageReports: ComponentScore
  serviceFrequency: ComponentScore
  vehicleAge: ComponentScore
  inspectionResults: ComponentScore
}

export interface Recommendation {
  title: string
  description: string
  priority: Priority
  potentialScoreIncrease: number
  actionType: string // "maintenance", "repair", "inspection", "service"
  estimatedCost: number | null
  estimatedTimeframe: string | null
}

export interface HealthAlert {
  alertType: string
  severity: 'Info' | 'Warning' | 'Critical'
  message: string
  actionRequired: string
  dueDate: string | null
}

export interface HistoricalScore {
  date: string
  score: number
  category: HealthCategory
}

export interface BenchmarkData {
  averageScore: number
  yourScore: number
  percentile: number // 75 means better than 75% of similar vehicles
  similarVehicles: number // count
  comparisonGroup: string // "Same model", "Same age", etc.
}

export interface HealthScoreRequest {
  includeHistory?: boolean
  includeBenchmark?: boolean
  historyMonths?: number
}

export interface HealthScoreResponseEnhanced {
  vehicleId: string
  vehicleName: string
  plateNumber: string
  calculatedAt: string

  // Overall score
  overallScore: number
  category: HealthCategory
  colorIndicator: string

  // Score breakdown
  breakdown: ScoreBreakdown

  // Factors
  positiveFactors: string[]
  negativeFactors: string[]

  // Recommendations
  recommendations: Recommendation[]

  // Alerts
  alerts: HealthAlert[]

  // Historical trend
  historicalTrend: HistoricalScore[] | null

  // Benchmark comparison
  benchmarkComparison: BenchmarkData | null

  // Summary
  summaryMessage: string
  nextRecommendedAction: string | null
}

// ============================================================================
// AVAILABILITY TYPES
// ============================================================================

export interface BookingConflict {
  bookingId: string
  userId: string
  userName: string
  userEmail: string
  startTime: string
  endTime: string
  status: string
  purpose: string | null
}

export interface AvailabilityRequest {
  from: string
  to: string
}

export interface AvailabilityResponse {
  vehicleId: string
  isAvailable: boolean
  conflicts: BookingConflict[]
  availableSlots: Array<{
    startTime: string
    endTime: string
  }>
}

// ============================================================================
// UPDATE TYPES
// ============================================================================

export interface UpdateVehicleDto {
  model?: string
  year?: number
  color?: string
  status?: VehicleStatus
  odometer?: number
  lastServiceDate?: string
}

// ============================================================================
// VEHICLE LIST ITEM (Enhanced)
// ============================================================================

export interface VehicleListItem {
  id: string
  vin: string
  plateNumber: string
  model: string
  year: number
  color: string | null
  status: string
  lastServiceDate: string | null
  odometer: number
  groupId: string | null
  createdAt: string
  updatedAt: string
  healthScore: VehicleHealthSummary | null
}
