// src/services/maintenanceService.ts

import { createApiClient } from './api';
import type {
  MaintenanceScheduleResponse,
  MaintenanceHistoryResponse,
  ScheduleMaintenanceRequest,
  CompleteMaintenanceRequest,
  RescheduleMaintenanceRequest,
  CancelMaintenanceRequest,
  MaintenanceSchedule,
  MaintenanceRecord
} from '@/models/maintenance';

// Create an API client with the specific prefix for the Maintenance service
const apiClient = createApiClient('/api/maintenance');

/**
 * Fetches the maintenance schedule for a specific vehicle.
 * Corresponds to: GET /api/maintenance/vehicle/{vehicleId}
 * @param vehicleId - The ID of the vehicle.
 * @param params - Query parameters for pagination and filtering (e.g., status, pageNumber, pageSize).
 * @returns A promise that resolves to the maintenance schedule response.
 */
const getVehicleMaintenanceSchedule = async (
  vehicleId: string,
  params?: { status?: number; pageNumber?: number; pageSize?: number }
): Promise<MaintenanceScheduleResponse> => {
  try {
    const response = await apiClient.get<MaintenanceScheduleResponse>(`/vehicle/${vehicleId}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching maintenance schedule for vehicle ${vehicleId}:`, error);
    throw error;
  }
};

/**
 * Fetches the maintenance history for a specific vehicle.
 * Corresponds to: GET /api/maintenance/history/{vehicleId}
 * @param vehicleId - The ID of the vehicle.
 * @param params - Query parameters for filtering (e.g., serviceType, startDate, endDate, pageNumber, pageSize).
 * @returns A promise that resolves to the maintenance history response.
 */
const getVehicleMaintenanceHistory = async (
  vehicleId: string,
  params?: { serviceType?: number; startDate?: string; endDate?: string; pageNumber?: number; pageSize?: number }
): Promise<MaintenanceHistoryResponse> => {
  try {
    const response = await apiClient.get<MaintenanceHistoryResponse>(`/history/${vehicleId}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching maintenance history for vehicle ${vehicleId}:`, error);
    throw error;
  }
};

/**
 * Schedules a new maintenance event for a vehicle.
 * Corresponds to: POST /api/maintenance/schedule
 * @param request - The data for the new maintenance schedule.
 * @returns A promise that resolves to the newly created maintenance schedule.
 */
const scheduleMaintenance = async (request: ScheduleMaintenanceRequest): Promise<any> => {
  try {
    const response = await apiClient.post('/schedule', request);
    return response.data;
  } catch (error) {
    console.error('Error scheduling maintenance:', error);
    throw error;
  }
};

/**
 * Completes a scheduled maintenance.
 * Corresponds to: PUT /api/maintenance/{id}/complete
 * @param scheduleId - The ID of the maintenance schedule to complete.
 * @param request - The completion data.
 * @returns A promise that resolves to the response data.
 */
const completeMaintenance = async (scheduleId: string, request: CompleteMaintenanceRequest): Promise<any> => {
    try {
        const response = await apiClient.put(`/${scheduleId}/complete`, request);
        return response.data;
    } catch (error) {
        console.error(`Error completing maintenance ${scheduleId}:`, error);
        throw error;
    }
};

/**
 * Reschedules a maintenance appointment.
 * Corresponds to: POST /api/maintenance/{id}/reschedule
 * @param scheduleId - The ID of the maintenance schedule to reschedule.
 * @param request - The reschedule data.
 * @returns A promise that resolves to the response data.
 */
const rescheduleMaintenance = async (scheduleId: string, request: RescheduleMaintenanceRequest): Promise<any> => {
    try {
        const response = await apiClient.post(`/${scheduleId}/reschedule`, request);
        return response.data;
    } catch (error) {
        console.error(`Error rescheduling maintenance ${scheduleId}:`, error);
        throw error;
    }
};

/**
 * Cancels a scheduled maintenance.
 * Corresponds to: DELETE /api/maintenance/{id}
 * @param scheduleId - The ID of the maintenance schedule to cancel.
 * @param request - The cancellation reason.
 * @returns A promise that resolves to the response data.
 */
const cancelMaintenance = async (scheduleId: string, request: CancelMaintenanceRequest): Promise<any> => {
    try {
        // DELETE requests in axios can have a data payload by using the config object
        const response = await apiClient.delete(`/${scheduleId}`, { data: request });
        return response.data;
    } catch (error) {
        console.error(`Error cancelling maintenance ${scheduleId}:`, error);
        throw error;
    }
};


/**
 * Fetches a single maintenance schedule by its ID.
 * Corresponds to: GET /api/maintenance/schedules/{id}
 * @param scheduleId - The ID of the maintenance schedule.
 * @returns A promise that resolves to the maintenance schedule.
 */
const getScheduleById = async (scheduleId: string): Promise<MaintenanceSchedule> => {
    try {
        const response = await apiClient.get<MaintenanceSchedule>(`/schedules/${scheduleId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching maintenance schedule ${scheduleId}:`, error);
        throw error;
    }
};

/**
 * Updates an existing maintenance schedule.
 * Corresponds to: PUT /api/maintenance/schedules/{id}
 * @param scheduleId - The ID of the schedule to update.
 * @param data - The data to update.
 * @returns A promise that resolves to the updated maintenance schedule.
 */
const updateSchedule = async (scheduleId: string, data: Partial<MaintenanceSchedule>): Promise<MaintenanceSchedule> => {
    try {
        const response = await apiClient.put<MaintenanceSchedule>(`/schedules/${scheduleId}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error updating maintenance schedule ${scheduleId}:`, error);
        throw error;
    }
};

const maintenanceService = {
  getVehicleMaintenanceSchedule,
  getVehicleMaintenanceHistory,
  scheduleMaintenance,
  completeMaintenance,
  rescheduleMaintenance,
  cancelMaintenance,
  getScheduleById,
  updateSchedule,
};

export default maintenanceService;
