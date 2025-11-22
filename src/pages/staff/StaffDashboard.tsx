import { useEffect, useState } from "react";
import { adminApi } from "@/utils/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/Loading";
import { Link } from "react-router-dom";
import {
  Description,
  Warning,
  Groups,
  DirectionsCar,
  Assessment,
  PendingActions,
} from "@mui/icons-material";
import { Alert, AlertTitle } from "@mui/material";
import { useAppSelector } from "@/store/hooks";
import { isStaffOrAdmin } from "@/utils/roles";
import Unauthorized from "@/components/auth/Unauthorized";
import { groupApi } from "@/services/group/groups";
import vehicleService from "@/services/vehicleService";

interface DashboardData {
  users?: {
    totalUsers?: number;
    activeUsers?: number;
    pendingKyc?: number;
    userGrowthPercentage?: number;
  };
  groups?: {
    totalGroups?: number;
    activeGroups?: number;
    inactiveGroups?: number;
    groupGrowthPercentage?: number;
  };
  vehicles?: {
    totalVehicles?: number;
    availableVehicles?: number;
    inUseVehicles?: number;
    maintenanceVehicles?: number;
  };
  bookings?: {
    totalBookings?: number;
    activeBookings?: number;
    completedBookings?: number;
    cancelledBookings?: number;
  };
  revenue?: {
    totalRevenue?: number;
    monthlyRevenue?: number;
    revenueGrowthPercentage?: number;
  };
  systemHealth?: {
    overallStatus?: string;
    databaseStatus?: string;
    apiGatewayStatus?: string;
  };
  recentActivity?: Array<{
    title: string;
    timestamp: string;
    icon?: string;
  }>;
  alerts?: Array<{
    message: string;
  }>;
  disputes?: {
    openDisputes?: number;
  };
}

const StaffDashboard = () => {
  const { user } = useAppSelector((state) => state.auth);

  // Role check - Staff or Admin only
  if (!isStaffOrAdmin(user)) {
    return <Unauthorized requiredRole="Staff or SystemAdmin" />;
  }

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingGroupsCount, setPendingGroupsCount] = useState(0);
  const [pendingVehiclesCount, setPendingVehiclesCount] = useState(0);

  useEffect(() => {
    fetchDashboard();
    fetchPendingCounts();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDashboard({
        period: "Monthly",
        includeGrowthMetrics: true,
        includeAlerts: true,
      });
      setDashboard(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCounts = async () => {
    try {
      const [pendingGroups, pendingVehicles] = await Promise.all([
        groupApi.getPendingGroups().catch(() => []),
        vehicleService.getPendingVehicles().catch(() => []),
      ]);
      setPendingGroupsCount(pendingGroups.length);
      setPendingVehiclesCount(pendingVehicles.length);
    } catch (err) {
      console.error("Error fetching pending counts:", err);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-accent-terracotta">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-accent-blue text-white rounded-md hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dashboard) {
    return <div className="text-center py-12">No data available</div>;
  }

  const {
    users,
    groups,
    vehicles,
    bookings,
    revenue,
    systemHealth,
    recentActivity,
    alerts,
  } = dashboard;

  // Filter out maintenance-related alerts
  const filteredAlerts =
    alerts?.filter(
      (alert) =>
        !alert.message?.toLowerCase().includes("maintenance") &&
        !alert.message?.toLowerCase().includes("require maintenance")
    ) || [];

  return (
    <div className="space-y-6">
      {/* Alerts Banner */}
      {filteredAlerts.length > 0 && (
        <Alert
          severity="warning"
          sx={{
            bgcolor: "var(--accent-gold)",
            color: "var(--neutral-800)",
            border: "1px solid var(--accent-gold)",
            "& .MuiAlert-icon": {
              color: "var(--neutral-800)",
            },
          }}
        >
          <AlertTitle sx={{ fontWeight: 600, color: "var(--neutral-800)" }}>
            Alerts
          </AlertTitle>
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            {filteredAlerts.map((alert, index: number) => (
              <li key={index} style={{ marginBottom: "8px" }}>
                {alert.message}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Pending Groups</p>
              <p className="text-2xl font-bold text-neutral-800">
                {pendingGroupsCount}
              </p>
            </div>
            <PendingActions
              sx={{ fontSize: 32, color: "var(--accent-blue)" }}
            />
          </div>
          <Link
            to="/admin/groups"
            className="mt-4 text-sm text-accent-blue hover:underline"
          >
            Review Groups →
          </Link>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Pending Vehicles</p>
              <p className="text-2xl font-bold text-neutral-800">
                {pendingVehiclesCount}
              </p>
            </div>
            <PendingActions
              sx={{ fontSize: 32, color: "var(--accent-blue)" }}
            />
          </div>
          <Link
            to="/admin/vehicles"
            className="mt-4 text-sm text-accent-blue hover:underline"
          >
            Review Vehicles →
          </Link>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Pending KYC</p>
              <p className="text-2xl font-bold text-neutral-800">
                {users?.pendingKyc || 0}
              </p>
            </div>
            <Description sx={{ fontSize: 32, color: "var(--accent-blue)" }} />
          </div>
          <Link
            to="/admin/kyc"
            className="mt-4 text-sm text-accent-blue hover:underline"
          >
            Review KYC →
          </Link>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Open Disputes</p>
              <p className="text-2xl font-bold text-neutral-800">
                {dashboard.disputes?.openDisputes || 0}
              </p>
            </div>
            <Warning sx={{ fontSize: 32, color: "var(--accent-gold)" }} />
          </div>
          <Link
            to="/admin/disputes"
            className="mt-4 text-sm text-accent-blue hover:underline"
          >
            Manage Disputes →
          </Link>
        </Card>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Metrics */}
        <Card>
          <h3 className="text-lg font-bold text-neutral-800 mb-4">Users</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Total Users</span>
              <span className="font-semibold text-neutral-800">
                {users?.totalUsers || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Active Users</span>
              <Badge variant="success">{users?.activeUsers || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Pending KYC</span>
              <Badge variant="warning">{users?.pendingKyc || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">User Growth</span>
              <span
                className={`font-semibold ${
                  users?.userGrowthPercentage >= 0
                    ? "text-accent-green"
                    : "text-accent-terracotta"
                }`}
              >
                {users?.userGrowthPercentage?.toFixed(1)}%
              </span>
            </div>
          </div>
          <Link
            to="/admin/users"
            className="mt-4 inline-block text-sm text-accent-blue hover:underline"
          >
            Manage Users →
          </Link>
        </Card>

        {/* Groups Metrics */}
        <Card>
          <h3 className="text-lg font-bold text-neutral-800 mb-4">Groups</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Total Groups</span>
              <span className="font-semibold text-neutral-800">
                {groups?.totalGroups || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Active Groups</span>
              <Badge variant="success">{groups?.activeGroups || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Inactive Groups</span>
              <Badge variant="warning">{groups?.inactiveGroups || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Group Growth</span>
              <span
                className={`font-semibold ${
                  groups?.groupGrowthPercentage >= 0
                    ? "text-accent-green"
                    : "text-accent-terracotta"
                }`}
              >
                {groups?.groupGrowthPercentage?.toFixed(1)}%
              </span>
            </div>
          </div>
          <Link
            to="/admin/groups"
            className="mt-4 inline-block text-sm text-accent-blue hover:underline"
          >
            Manage Groups →
          </Link>
        </Card>

        {/* Vehicles Metrics */}
        <Card>
          <h3 className="text-lg font-bold text-neutral-800 mb-4">Vehicles</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Total Vehicles</span>
              <span className="font-semibold text-neutral-800">
                {vehicles?.totalVehicles || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Available</span>
              <Badge variant="success">
                {vehicles?.availableVehicles || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">In Use</span>
              <Badge variant="primary">{vehicles?.inUseVehicles || 0}</Badge>
            </div>
          </div>
          <Link
            to="/admin/vehicles"
            className="mt-4 inline-block text-sm text-accent-blue hover:underline"
          >
            Manage Vehicles →
          </Link>
        </Card>

        {/* Bookings Metrics */}
        <Card>
          <h3 className="text-lg font-bold text-neutral-800 mb-4">Bookings</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Total Bookings</span>
              <span className="font-semibold text-neutral-800">
                {bookings?.totalBookings || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Active</span>
              <Badge variant="primary">{bookings?.activeBookings || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Completed</span>
              <Badge variant="success">
                {bookings?.completedBookings || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Cancelled</span>
              <Badge variant="error">{bookings?.cancelledBookings || 0}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Metrics */}
      {revenue && (
        <Card>
          <h3 className="text-lg font-bold text-neutral-800 mb-4">Revenue</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-neutral-600">Total Revenue</p>
              <p className="text-2xl font-bold text-neutral-800">
                ${revenue.totalRevenue?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">This Month</p>
              <p className="text-2xl font-bold text-accent-green">
                ${revenue.monthlyRevenue?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Growth</p>
              <p
                className={`text-2xl font-bold ${
                  revenue.revenueGrowthPercentage >= 0
                    ? "text-accent-green"
                    : "text-accent-terracotta"
                }`}
              >
                {revenue.revenueGrowthPercentage?.toFixed(1)}%
              </p>
            </div>
          </div>
          <Link
            to="/admin/financial-reports"
            className="mt-4 inline-block text-sm text-accent-blue hover:underline"
          >
            View Financial Reports →
          </Link>
        </Card>
      )}

      {/* System Health */}
      {systemHealth && (
        <Card>
          <h3 className="text-lg font-bold text-neutral-800 mb-4">
            System Health
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Overall Status</span>
              <Badge
                variant={
                  systemHealth.overallStatus === "Healthy"
                    ? "success"
                    : "warning"
                }
              >
                {systemHealth.overallStatus}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Database</span>
              <Badge
                variant={
                  systemHealth.databaseStatus === "Connected"
                    ? "success"
                    : "error"
                }
              >
                {systemHealth.databaseStatus}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">API Gateway</span>
              <Badge
                variant={
                  systemHealth.apiGatewayStatus === "Operational"
                    ? "success"
                    : "error"
                }
              >
                {systemHealth.apiGatewayStatus}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-neutral-800 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-2">
            {recentActivity.map(
              (
                activity: { title: string; timestamp: string; icon?: string },
                index: number
              ) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-neutral-50 rounded-md"
                >
                  <Assessment
                    sx={{ fontSize: 24, color: "var(--neutral-600)" }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-800">
                      {activity.title}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-bold text-neutral-800 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/groups"
            className="p-4 bg-neutral-100 hover:bg-neutral-200 rounded-md text-center transition-colors"
          >
            <Groups sx={{ fontSize: 32, color: "var(--accent-blue)", mb: 1 }} />
            <p className="text-sm font-medium text-neutral-700">
              Manage Groups
            </p>
          </Link>
          <Link
            to="/admin/vehicles"
            className="p-4 bg-neutral-100 hover:bg-neutral-200 rounded-md text-center transition-colors"
          >
            <DirectionsCar
              sx={{ fontSize: 32, color: "var(--accent-blue)", mb: 1 }}
            />
            <p className="text-sm font-medium text-neutral-700">
              Manage Vehicles
            </p>
          </Link>
          <Link
            to="/admin/kyc"
            className="p-4 bg-neutral-100 hover:bg-neutral-200 rounded-md text-center transition-colors"
          >
            <Description
              sx={{ fontSize: 32, color: "var(--accent-blue)", mb: 1 }}
            />
            <p className="text-sm font-medium text-neutral-700">Review KYC</p>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default StaffDashboard;
