// src/models/maintenance.ts

// Enums matching the backend C# Enums
export enum MaintenanceStatus {
  Scheduled = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3,
  Overdue = 4,
}

export enum ServiceType {
  OilChange = 0,
  TireRotation = 1,
  BrakeInspection = 2,
  BatteryCheck = 3,
  AirFilterReplacement = 4,
  TransmissionService = 5,
  CoolantService = 6,
  WheelAlignment = 7,
  TireReplacement = 8,
  EngineTuneUp = 9,
  WiperReplacement = 10,
  LightingService = 11,
  AirConditioningService = 12,
  GeneralInspection = 13,
  SuspensionService = 14,
  ExhaustService = 15,
  EVBatteryCheck = 16,
  EVChargingSystemService = 17,
  EVSoftwareUpdate = 18,
  Other = 99,
}

export enum MaintenancePriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3,
}

// DTO for scheduling maintenance (matches ScheduleMaintenanceRequest)
export interface ScheduleMaintenanceRequest {
  vehicleId: string;
  serviceType: ServiceType;
  scheduledDate: string; // ISO 8601 string
  estimatedDuration: number; // in minutes
  serviceProvider?: string;
  notes?: string;
  priority: MaintenancePriority;
  estimatedCost?: number;
  forceSchedule?: boolean;
}

// DTO for completing maintenance (matches CompleteMaintenanceRequest)
export interface CompleteMaintenanceRequest {
  actualCost: number;
  odometerReading: number;
  workPerformed: string;
  partsReplaced?: string;
  nextServiceDue?: string; // ISO 8601 string
  nextServiceOdometer?: number;
  notes?: string;
  createExpenseRecord?: boolean;
  expenseCategory?: string;
  serviceProviderRating?: number; // 1-5
  serviceProviderReview?: string;
}

// DTO for rescheduling maintenance (matches RescheduleMaintenanceRequest)
export interface RescheduleMaintenanceRequest {
  newScheduledDate: string; // ISO 8601 string
  reason: string;
  forceReschedule?: boolean;
}

// DTO for cancelling maintenance (matches CancelMaintenanceRequest)
export interface CancelMaintenanceRequest {
  cancellationReason: string;
}

// Represents a single maintenance schedule item
export interface MaintenanceSchedule {
  id: string;
  vehicleId: string;
  serviceType: ServiceType;
  scheduledDate: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  serviceProvider?: string;
  estimatedCost?: number;
  notes?: string;
}

// Response for vehicle maintenance schedule query
export interface MaintenanceScheduleResponse {
  schedules: MaintenanceSchedule[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// Represents a single maintenance history record
export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  maintenanceScheduleId?: string;
  serviceType: ServiceType;
  serviceDate: string;
  actualCost: number;
  odometerReading: number;
  workPerformed: string;
  serviceProvider?: string;
  notes?: string;
}

// Response for vehicle maintenance history query
export interface MaintenanceHistoryResponse {
  records: MaintenanceRecord[];
  statistics: {
    totalCost: number;
    averageCost: number;
    totalRecords: number;
  };
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}
