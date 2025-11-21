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
   * GET /api/Payment/expenses?groupId={groupId}
   * Lấy danh sách chi phí của group (lọc theo groupId)
   */
  getVehicleExpenses: async (vehicleId: string, params: ExpenseQueryParams = {}): Promise<Expense[]> => {
    const response = await apiClient.get<any[]>('/Payment/expenses', { params })

    const expenseTypeMapping: { [key: number]: Expense['category'] } = {
      0: 'Charging', // Fuel -> Charging for EV context
      1: 'Maintenance',
      2: 'Insurance',
      3: 'Registration',
      4: 'Cleaning',
      5: 'Other', // Repair
      6: 'Other', // Upgrade
      7: 'Parking',
      8: 'Other', // Toll
      9: 'Other',
    }

    // Backend DTO is different from frontend Expense model, so we map it here.
    return response.data.map((dto: any) => ({
      id: dto.id,
      vehicleId: dto.vehicleId,
      category: expenseTypeMapping[dto.expenseType] || 'Other',
      totalAmount: dto.amount,
      yourShare: dto.amount, // Placeholder: Should be calculated based on user's share
      date: dto.dateIncurred, // The crucial mapping
      description: dto.description,
      status: 'Pending', // Placeholder: This should come from invoice status
      hasReceipt: false, // Placeholder
      addedBy: dto.createdBy,
      notes: dto.notes,
      createdAt: dto.createdAt,
      updatedAt: dto.createdAt, // Placeholder
    }))
  },

  /**
   * GET /api/Payment/expenses/{expenseId}
   * CHƯA CÓ Ở BACKEND - cần implement hoặc dùng filter từ getExpenses
   */
  getExpenseById: async (expenseId: string): Promise<Expense> => {
    const response = await apiClient.get<any>(`/Payment/expenses/${expenseId}`)
    const dto = response.data

    const expenseTypeMapping: { [key: number]: Expense['category'] } = {
      0: 'Charging', // Fuel -> Charging for EV context
      1: 'Maintenance',
      2: 'Insurance',
      3: 'Registration',
      4: 'Cleaning',
      5: 'Other', // Repair
      6: 'Other', // Upgrade
      7: 'Parking',
      8: 'Other', // Toll
      9: 'Other',
    }

    return {
      id: dto.id,
      vehicleId: dto.vehicleId,
      category: expenseTypeMapping[dto.expenseType] || 'Other',
      totalAmount: dto.amount,
      yourShare: dto.amount, // Placeholder
      date: dto.dateIncurred,
      description: dto.description,
      status: 'Pending', // Placeholder
      hasReceipt: false, // Placeholder
      addedBy: dto.createdBy,
      notes: dto.notes,
      createdAt: dto.createdAt,
      updatedAt: dto.createdAt, // Placeholder
    }
  },

  /**
   * POST /api/Payment/expenses
   * Thêm chi phí mới
   */
  createExpense: async (expenseData: CreateExpenseDto): Promise<Expense> => {
    
    const expenseTypeMapping: { [key: string]: number } = {
      'Charging': 0,
      'Maintenance': 1,
      'Insurance': 2,
      'Registration': 3,
      'Cleaning': 4,
      'Other': 9, 
      'Parking': 7,
    }

    const backendData = {
      groupId: expenseData.groupId,
      vehicleId: expenseData.vehicleId,
      expenseType: expenseTypeMapping[expenseData.category] ?? 9,
      amount: expenseData.amount,
      description: expenseData.description,
      dateIncurred: expenseData.date,
      notes: expenseData.notes,
      isRecurring: expenseData.isRecurring,
    };

    const response = await apiClient.post<Expense>('/Payment/expenses', backendData)
    // The response is an ExpenseDto from the backend, we need to map it back to the frontend Expense model
    const dto = response.data as any;

    const categoryMapping: { [key: number]: Expense['category'] } = {
        0: 'Charging', 1: 'Maintenance', 2: 'Insurance', 3: 'Registration', 4: 'Cleaning', 5: 'Other', 6: 'Other', 7: 'Parking', 8: 'Other', 9: 'Other',
    };
    
    return {
      id: dto.id,
      vehicleId: dto.vehicleId,
      category: categoryMapping[dto.expenseType] || 'Other',
      totalAmount: dto.amount,
      yourShare: dto.amount, // Placeholder
      date: dto.dateIncurred,
      description: dto.description,
      status: 'Pending', // Placeholder
      hasReceipt: false, // Placeholder
      addedBy: dto.createdBy,
      notes: dto.notes,
      createdAt: dto.createdAt,
      updatedAt: dto.createdAt, // Placeholder
    } as Expense;
  },

  /**
   * PUT /api/Payment/expenses/{expenseId}
   * CHƯA CÓ Ở BACKEND - cần implement
   */
  updateExpense: async (expenseId: string, expenseData: Partial<CreateExpenseDto>): Promise<Expense> => {
    throw new Error('Update expense not implemented in backend yet')
  },

  /**
   * DELETE /api/Payment/expenses/{expenseId}
   * CHƯA CÓ Ở BACKEND - cần implement
   */
  deleteExpense: async (expenseId: string): Promise<void> => {
    throw new Error('Delete expense not implemented in backend yet')
  },

  /**
   * GET /api/Payment/expenses - Summary tính từ client
   * BACKEND CHƯA CÓ SUMMARY ENDPOINT
   */
  getExpenseSummary: async (vehicleId: string, params: ExpenseQueryParams = {}): Promise<ExpenseSummary> => {
    // Lấy expenses rồi tính summary ở client
    const expenses = await expenseService.getVehicleExpenses(vehicleId, params)

    // Calculate summary from expenses
    const totalExpenses = expenses.reduce((sum, e: any) => sum + (e.amount || 0), 0)
    const yourShare = totalExpenses // TODO: Calculate based on ownership percentage
    const pendingPayments = 0 // TODO: Calculate from invoices

    return {
      totalExpenses,
      yourShare,
      pendingPayments,
      pendingCount: 0,
    } as ExpenseSummary
  },

  /**
   * POST /api/Payment/expenses/{expenseId}/receipt
   * CHƯA CÓ Ở BACKEND - cần implement
   */
  uploadReceipt: async (expenseId: string, formData: FormData): Promise<Expense> => {
    throw new Error('Upload receipt not implemented in backend yet')
  },

  // ============ INVOICES & PAYMENTS ============

  /**
   * GET /api/Payment/invoices?groupId={groupId}
   * Lấy danh sách invoices (hóa đơn cần thanh toán)
   */
  getInvoices: async (params: PaymentQueryParams = {}): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/Payment/invoices', { params })
    return response.data
  },

  /**
   * POST /api/Payment/vnpay/create-payment
   * Tạo VNPay payment URL
   */
  createPayment: async (paymentData: CreatePaymentDto): Promise<Payment> => {
    const response = await apiClient.post<Payment>('/Payment/vnpay/create-payment', paymentData)
    return response.data
  },

  /**
   * GET /api/Payment/vnpay/callback
   * VNPay callback handler (không cần gọi từ frontend)
   */

  // ============ LEGACY / NOT IMPLEMENTED ============

  /**
   * CHƯA CÓ Ở BACKEND
   */
  getPayments: async (params: PaymentQueryParams = {}): Promise<Payment[]> => {
    throw new Error('Get payments list not implemented in backend yet')
  },

  /**
   * CHƯA CÓ Ở BACKEND
   */
  getPaymentHistory: async (userId: string, params: PaymentQueryParams = {}): Promise<Payment[]> => {
    throw new Error('Get payment history not implemented in backend yet')
  },

  /**
   * CHƯA CÓ Ở BACKEND
   */
  confirmPayment: async (paymentId: string, confirmData: ConfirmPaymentDto): Promise<Payment> => {
    throw new Error('Confirm payment not implemented in backend yet')
  },

  /**
   * CHƯA CÓ Ở BACKEND
   */
  getPaymentMethods: async (userId: string): Promise<PaymentMethod[]> => {
    throw new Error('Get payment methods not implemented in backend yet')
  },

  /**
   * CHƯA CÓ Ở BACKEND
   */
  addPaymentMethod: async (userId: string, methodData: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> => {
    throw new Error('Add payment method not implemented in backend yet')
  },

  /**
   * CHƯA CÓ Ở BACKEND
   */
  deletePaymentMethod: async (userId: string, methodId: string): Promise<void> => {
    throw new Error('Delete payment method not implemented in backend yet')
  },

  // ============ COST ANALYTICS ============

  /**
   * Sử dụng vehicleService.getCostAnalysis() để lấy cost analytics
   * Đã có sẵn trong vehicleService
   */
}

export default expenseService
