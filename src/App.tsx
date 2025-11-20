import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCurrentUser } from "@/store/slices/authSlice";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import GroupLayout from "@/layouts/GroupLayout";
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";

// Auth Pages
import { Login, Register, EmailVerification, CorrectEmail, ForgotPassword, ResetPassword } from "@/pages/auth";

// Vehicle Pages
import {
  MyVehicles,
  CreateVehicle,
  VehicleDetails,
  ExpensesPayments as VehicleExpensesPayments,
  ExpenseDetails,
  AddExpense,
  PaymentScreen,
  PaymentHistory,
  CostAnalytics,
} from "@/pages/vehicle";

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
} from "@/pages/booking";

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
  Documents,
  DocumentViewer,
  DocumentSigning,
  DocumentSigningDashboard,
  SignDocument,
  MyPendingSignatures,
} from "@/pages/group";

// Admin Pages
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

/**
 * Component để load user data khi app khởi động và redirect admins
 */
const AuthInitializer = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, token, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Nếu có token nhưng chưa có user data, load user data
    if (token && !user && isAuthenticated) {
      dispatch(getCurrentUser());
    }
    // Nếu có token trong localStorage/cookies nhưng chưa authenticated, thử load user
    else if (token && !isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, user, isAuthenticated]);

  // Redirect admins to admin dashboard if they're on home page
  useEffect(() => {
    if (isAuthenticated && user && location.pathname === '/') {
      // UserRole: SystemAdmin = 0, Staff = 1, GroupAdmin = 2, CoOwner = 3
      if (user.role === 0 || user.role === 1) {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  return null;
};

/**
 * Main App Component với React Router
 */
const App = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthInitializer />
        <Routes>


          <Route path="/" element={<Landing />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/confirm-email" element={<EmailVerification />} />
          <Route path="/correct-email" element={<CorrectEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes - All use MainLayout but are top-level */}
          <Route element={<MainLayout />}>
            {/* Home Dashboard */}
            <Route path="/home" element={<Home />} />

            {/* Vehicle Routes */}
            <Route path="/vehicles">
              <Route index element={<MyVehicles />} />
              <Route path="create" element={<CreateVehicle />} />
              <Route path=":id" element={<VehicleDetails />} />

              {/* Expenses & Payments */}
              <Route path=":vehicleId/expenses">
                <Route index element={<VehicleExpensesPayments />} />
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
            <Route path="/booking" element={<BookingHub />} />
            <Route path="/booking/calendar" element={<BookingCalendar />} />
            <Route path="/booking/create" element={<CreateBooking />} />
            <Route
              path="/booking/details/:bookingId"
              element={<BookingDetails />}
            />
            <Route path="/booking/check-in" element={<CheckIn />} />
            <Route path="/booking/check-out" element={<CheckOut />} />
            <Route path="/booking/active-trip" element={<ActiveTrip />} />
            <Route path="/booking/trip-history" element={<TripHistory />} />
            <Route path="/booking/report-issue" element={<ReportIssue />} />
            <Route
              path="/booking/ai-recommendations"
              element={<AiRecommendations />}
            />
            <Route
              path="/booking/success-feedback"
              element={<SuccessFeedback />}
            />

            {/* Group Routes - All wrapped in GroupLayout */}
            <Route path="/groups" element={<GroupLayout />}>
              <Route index element={<GroupHub />} />
              <Route path="marketplace" element={<GroupMarketplace />} />
              <Route path="create" element={<CreateGroup />} />
              <Route path="my-pending-signatures" element={<MyPendingSignatures />} />
              <Route path=":groupId" element={<GroupOverview />} />
              <Route
                path=":groupId/members/:memberId"
                element={<MemberDetails />}
              />
              <Route path=":groupId/fund" element={<SharedFund />} />
              <Route path=":groupId/proposals" element={<Proposals />} />
              <Route
                path=":groupId/proposals/create"
                element={<CreateProposal />}
              />
              <Route
                path=":groupId/proposals/:proposalId"
                element={<ProposalDetails />}
              />
              <Route
                path=":groupId/apply"
                element={<JoinGroupApplication />}
              />
              <Route
                path=":groupId/messages"
                element={<MessageCenter />}
              />
              <Route
                path=":groupId/documents"
                element={<Documents />}
              />
              <Route
                path=":groupId/documents/:documentId"
                element={<DocumentViewer />}
              />
              <Route
                path=":groupId/documents/:documentId/sign"
                element={<SignDocument />}
              />
              <Route
                path=":groupId/signing"
                element={<DocumentSigningDashboard />}
              />
            </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
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
              path="fairness-score/:groupId"
              element={<AiFairnessScore />}
            />
            <Route
              path="predictive-maintenance"
              element={<PredictiveMaintenance />}
            />
            <Route
              path="predictive-maintenance/:vehicleId"
              element={<PredictiveMaintenance />}
            />
            <Route
              path="cost-optimization"
              element={<CostOptimizationInsights />}
            />
            <Route
              path="cost-optimization/:groupId"
              element={<CostOptimizationInsights />}
            />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
