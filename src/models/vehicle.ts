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
