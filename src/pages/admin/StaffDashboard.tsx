import { useEffect, useState } from "react";
import { adminApi } from "@/utils/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/Loading";
import { Link } from "react-router-dom";

const StaffDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
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

  return (
    <div className="space-y-6">
      {/* Alerts Banner */}
      {alerts && alerts.length > 0 && (
        <div className="bg-accent-gold/20 border border-accent-gold rounded-md p-4">
          <h3 className="font-semibold text-neutral-800 mb-2">Alerts</h3>
          <ul className="space-y-2">
            {alerts.map((alert, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="text-accent-gold">⚠️</span>
                <span className="text-neutral-700">{alert.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Active Bookings</p>
              <p className="text-2xl font-bold text-neutral-800">
                {bookings?.activeBookings || 0}
              </p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
          <Link
            to="/admin/checkins"
            className="mt-4 text-sm text-accent-blue hover:underline"
          >
            View Check-ins →
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
            <div className="text-3xl">📄</div>
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
            <div className="text-3xl">⚠️</div>
          </div>
          <Link
            to="/admin/disputes"
            className="mt-4 text-sm text-accent-blue hover:underline"
          >
            Manage Disputes →
          </Link>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">
                Vehicles in Maintenance
              </p>
              <p className="text-2xl font-bold text-neutral-800">
                {vehicles?.maintenanceVehicles || 0}
              </p>
            </div>
            <div className="text-3xl">🔧</div>
          </div>
          <Link
            to="/admin/maintenance"
            className="mt-4 text-sm text-accent-blue hover:underline"
          >
            View Maintenance →
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
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Maintenance</span>
              <Badge variant="warning">
                {vehicles?.maintenanceVehicles || 0}
              </Badge>
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
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-neutral-50 rounded-md"
              >
                <span className="text-xl">{activity.icon || "📋"}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-800">
                    {activity.title}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
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
            <div className="text-2xl mb-2">👥</div>
            <p className="text-sm font-medium text-neutral-700">
              Manage Groups
            </p>
          </Link>
          <Link
            to="/admin/vehicles"
            className="p-4 bg-neutral-100 hover:bg-neutral-200 rounded-md text-center transition-colors"
          >
            <div className="text-2xl mb-2">🚗</div>
            <p className="text-sm font-medium text-neutral-700">
              Manage Vehicles
            </p>
          </Link>
          <Link
            to="/admin/checkins"
            className="p-4 bg-neutral-100 hover:bg-neutral-200 rounded-md text-center transition-colors"
          >
            <div className="text-2xl mb-2">✅</div>
            <p className="text-sm font-medium text-neutral-700">
              Review Check-ins
            </p>
          </Link>
          <Link
            to="/admin/kyc"
            className="p-4 bg-neutral-100 hover:bg-neutral-200 rounded-md text-center transition-colors"
          >
            <div className="text-2xl mb-2">📄</div>
            <p className="text-sm font-medium text-neutral-700">Review KYC</p>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default StaffDashboard;
