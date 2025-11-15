import apiClient from './api'
import type {
  Vehicle,
  VehicleStatistics,
  HealthScoreResponse,
  MaintenanceSchedule,
  MaintenanceRecord,
  CreateVehicleDto,
  UpdateVehicleStatusDto,
  UpdateOdometerDto,
  ScheduleMaintenanceRequest,
  CompleteMaintenanceRequest,
} from '@/types'

/**
 * Vehicle Service - Tất cả API calls liên quan đến Vehicle
 * Backend API: /api/vehicles
 */

interface AvailabilityParams {
  from?: string
  to?: string
}

interface StatisticsParams {
  startDate?: string
  endDate?: string
  groupBy?: string
  includeBenchmarks?: boolean
}

interface CostAnalysisParams {
  startDate?: string
  endDate?: string
  groupBy?: string
}

interface MemberUsageParams {
  startDate?: string
  endDate?: string
}

interface HealthScoreParams {
  includeHistory?: boolean
  includeBenchmark?: boolean
  historyMonths?: number
}

interface MaintenanceQueryParams {
  status?: string
  pageNumber?: number
  pageSize?: number
  serviceType?: string
  startDate?: string
  endDate?: string
}

interface UpcomingMaintenanceParams {
  days?: number
  priority?: string
  serviceType?: string
}

interface RescheduleMaintenanceData {
  scheduledDate: string
  reason?: string
}

interface CancelMaintenanceData {
  reason: string
}

const vehicleService = {
  // ============ VEHICLE MANAGEMENT ============

  /**
   * GET /api/vehicles
   * Lấy danh sách tất cả xe (filtered theo group membership)
   */
  getAllVehicles: async (): Promise<Vehicle[]> => {
    const response = await apiClient.get<Vehicle[]>('/vehicles')
    return response.data
  },

  /**
   * GET /api/vehicles/{id}
   * Lấy chi tiết một xe
   */
  getVehicleById: async (id: string): Promise<Vehicle> => {
    const response = await apiClient.get<Vehicle>(`/vehicles/${id}`)
    return response.data
  },

  /**
   * POST /api/vehicles
   * Tạo xe mới (Admin only)
   */
  createVehicle: async (vehicleData: CreateVehicleDto): Promise<Vehicle> => {
    const response = await apiClient.post<Vehicle>('/vehicles', vehicleData)
    return response.data
  },

  /**
   * PUT /api/vehicles/{id}/status
   * Cập nhật trạng thái xe
   */
  updateVehicleStatus: async (id: string, statusData: UpdateVehicleStatusDto): Promise<Vehicle> => {
    const response = await apiClient.put<Vehicle>(`/vehicles/${id}/status`, statusData)
    return response.data
  },

  /**
   * PUT /api/vehicles/{id}/odometer
   * Cập nhật số km đã đi
   */
  updateOdometer: async (id: string, odometerData: UpdateOdometerDto): Promise<Vehicle> => {
    const response = await apiClient.put<Vehicle>(`/vehicles/${id}/odometer`, odometerData)
    return response.data
  },

  /**
   * GET /api/vehicles/{id}/availability
   * Kiểm tra xe có sẵn trong khoảng thời gian không
   */
  checkAvailability: async (id: string, params: AvailabilityParams): Promise<boolean> => {
    const response = await apiClient.get<boolean>(`/vehicles/${id}/availability`, { params })
    return response.data
  },

  // ============ ANALYTICS & STATISTICS ============

  /**
   * GET /api/vehicles/{id}/statistics
   * Lấy thống kê sử dụng xe chi tiết
   * Query params: startDate, endDate, groupBy, includeBenchmarks
   */
  getVehicleStatistics: async (id: string, params: StatisticsParams = {}): Promise<VehicleStatistics> => {
    const response = await apiClient.get<VehicleStatistics>(`/vehicles/${id}/statistics`, { params })
    return response.data
  },

  /**
   * GET /api/vehicles/{id}/cost-analysis
   * Phân tích chi phí xe
   * Query params: startDate, endDate, groupBy
   */
  getCostAnalysis: async (id: string, params: CostAnalysisParams = {}): Promise<any> => {
    const response = await apiClient.get(`/vehicles/${id}/cost-analysis`, { params })
    return response.data
  },

  /**
   * GET /api/vehicles/{id}/member-usage
   * Phân tích sử dụng theo từng thành viên
   * Query params: startDate, endDate
   */
  getMemberUsage: async (id: string, params: MemberUsageParams = {}): Promise<any> => {
    const response = await apiClient.get(`/vehicles/${id}/member-usage`, { params })
    return response.data
  },

  /**
   * GET /api/vehicles/{id}/health-score
   * Lấy điểm sức khỏe xe (0-100)
   * Query params: includeHistory, includeBenchmark, historyMonths
   */
  getHealthScore: async (id: string, params: HealthScoreParams = {}): Promise<HealthScoreResponse> => {
    const response = await apiClient.get<HealthScoreResponse>(`/vehicles/${id}/health-score`, { params })
    return response.data
  },

  // ============ MAINTENANCE MANAGEMENT ============

  /**
   * GET /maintenance/schedules/{id}
   * Lấy lịch bảo trì cụ thể
   */
  getMaintenanceSchedule: async (id: string): Promise<MaintenanceSchedule> => {
    const response = await apiClient.get<MaintenanceSchedule>(`/maintenance/schedules/${id}`)
    return response.data
  },

  /**
   * GET /maintenance/vehicle/{vehicleId}
   * Lấy lịch bảo trì của xe (tương lai & đang tiến hành)
   * Query params: status, pageNumber, pageSize
   */
  getVehicleMaintenance: async (vehicleId: string, params: MaintenanceQueryParams = {}): Promise<MaintenanceSchedule[]> => {
    const response = await apiClient.get<MaintenanceSchedule[]>(`/maintenance/vehicle/${vehicleId}`, { params })
    return response.data
  },

  /**
   * GET /maintenance/history/{vehicleId}
   * Lấy lịch sử bảo trì đã hoàn thành
   * Query params: serviceType, startDate, endDate, pageNumber, pageSize
   */
  getMaintenanceHistory: async (vehicleId: string, params: MaintenanceQueryParams = {}): Promise<MaintenanceRecord[]> => {
    const response = await apiClient.get<MaintenanceRecord[]>(`/maintenance/history/${vehicleId}`, { params })
    return response.data
  },

  /**
   * POST /maintenance/schedule
   * Đặt lịch bảo trì mới
   */
  scheduleMaintenance: async (scheduleData: ScheduleMaintenanceRequest): Promise<MaintenanceSchedule> => {
    const response = await apiClient.post<MaintenanceSchedule>('/maintenance/schedule', scheduleData)
    return response.data
  },

  /**
   * PUT /maintenance/{id}/complete
   * Hoàn thành bảo trì
   */
  completeMaintenance: async (id: string, completeData: CompleteMaintenanceRequest): Promise<MaintenanceRecord> => {
    const response = await apiClient.put<MaintenanceRecord>(`/maintenance/${id}/complete`, completeData)
    return response.data
  },

  /**
   * POST /maintenance/{id}/reschedule
   * Đổi lịch bảo trì
   */
  rescheduleMaintenance: async (id: string, rescheduleData: RescheduleMaintenanceData): Promise<MaintenanceSchedule> => {
    const response = await apiClient.post<MaintenanceSchedule>(`/maintenance/${id}/reschedule`, rescheduleData)
    return response.data
  },

  /**
   * DELETE /maintenance/{id}
   * Hủy lịch bảo trì
   */
  cancelMaintenance: async (id: string, cancelData: CancelMaintenanceData): Promise<void> => {
    const response = await apiClient.delete(`/maintenance/${id}`, { data: cancelData })
    return response.data
  },

  /**
   * GET /maintenance/upcoming
   * Lấy lịch bảo trì sắp tới
   * Query params: days, priority, serviceType
   */
  getUpcomingMaintenance: async (params: UpcomingMaintenanceParams = {}): Promise<MaintenanceSchedule[]> => {
    const response = await apiClient.get<MaintenanceSchedule[]>('/maintenance/upcoming', { params })
    return response.data
  },

  /**
   * GET /maintenance/overdue
   * Lấy lịch bảo trì quá hạn
   */
  getOverdueMaintenance: async (): Promise<MaintenanceSchedule[]> => {
    const response = await apiClient.get<MaintenanceSchedule[]>('/maintenance/overdue')
    return response.data
  },

  /**
   * GET /maintenance/records/{recordId}/pdf
   * Tải báo cáo bảo trì dạng PDF
   */
  downloadMaintenancePdf: async (recordId: string): Promise<Blob> => {
    const response = await apiClient.get<Blob>(`/maintenance/records/${recordId}/pdf`, {
      responseType: 'blob',
    })
    return response.data
  },
}

export default vehicleService
