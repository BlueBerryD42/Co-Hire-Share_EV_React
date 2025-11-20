import apiClient from './api'
import type {
  Vehicle,
  VehicleListItem,
  VehicleStatistics,
  CreateVehicleDto,
  UpdateVehicleDto,
  UpdateOdometerDto,
  VehicleStatisticsRequest,
  VehicleStatisticsResponse,
  CostAnalysisRequest,
  CostAnalysisResponse,
  MemberUsageRequest,
  MemberUsageResponse,
  HealthScoreRequest,
  HealthScoreResponse,
  HealthScoreResponseEnhanced,
  AvailabilityRequest,
  AvailabilityResponse,
  MaintenanceSchedule,
  MaintenanceRecord,
  ScheduleMaintenanceRequest,
  CompleteMaintenanceRequest,
  ApproveVehicleDto,
  RejectVehicleDto,
  PendingVehicleDto,
} from '@/models/vehicle'

/**
 * Vehicle Service - Tất cả API calls liên quan đến Vehicle
 * Backend API: /api/Vehicle
 */

// Deprecated: Use types from @/types/vehicle instead
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
   * GET /api/Vehicle
   * Lấy danh sách tất cả xe (filtered theo group membership)
   * Response includes health score for each vehicle
   */
  getAllVehicles: async (): Promise<VehicleListItem[]> => {
    const response = await apiClient.get<VehicleListItem[]>('/Vehicle')
    return response.data
  },

  /**
   * GET /api/Vehicle/{id}
   * Lấy chi tiết một xe
   */
  getVehicleById: async (id: string): Promise<Vehicle> => {
    const response = await apiClient.get<Vehicle>(`/Vehicle/${id}`)
    return response.data
  },

  /**
   * POST /api/Vehicle
   * Tạo xe mới (Admin only)
   */
  createVehicle: async (vehicleData: CreateVehicleDto): Promise<Vehicle> => {
    const response = await apiClient.post<Vehicle>('/Vehicle', vehicleData)
    return response.data
  },

  /**
   * PUT /api/Vehicle/{id}
   * Cập nhật thông tin xe
   */
  updateVehicle: async (id: string, vehicleData: UpdateVehicleDto): Promise<Vehicle> => {
    const response = await apiClient.put<Vehicle>(`/Vehicle/${id}`, vehicleData)
    return response.data
  },

  /**
   * PUT /api/Vehicle/{id}/odometer
   * Cập nhật số km đã đi
   */
  updateOdometer: async (id: string, odometerData: UpdateOdometerDto): Promise<Vehicle> => {
    const response = await apiClient.put<Vehicle>(`/Vehicle/${id}/odometer`, odometerData)
    return response.data
  },

  /**
   * GET /api/Vehicle/{id}/availability
   * Kiểm tra xe có sẵn trong khoảng thời gian không
   */
  checkAvailability: async (id: string, params: AvailabilityRequest): Promise<AvailabilityResponse> => {
    const response = await apiClient.get<AvailabilityResponse>(`/Vehicle/${id}/availability`, { params })
    return response.data
  },

  // ============ ANALYTICS & STATISTICS ============

  /**
   * GET /api/Vehicle/{id}/statistics
   * Lấy thống kê sử dụng xe chi tiết
   * Query params: startDate, endDate, groupBy, includeBenchmarks
   */
  getVehicleStatistics: async (id: string, params: VehicleStatisticsRequest = {}): Promise<VehicleStatisticsResponse> => {
    const response = await apiClient.get<VehicleStatisticsResponse>(`/Vehicle/${id}/statistics`, { params })
    return response.data
  },

  /**
   * GET /api/Vehicle/{id}/cost-analysis
   * Phân tích chi phí xe
   * Query params: startDate, endDate, groupBy
   */
  getCostAnalysis: async (id: string, params: CostAnalysisRequest = {}): Promise<CostAnalysisResponse> => {
    const response = await apiClient.get(`/Vehicle/${id}/cost-analysis`, { params })
    return response.data
  },

  /**
   * GET /api/Vehicle/{id}/member-usage
   * Phân tích sử dụng theo từng thành viên
   * Query params: startDate, endDate
   */
  getMemberUsage: async (id: string, params: MemberUsageRequest = {}): Promise<MemberUsageResponse> => {
    const response = await apiClient.get<MemberUsageResponse>(`/Vehicle/${id}/member-usage`, { params })
    return response.data
  },

  /**
   * GET /api/Vehicle/{id}/health-score
   * Lấy điểm sức khỏe xe (0-100)
   * Query params: includeHistory, includeBenchmark, historyMonths
   */
  getHealthScore: async (id: string, params: HealthScoreRequest = {}): Promise<HealthScoreResponse> => {
    const response = await apiClient.get<HealthScoreResponse>(`/Vehicle/${id}/health-score`, { params })
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

  // ============ APPROVAL WORKFLOW ============

  /**
   * GET /api/Vehicle/pending
   * Get pending vehicles (Staff/Admin only)
   */
  getPendingVehicles: async (): Promise<PendingVehicleDto[]> => {
    const response = await apiClient.get<PendingVehicleDto[]>('/Vehicle/pending')
    return response.data
  },

  /**
   * POST /api/Vehicle/{id}/approve
   * Approve a vehicle (Staff/Admin only)
   */
  approveVehicle: async (id: string, payload?: ApproveVehicleDto): Promise<{ message: string; vehicleId: string }> => {
    const response = await apiClient.post<{ message: string; vehicleId: string }>(
      `/Vehicle/${id}/approve`,
      payload || {}
    )
    return response.data
  },

  /**
   * POST /api/Vehicle/{id}/reject
   * Reject a vehicle (Staff/Admin only)
   */
  rejectVehicle: async (id: string, payload: RejectVehicleDto): Promise<{ message: string; vehicleId: string }> => {
    const response = await apiClient.post<{ message: string; vehicleId: string }>(
      `/Vehicle/${id}/reject`,
      payload
    )
    return response.data
  },

  /**
   * PUT /api/Vehicle/{id}/resubmit
   * Resubmit a rejected vehicle
   */
  resubmitVehicle: async (id: string): Promise<{ message: string; vehicleId: string }> => {
    const response = await apiClient.put<{ message: string; vehicleId: string }>(
      `/Vehicle/${id}/resubmit`
    )
    return response.data
  },
}

export default vehicleService
