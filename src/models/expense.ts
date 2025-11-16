/**
 * Expense & Payment Types
 * Dựa trên backend Payment Service
 */

// Expense Category
export type ExpenseCategory =
  | 'Charging'
  | 'Maintenance'
  | 'Insurance'
  | 'Cleaning'
  | 'Parking'
  | 'Registration'
  | 'Other'

// Payment Status
export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue' | 'Failed' | 'Refunded'

// Payment Method
export type PaymentMethod = 'momo' | 'zalopay' | 'vnpay' | 'bank' | 'card'

// Split Method
export type SplitMethod = 'ownership' | 'usage' | 'custom'

// Member Share
export interface MemberShare {
  userId?: string
  name: string
  amount: number
  percentage: number
  paymentStatus: PaymentStatus
  paymentDate?: string
}

// Expense Interface
export interface Expense {
  id: string
  vehicleId: string
  category: ExpenseCategory
  totalAmount: number
  yourShare: number
  date: string
  description?: string
  status: PaymentStatus
  hasReceipt: boolean
  receipts?: Array<{
    id: string
    url: string
    type: 'image' | 'pdf'
  }>
  memberShares?: MemberShare[]
  splitMethod?: SplitMethod
  addedBy?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// Expense Summary
export interface ExpenseSummary {
  totalExpenses: number
  yourShare: number
  pendingPayments: number
  pendingCount?: number
}

// Create Expense DTO
export interface CreateExpenseDto {
  vehicleId: string
  category: ExpenseCategory
  amount: number
  date: string
  description: string
  splitMethod: SplitMethod
  customSplits?: Array<{
    userId: string
    percentage: number
  }>
}

// Payment
export interface Payment {
  id: string
  userId: string
  amount: number
  method: PaymentMethod
  methodName?: string
  status: PaymentStatus
  date: string
  description?: string
  expenseIds?: string[]
  paymentUrl?: string
  createdAt: string
  updatedAt: string
}

// Payment Summary
export interface PaymentSummary {
  totalPaid: number
  totalTransactions: number
  mostCommonCategory?: string
  successRate: number
}

// Create Payment DTO
export interface CreatePaymentDto {
  expenseIds: string[]
  amount: number
  method: PaymentMethod
  returnUrl: string
  cancelUrl: string
}

// Confirm Payment DTO
export interface ConfirmPaymentDto {
  transactionId: string
  status: PaymentStatus
}

// Cost Analysis Response
export interface CostAnalysisResponse {
  expenseBreakdown: Record<ExpenseCategory, number>
  totalCosts: {
    allTime: number
    thisMonth: number
    monthlyAverage: number
  }
  costPerUnit: {
    perKm: number
    perHour: number
    perTrip: number
    averageMonthly: number
  }
  costTrends: Array<{
    period: string
    totalCost: number
    breakdown: Record<ExpenseCategory, number>
  }>
  budgetComparison?: {
    budget: number
    actual: number
    variance: number
    variancePercentage: number
  }
  roi?: {
    costPerOwner: number
    savingsVsSolo: number
    savingsPercentage: number
  }
  suggestions?: Array<{
    title: string
    description: string
    potentialSaving?: number
  }>
}
