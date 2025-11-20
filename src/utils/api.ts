import { createApiClient } from "@/services/api";

type QueryParams = Record<string, unknown>;
type Payload = Record<string, unknown>;
type Identifier = string | number;

const apiClient = createApiClient("");

// Admin API endpoints
// Note: Using lowercase 'admin' to match API Gateway routing in ocelot.json
export const adminApi = {
  // Dashboard
  getDashboard: (params: QueryParams = {}) =>
    apiClient.get("/api/admin/dashboard", { params }),

  getRecentActivity: (count = 20) =>
    apiClient.get("/api/admin/activity", { params: { count } }),

  getAlerts: () => apiClient.get("/api/admin/alerts"),

  // Groups
  getGroups: (params: QueryParams = {}) =>
    apiClient.get("/api/admin/groups", { params }),

  getGroupDetails: (groupId: Identifier) =>
    apiClient.get(`/api/admin/groups/${groupId}`),

  updateGroupStatus: (groupId: Identifier, data: Payload) =>
    apiClient.put(`/api/admin/groups/${groupId}/status`, data),

  getGroupHealth: (groupId: Identifier) =>
    apiClient.get(`/api/admin/groups/${groupId}/health`),

  // Vehicles
  getVehicles: (params: QueryParams = {}) =>
    apiClient.get("/api/admin/vehicles", { params }),

  getVehicleDetails: (vehicleId: Identifier) =>
    apiClient.get(`/api/admin/vehicles/${vehicleId}`),

  updateVehicleStatus: (vehicleId: Identifier, data: Payload) =>
    apiClient.put(`/api/admin/vehicles/${vehicleId}/status`, data),

  // Users
  getUsers: (params: QueryParams = {}) =>
    apiClient.get("/api/admin/users", { params }),

  getUserDetails: (userId: Identifier) =>
    apiClient.get(`/api/admin/users/${userId}`),

  updateUserStatus: (userId: Identifier, data: Payload) =>
    apiClient.put(`/api/admin/users/${userId}/status`, data),

  updateUserRole: (userId: Identifier, data: Payload) =>
    apiClient.put(`/api/admin/users/${userId}/role`, data),

  // KYC
  getPendingKycUsers: (params: QueryParams = {}) =>
    apiClient.get("/api/admin/users/pending-kyc", { params }),

  getKycDocumentDetails: (documentId: Identifier) =>
    apiClient.get(`/api/admin/kyc/documents/${documentId}`),

  downloadKycDocument: (documentId: Identifier) =>
    apiClient.get(`/api/admin/kyc/documents/${documentId}/download`, {
      responseType: "blob",
    }),

  reviewKycDocument: (documentId: Identifier, data: Payload) =>
    apiClient.post(`/api/admin/kyc/documents/${documentId}/review`, data),

  bulkReviewKycDocuments: (data: Payload) =>
    apiClient.post("/api/admin/kyc/documents/bulk-review", data),

  getKycStatistics: () => apiClient.get("/api/admin/kyc/statistics"),

  updateUserKycStatus: (userId: Identifier, data: Payload) =>
    apiClient.put(`/api/admin/users/${userId}/kyc-status`, data),

  // Check-in/Out Management
  getCheckIns: (params: QueryParams = {}) =>
    apiClient.get("/api/admin/checkins", { params }),

  getCheckInDetails: (checkInId: Identifier) =>
    apiClient.get(`/api/admin/checkins/${checkInId}`),

  approveCheckIn: (checkInId: Identifier, data: Payload) =>
    apiClient.post(`/api/admin/checkins/${checkInId}/approve`, data),

  rejectCheckIn: (checkInId: Identifier, data: Payload) =>
    apiClient.post(`/api/admin/checkins/${checkInId}/reject`, data),

  // Disputes
  getDisputes: (params: QueryParams = {}) =>
    apiClient.get("/api/admin/disputes", { params }),

  getDisputeDetails: (disputeId: Identifier) =>
    apiClient.get(`/api/admin/disputes/${disputeId}`),

  updateDisputeStatus: (disputeId: Identifier, data: Payload) =>
    apiClient.put(`/api/admin/disputes/${disputeId}/status`, data),

  resolveDispute: (disputeId: Identifier, data: Payload) =>
    apiClient.post(`/api/admin/disputes/${disputeId}/resolve`, data),

  // Financial Reports
  getFinancialOverview: () => apiClient.get("/api/admin/financial/overview"),

  getFinancialByGroups: () => apiClient.get("/api/admin/financial/groups"),

  getPaymentStatistics: () => apiClient.get("/api/admin/financial/payments"),

  getExpenseAnalysis: () => apiClient.get("/api/admin/financial/expenses"),

  generateFinancialPdf: (params?: QueryParams) =>
    apiClient.get("/api/admin/financial/reports/pdf", {
      params,
      responseType: "blob",
    }),

  generateFinancialExcel: (params?: QueryParams) =>
    apiClient.get("/api/admin/financial/reports/excel", {
      params,
      responseType: "blob",
    }),

  // System Health
  getSystemHealth: () => apiClient.get("/api/admin/health"),

  getSystemMetrics: (minutes = 15) =>
    apiClient.get("/api/admin/metrics", { params: { minutes } }),

  // Audit Log
  getAuditLogs: (params: QueryParams = {}) =>
    apiClient.get("/api/admin/audit", { params }),

  // Maintenance
  getMaintenance: (params: QueryParams = {}) =>
    apiClient.get("/api/admin/maintenance", { params }),

  getMaintenanceDetails: (maintenanceId: Identifier) =>
    apiClient.get(`/api/admin/maintenance/${maintenanceId}`),

  createMaintenance: (data: Payload) =>
    apiClient.post("/api/admin/maintenance", data),

  updateMaintenance: (maintenanceId: Identifier, data: Payload) =>
    apiClient.put(`/api/admin/maintenance/${maintenanceId}`, data),
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
