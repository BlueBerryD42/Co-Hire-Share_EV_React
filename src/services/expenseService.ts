import apiClient from './api'
import type {
  Expense,
  Payment,
  ExpenseSummary,
  PaymentSummary,
  CreateExpenseDto,
  CreatePaymentDto,
  ConfirmPaymentDto,
} from '@/models/expense'

/**
 * Expense Service - API calls cho expenses và payments
 * Tích hợp với Payment Service backend
 */

interface ExpenseQueryParams {
  category?: string
  status?: string
  dateRange?: string
  startDate?: string
  endDate?: string
}

interface PaymentQueryParams {
  status?: string
  method?: string
  startDate?: string
  endDate?: string
}

interface PaymentMethod {
  id: string
  method: string
  details: Record<string, any>
}

const expenseService = {
  /**
   * GET - Lấy danh sách chi phí của xe
   * Filters: category, status, dateRange
   */
  getVehicleExpenses: async (vehicleId: string, params: ExpenseQueryParams = {}): Promise<Expense[]> => {
    const response = await apiClient.get<Expense[]>(`/expenses/vehicle/${vehicleId}`, { params })
    return response.data
  },

  /**
   * GET - Lấy chi tiết một chi phí
   */
  getExpenseById: async (expenseId: string): Promise<Expense> => {
    const response = await apiClient.get<Expense>(`/expenses/${expenseId}`)
    return response.data
  },

  /**
   * POST - Thêm chi phí mới
   */
  createExpense: async (expenseData: CreateExpenseDto): Promise<Expense> => {
    const response = await apiClient.post<Expense>('/expenses', expenseData)
    return response.data
  },

  /**
   * PUT - Cập nhật chi phí
   */
  updateExpense: async (expenseId: string, expenseData: Partial<CreateExpenseDto>): Promise<Expense> => {
    const response = await apiClient.put<Expense>(`/expenses/${expenseId}`, expenseData)
    return response.data
  },

  /**
   * DELETE - Xóa chi phí
   */
  deleteExpense: async (expenseId: string): Promise<void> => {
    const response = await apiClient.delete(`/expenses/${expenseId}`)
    return response.data
  },

  /**
   * GET - Lấy tóm tắt chi phí theo tháng
   */
  getExpenseSummary: async (vehicleId: string, params: ExpenseQueryParams = {}): Promise<ExpenseSummary> => {
    const response = await apiClient.get<ExpenseSummary>(`/expenses/vehicle/${vehicleId}/summary`, { params })
    return response.data
  },

  /**
   * POST - Upload receipt/hóa đơn
   */
  uploadReceipt: async (expenseId: string, formData: FormData): Promise<Expense> => {
    const response = await apiClient.post<Expense>(`/expenses/${expenseId}/receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // ============ PAYMENTS ============

  /**
   * GET - Lấy danh sách thanh toán
   */
  getPayments: async (params: PaymentQueryParams = {}): Promise<Payment[]> => {
    const response = await apiClient.get<Payment[]>('/payments', { params })
    return response.data
  },

  /**
   * GET - Lấy lịch sử thanh toán
   */
  getPaymentHistory: async (userId: string, params: PaymentQueryParams = {}): Promise<Payment[]> => {
    const response = await apiClient.get<Payment[]>(`/payments/user/${userId}/history`, { params })
    return response.data
  },

  /**
   * POST - Tạo payment intent (để thanh toán)
   */
  createPayment: async (paymentData: CreatePaymentDto): Promise<Payment> => {
    const response = await apiClient.post<Payment>('/payments', paymentData)
    return response.data
  },

  /**
   * POST - Xác nhận thanh toán
   */
  confirmPayment: async (paymentId: string, confirmData: ConfirmPaymentDto): Promise<Payment> => {
    const response = await apiClient.post<Payment>(`/payments/${paymentId}/confirm`, confirmData)
    return response.data
  },

  /**
   * GET - Lấy payment methods đã lưu
   */
  getPaymentMethods: async (userId: string): Promise<PaymentMethod[]> => {
    const response = await apiClient.get<PaymentMethod[]>(`/users/${userId}/payment-methods`)
    return response.data
  },

  /**
   * POST - Thêm payment method mới
   */
  addPaymentMethod: async (userId: string, methodData: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> => {
    const response = await apiClient.post<PaymentMethod>(`/users/${userId}/payment-methods`, methodData)
    return response.data
  },

  /**
   * DELETE - Xóa payment method
   */
  deletePaymentMethod: async (userId: string, methodId: string): Promise<void> => {
    const response = await apiClient.delete(`/users/${userId}/payment-methods/${methodId}`)
    return response.data
  },

  // ============ COST ANALYTICS ============

  /**
   * Sử dụng vehicleService.getCostAnalysis() để lấy cost analytics
   * Đã có sẵn trong vehicleService
   */
}

export default expenseService
