import { useEffect, useState } from "react";
import { analyticsApi } from "@/utils/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/Loading";

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("30days"); // '7days', '30days', '90days', 'year'

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();

      switch (dateRange) {
        case "7days":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30days":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90days":
          startDate.setDate(startDate.getDate() - 90);
          break;
        case "year":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        period: "Monthly",
      };
      const response = await analyticsApi.getDashboard(params);
      setAnalytics(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">
          Analytics Dashboard
        </h1>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-neutral-50 border-2 border-neutral-200 rounded-md px-4 py-2 text-neutral-700 focus:outline-none focus:border-accent-blue"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="year">Last year</option>
          </select>
          <Button
            variant="secondary"
            onClick={() => {
              // Export analytics
            }}
          >
            Export
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-accent-terracotta/20 border border-accent-terracotta rounded-md p-4">
          <p className="text-accent-terracotta">{error}</p>
        </div>
      )}

      {analytics && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <h3 className="text-sm text-neutral-600 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-neutral-800">
                {analytics.totalUsers || 0}
              </p>
            </Card>
            <Card>
              <h3 className="text-sm text-neutral-600 mb-2">Active Groups</h3>
              <p className="text-3xl font-bold text-neutral-800">
                {analytics.totalGroups || 0}
              </p>
            </Card>
            <Card>
              <h3 className="text-sm text-neutral-600 mb-2">Total Bookings</h3>
              <p className="text-3xl font-bold text-neutral-800">
                {analytics.totalBookings || 0}
              </p>
            </Card>
            <Card>
              <h3 className="text-sm text-neutral-600 mb-2">Revenue</h3>
              <p className="text-3xl font-bold text-neutral-800">
                ${analytics.totalRevenue?.toFixed(2) || "0.00"}
              </p>
            </Card>
          </div>

          {/* Charts */}
          <Card>
            <h3 className="text-lg font-bold text-neutral-800 mb-4">
              Analytics Overview
            </h3>
            <div className="space-y-4">
              <p className="text-neutral-600">
                Charts and visualizations will be displayed here
              </p>
            </div>
          </Card>

          {/* Top Performers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <h3 className="text-lg font-bold text-neutral-800 mb-4">
                Top Vehicles
              </h3>
              <div className="space-y-2">
                {analytics.topVehicles?.slice(0, 5).map((vehicle, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-neutral-50 rounded-md"
                  >
                    <span className="text-sm font-medium text-neutral-800">
                      {vehicle.make} {vehicle.model}
                    </span>
                    <Badge variant="primary">{vehicle.bookings} bookings</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-bold text-neutral-800 mb-4">
                Top Users
              </h3>
              <div className="space-y-2">
                {analytics.topUsers?.slice(0, 5).map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-neutral-50 rounded-md"
                  >
                    <span className="text-sm font-medium text-neutral-800">
                      {user.name}
                    </span>
                    <Badge variant="primary">{user.bookings} bookings</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-bold text-neutral-800 mb-4">
                Top Groups
              </h3>
              <div className="space-y-2">
                {analytics.topGroups?.slice(0, 5).map((group, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-neutral-50 rounded-md"
                  >
                    <span className="text-sm font-medium text-neutral-800">
                      {group.name}
                    </span>
                    <Badge variant="primary">{group.revenue} revenue</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
