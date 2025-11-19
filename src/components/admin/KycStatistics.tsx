import { useEffect, useState } from "react";
import { adminApi } from "@/utils/api";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/Loading";

interface KycStatistics {
  totalPending: number;
  totalUnderReview: number;
  totalApproved: number;
  totalRejected: number;
  totalRequiresUpdate: number;
  approvedToday: number;
  rejectedToday: number;
  approvedThisWeek: number;
  rejectedThisWeek: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  averageReviewTimeHours: number;
  documentsByType: Record<string, number>;
  documentsByStatus: Record<string, number>;
}

const KycStatistics = () => {
  const [statistics, setStatistics] = useState<KycStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getKycStatistics();
      setStatistics(response.data);
    } catch (err) {
      console.error("Error fetching KYC statistics:", err);
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <LoadingSpinner />
      </Card>
    );
  }

  if (error || !statistics) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-accent-terracotta">
            {error || "No statistics available"}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Status Overview */}
      <Card>
        <h3 className="text-sm font-medium text-neutral-600 mb-2">Pending</h3>
        <p className="text-3xl font-bold text-yellow-600">
          {statistics.totalPending}
        </p>
      </Card>
      <Card>
        <h3 className="text-sm font-medium text-neutral-600 mb-2">
          Under Review
        </h3>
        <p className="text-3xl font-bold text-blue-600">
          {statistics.totalUnderReview}
        </p>
      </Card>
      <Card>
        <h3 className="text-sm font-medium text-neutral-600 mb-2">Approved</h3>
        <p className="text-3xl font-bold text-green-600">
          {statistics.totalApproved}
        </p>
      </Card>
      <Card>
        <h3 className="text-sm font-medium text-neutral-600 mb-2">Rejected</h3>
        <p className="text-3xl font-bold text-red-600">
          {statistics.totalRejected}
        </p>
      </Card>

      {/* Today's Activity */}
      <Card>
        <h3 className="text-sm font-medium text-neutral-600 mb-2">
          Approved Today
        </h3>
        <p className="text-2xl font-bold text-green-600">
          {statistics.approvedToday}
        </p>
      </Card>
      <Card>
        <h3 className="text-sm font-medium text-neutral-600 mb-2">
          Rejected Today
        </h3>
        <p className="text-2xl font-bold text-red-600">
          {statistics.rejectedToday}
        </p>
      </Card>
      <Card>
        <h3 className="text-sm font-medium text-neutral-600 mb-2">This Week</h3>
        <div className="space-y-1">
          <p className="text-lg font-semibold text-green-600">
            Approved: {statistics.approvedThisWeek}
          </p>
          <p className="text-lg font-semibold text-red-600">
            Rejected: {statistics.rejectedThisWeek}
          </p>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-medium text-neutral-600 mb-2">
          This Month
        </h3>
        <div className="space-y-1">
          <p className="text-lg font-semibold text-green-600">
            Approved: {statistics.approvedThisMonth}
          </p>
          <p className="text-lg font-semibold text-red-600">
            Rejected: {statistics.rejectedThisMonth}
          </p>
        </div>
      </Card>

      {/* Average Review Time */}
      <Card className="md:col-span-2">
        <h3 className="text-sm font-medium text-neutral-600 mb-2">
          Average Review Time
        </h3>
        <p className="text-2xl font-bold text-neutral-800">
          {statistics.averageReviewTimeHours.toFixed(1)} hours
        </p>
      </Card>

      {/* Documents by Type */}
      <Card className="md:col-span-2">
        <h3 className="text-sm font-medium text-neutral-600 mb-4">
          Documents by Type
        </h3>
        <div className="space-y-2">
          {Object.entries(statistics.documentsByType).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <span className="text-neutral-700">{type}</span>
              <span className="font-semibold text-neutral-800">{count}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Documents by Status */}
      <Card className="md:col-span-2">
        <h3 className="text-sm font-medium text-neutral-600 mb-4">
          Documents by Status
        </h3>
        <div className="space-y-2">
          {Object.entries(statistics.documentsByStatus).map(
            ([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-neutral-700">{status}</span>
                <span className="font-semibold text-neutral-800">{count}</span>
              </div>
            )
          )}
        </div>
      </Card>
    </div>
  );
};

export default KycStatistics;
