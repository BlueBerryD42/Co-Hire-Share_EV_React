import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import Home from '@/pages/Home'

// Vehicle Pages
import {
  MyVehicles,
  VehicleDetails,
  ExpensesPayments,
  ExpenseDetails,
  AddExpense,
  PaymentScreen,
  PaymentHistory,
  CostAnalytics,
} from '@/pages/vehicle'

/**
 * Main App Component với React Router
 */
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Layout Routes */}
        <Route path="/" element={<MainLayout />}>
          {/* Home */}
          <Route index element={<Home />} />

          {/* Vehicle Routes */}
          <Route path="vehicles">
            <Route index element={<MyVehicles />} />
            <Route path=":id" element={<VehicleDetails />} />

            {/* Expenses & Payments */}
            <Route path=":vehicleId/expenses">
              <Route index element={<ExpensesPayments />} />
              <Route path="add" element={<AddExpense />} />
              <Route path=":expenseId" element={<ExpenseDetails />} />
            </Route>

            {/* Payments */}
            <Route path=":vehicleId/payments">
              <Route index element={<PaymentScreen />} />
              <Route path="history" element={<PaymentHistory />} />
            </Route>

            {/* Analytics */}
            <Route path=":vehicleId/analytics" element={<CostAnalytics />} />
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
