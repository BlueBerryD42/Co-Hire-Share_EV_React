import { createApiClient } from "@/services/api";

type QueryParams = Record<string, unknown>;
type Payload = Record<string, unknown>;
type Identifier = string | number;

const apiClient = createApiClient("");

// Admin API endpoints
export const adminApi = {
  // Dashboard
  getDashboard: (params: QueryParams = {}) =>
    apiClient.get("/api/Admin/dashboard", { params }),

  getRecentActivity: (count = 20) =>
    apiClient.get("/api/Admin/activity", { params: { count } }),

  getAlerts: () => apiClient.get("/api/Admin/alerts"),

  // Groups
  getGroups: (params: QueryParams = {}) =>
    apiClient.get("/api/Admin/groups", { params }),

  getGroupDetails: (groupId: Identifier) =>
    apiClient.get(`/api/Admin/groups/${groupId}`),

  updateGroupStatus: (groupId: Identifier, data: Payload) =>
    apiClient.put(`/api/Admin/groups/${groupId}/status`, data),

  getGroupHealth: (groupId: Identifier) =>
    apiClient.get(`/api/Admin/groups/${groupId}/health`),

  // Vehicles
  getVehicles: (params: QueryParams = {}) =>
    apiClient.get("/api/Admin/vehicles", { params }),

  getVehicleDetails: (vehicleId: Identifier) =>
    apiClient.get(`/api/Admin/vehicles/${vehicleId}`),

  updateVehicleStatus: (vehicleId: Identifier, data: Payload) =>
    apiClient.put(`/api/Admin/vehicles/${vehicleId}/status`, data),

  // Users
  getUsers: (params: QueryParams = {}) =>
    apiClient.get("/api/Admin/users", { params }),

  getUserDetails: (userId: Identifier) =>
    apiClient.get(`/api/Admin/users/${userId}`),

  updateUserStatus: (userId: Identifier, data: Payload) =>
    apiClient.put(`/api/Admin/users/${userId}/status`, data),

  updateUserRole: (userId: Identifier, data: Payload) =>
    apiClient.put(`/api/Admin/users/${userId}/role`, data),

  // KYC
  getPendingKycUsers: () => apiClient.get("/api/Admin/kyc/pending"),

  reviewKycDocument: (documentId: Identifier, data: Payload) =>
    apiClient.post(`/api/Admin/kyc/documents/${documentId}/review`, data),

  updateUserKycStatus: (userId: Identifier, data: Payload) =>
    apiClient.put(`/api/Admin/kyc/users/${userId}/status`, data),

  // Check-in/Out Management
  getCheckIns: (params: QueryParams = {}) =>
    apiClient.get("/api/Admin/checkins", { params }),

  getCheckInDetails: (checkInId: Identifier) =>
    apiClient.get(`/api/Admin/checkins/${checkInId}`),

  approveCheckIn: (checkInId: Identifier, data: Payload) =>
    apiClient.post(`/api/Admin/checkins/${checkInId}/approve`, data),

  rejectCheckIn: (checkInId: Identifier, data: Payload) =>
    apiClient.post(`/api/Admin/checkins/${checkInId}/reject`, data),

  // Disputes
  getDisputes: (params: QueryParams = {}) =>
    apiClient.get("/api/Admin/disputes", { params }),

  getDisputeDetails: (disputeId: Identifier) =>
    apiClient.get(`/api/Admin/disputes/${disputeId}`),

  updateDisputeStatus: (disputeId: Identifier, data: Payload) =>
    apiClient.put(`/api/Admin/disputes/${disputeId}/status`, data),

  resolveDispute: (disputeId: Identifier, data: Payload) =>
    apiClient.post(`/api/Admin/disputes/${disputeId}/resolve`, data),

  // Financial Reports
  getFinancialOverview: () => apiClient.get("/api/Admin/financial/overview"),

  getFinancialByGroups: () => apiClient.get("/api/Admin/financial/groups"),

  getPaymentStatistics: () => apiClient.get("/api/Admin/financial/payments"),

  getExpenseAnalysis: () => apiClient.get("/api/Admin/financial/expenses"),

  generateFinancialPdf: (params?: QueryParams) =>
    apiClient.get("/api/Admin/financial/reports/pdf", {
      params,
      responseType: "blob",
    }),

  generateFinancialExcel: (params?: QueryParams) =>
    apiClient.get("/api/Admin/financial/reports/excel", {
      params,
      responseType: "blob",
    }),

  // System Health
  getSystemHealth: () => apiClient.get("/api/Admin/health"),

  getSystemMetrics: (minutes = 15) =>
    apiClient.get("/api/Admin/metrics", { params: { minutes } }),

  // Audit Log
  getAuditLogs: (params: QueryParams = {}) =>
    apiClient.get("/api/Admin/audit", { params }),

  // Maintenance
  getMaintenance: (params: QueryParams = {}) =>
    apiClient.get("/api/Admin/maintenance", { params }),

  getMaintenanceDetails: (maintenanceId: Identifier) =>
    apiClient.get(`/api/Admin/maintenance/${maintenanceId}`),

  createMaintenance: (data: Payload) =>
    apiClient.post("/api/Admin/maintenance", data),

  updateMaintenance: (maintenanceId: Identifier, data: Payload) =>
    apiClient.put(`/api/Admin/maintenance/${maintenanceId}`, data),
};

// Analytics API endpoints
export const analyticsApi = {
  getDashboard: (params: QueryParams = {}) =>
    apiClient.get("/api/Analytics/dashboard", { params }),

  getKpiMetrics: (params: QueryParams = {}) =>
    apiClient.get("/api/Analytics/kpi", { params }),

  getTrendData: (params: QueryParams = {}) =>
    apiClient.get("/api/Analytics/trends", { params }),

  getUserAnalytics: (params: QueryParams = {}) =>
    apiClient.get("/api/Analytics/users", { params }),

  getVehicleAnalytics: (params: QueryParams = {}) =>
    apiClient.get("/api/Analytics/vehicles", { params }),

  getGroupAnalytics: (params: QueryParams = {}) =>
    apiClient.get("/api/Analytics/groups", { params }),

  getReport: (reportType: string, params: QueryParams = {}) =>
    apiClient.get(`/api/Analytics/reports/${reportType}`, { params }),

  getPdfReport: (reportType: string, params: QueryParams = {}) =>
    apiClient.get(`/api/Analytics/reports/${reportType}/pdf`, {
      params,
      responseType: "blob",
    }),

  getExcelReport: (reportType: string, params: QueryParams = {}) =>
    apiClient.get(`/api/Analytics/reports/${reportType}/excel`, {
      params,
      responseType: "blob",
    }),
};

// AI API endpoints
export const aiApi = {
  getFairnessScore: (groupId: Identifier, params: QueryParams = {}) =>
    apiClient.get(`/api/ai/fairness-score/${groupId}`, { params }),

  getUsagePredictions: (groupId: Identifier) =>
    apiClient.get(`/api/ai/usage-predictions/${groupId}`),

  suggestBookingTime: (data: Payload) =>
    apiClient.post("/api/ai/suggest-booking-time", data),

  getCostOptimization: (groupId: Identifier, params: QueryParams = {}) =>
    apiClient.get(`/api/ai/cost-optimization/${groupId}`, { params }),

  getPredictiveMaintenance: (vehicleId: Identifier, params: QueryParams = {}) =>
    apiClient.get(`/api/ai/predictive-maintenance/${vehicleId}`, { params }),
};

export default apiClient;
