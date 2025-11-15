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

// Booking Pages
import BookingHub from '@/pages/booking/BookingHub'
import BookingCalendar from '@/pages/booking/BookingCalendar'
import CreateBooking from '@/pages/booking/CreateBooking'
import BookingDetails from '@/pages/booking/BookingDetails'
import CheckIn from '@/pages/booking/CheckIn'
import CheckOut from '@/pages/booking/CheckOut'
import ActiveTrip from '@/pages/booking/ActiveTrip'
import TripHistory from '@/pages/booking/TripHistory'
import ReportIssue from '@/pages/booking/ReportIssue'
import AiRecommendations from '@/pages/booking/AiRecommendations'
import SuccessFeedback from '@/pages/booking/SuccessFeedback'

// Group Pages
import GroupHub from '@/pages/group/GroupHub'
import GroupOverview from '@/pages/group/GroupOverview'
import MemberDetails from '@/pages/group/MemberDetails'
import SharedFund from '@/pages/group/SharedFund'
import Proposals from '@/pages/group/Proposals'
import ProposalDetails from '@/pages/group/ProposalDetails'
import CreateProposal from '@/pages/group/CreateProposal'

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

          {/* Booking Routes */}
          <Route path="booking" element={<BookingHub />} />
          <Route path="booking/calendar" element={<BookingCalendar />} />
          <Route path="booking/create" element={<CreateBooking />} />
          <Route path="booking/details/:bookingId" element={<BookingDetails />} />
          <Route path="booking/check-in" element={<CheckIn />} />
          <Route path="booking/check-out" element={<CheckOut />} />
          <Route path="booking/active-trip" element={<ActiveTrip />} />
          <Route path="booking/trip-history" element={<TripHistory />} />
          <Route path="booking/report-issue" element={<ReportIssue />} />
          <Route path="booking/ai-recommendations" element={<AiRecommendations />} />
          <Route path="booking/success-feedback" element={<SuccessFeedback />} />

          {/* Group Routes */}
          <Route path="groups" element={<GroupHub />} />
          <Route path="groups/:groupId" element={<GroupOverview />} />
          <Route path="groups/:groupId/members/:memberId" element={<MemberDetails />} />
          <Route path="groups/:groupId/fund" element={<SharedFund />} />
          <Route path="groups/:groupId/proposals" element={<Proposals />} />
          <Route path="groups/:groupId/proposals/create" element={<CreateProposal />} />
          <Route path="groups/:groupId/proposals/:proposalId" element={<ProposalDetails />} />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
