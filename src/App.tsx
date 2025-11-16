import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import Home from "@/pages/Home";
import BookingHub from "@/pages/booking/BookingHub";
import BookingCalendar from "@/pages/booking/BookingCalendar";
import CreateBooking from "@/pages/booking/CreateBooking";
import BookingDetails from "@/pages/booking/BookingDetails";
import CheckIn from "@/pages/booking/CheckIn";
import CheckOut from "@/pages/booking/CheckOut";
import ActiveTrip from "@/pages/booking/ActiveTrip";
import ExpensesPayments from "@/pages/booking/ExpensesPayments";
import TripHistory from "@/pages/booking/TripHistory";
import ReportIssue from "@/pages/booking/ReportIssue";
import AiRecommendations from "@/pages/booking/AiRecommendations";
import SuccessFeedback from "@/pages/booking/SuccessFeedback";
import GroupHub from "@/pages/group/GroupHub";
import GroupOverview from "@/pages/group/GroupOverview";
import MemberDetails from "@/pages/group/MemberDetails";
import SharedFund from "@/pages/group/SharedFund";
import Proposals from "@/pages/group/Proposals";
import ProposalDetails from "@/pages/group/ProposalDetails";
import CreateProposal from "@/pages/group/CreateProposal";
import StaffDashboard from "@/pages/admin/StaffDashboard";
import ManageGroups from "@/pages/admin/ManageGroups";
import ManageVehicles from "@/pages/admin/ManageVehicles";
import VehicleMaintenance from "@/pages/admin/VehicleMaintenance";
import CheckInOutManagement from "@/pages/admin/CheckInOutManagement";
import DisputeManagement from "@/pages/admin/DisputeManagement";
import FinancialReports from "@/pages/admin/FinancialReports";
import UserManagement from "@/pages/admin/UserManagement";
import KycDocumentReview from "@/pages/admin/KycDocumentReview";
import EContractTemplates from "@/pages/admin/EContractTemplates";
import SystemSettings from "@/pages/admin/SystemSettings";
import AnalyticsDashboard from "@/pages/admin/AnalyticsDashboard";
import AuditLog from "@/pages/admin/AuditLog";
import AiFairnessScore from "@/pages/admin/AiFairnessScore";
import AiBookingRecommendations from "@/pages/admin/AiBookingRecommendations";
import PredictiveMaintenance from "@/pages/admin/PredictiveMaintenance";
import CostOptimizationInsights from "@/pages/admin/CostOptimizationInsights";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import Home from '@/pages/Home'

// Auth Pages
import { Login, Register, EmailVerification } from '@/pages/auth'

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
import {
  BookingHub,
  BookingCalendar,
  CreateBooking,
  BookingDetails,
  CheckIn,
  CheckOut,
  ActiveTrip,
  TripHistory,
  ReportIssue,
  AiRecommendations,
  SuccessFeedback,
} from '@/pages/booking'

// Group Pages
import {
  GroupHub,
  GroupOverview,
  MemberDetails,
  SharedFund,
  Proposals,
  ProposalDetails,
  CreateProposal,
  GroupMarketplace,
  JoinGroupApplication,
  CreateGroup,
  MessageCenter,
} from '@/pages/group'

/**
 * Main App Component với React Router
 */
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/confirm-email" element={<EmailVerification />} />

        {/* Protected Routes */}
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
          <Route path="groups/marketplace" element={<GroupMarketplace />} />
          <Route path="groups/create" element={<CreateGroup />} />
          <Route path="groups/:groupId" element={<GroupOverview />} />
          <Route path="groups/:groupId/members/:memberId" element={<MemberDetails />} />
          <Route path="groups/:groupId/fund" element={<SharedFund />} />
          <Route path="groups/:groupId/proposals" element={<Proposals />} />
          <Route path="groups/:groupId/proposals/create" element={<CreateProposal />} />
          <Route path="groups/:groupId/proposals/:proposalId" element={<ProposalDetails />} />
          <Route path="groups/:groupId/apply" element={<JoinGroupApplication />} />
          <Route path="groups/:groupId/messages" element={<MessageCenter />} />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="groups" element={<ManageGroups />} />
          <Route path="vehicles" element={<ManageVehicles />} />
          <Route path="maintenance" element={<VehicleMaintenance />} />
          <Route path="checkins" element={<CheckInOutManagement />} />
          <Route path="disputes" element={<DisputeManagement />} />
          <Route path="financial-reports" element={<FinancialReports />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="kyc" element={<KycDocumentReview />} />
          <Route path="contracts" element={<EContractTemplates />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="audit" element={<AuditLog />} />
        </Route>
        <Route path="/admin/ai" element={<AdminLayout />}>
          <Route
            index
            element={
              <Navigate to="/admin/ai/booking-recommendations" replace />
            }
          />
          <Route
            path="booking-recommendations"
            element={<AiBookingRecommendations />}
          />
          <Route path="fairness-score" element={<AiFairnessScore />} />
          <Route
            path="predictive-maintenance"
            element={<PredictiveMaintenance />}
          />
          <Route
            path="cost-optimization"
            element={<CostOptimizationInsights />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
