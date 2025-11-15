import { useEffect, useState } from "react";
import { adminApi } from "@/utils/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/Loading";

const CheckInOutManagement = () => {
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("pending"); // 'pending', 'approved', 'rejected'

  useEffect(() => {
    fetchCheckIns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const fetchCheckIns = async () => {
    try {
      setLoading(true);
      const params = {
        status:
          tab === "pending"
            ? "Pending"
            : tab === "approved"
            ? "Approved"
            : "Rejected",
      };
      const response = await adminApi.getCheckIns(params);
      setCheckIns(response.data.checkIns || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching check-ins:", err);
      setError("Failed to load check-ins");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (checkInId) => {
    try {
      await adminApi.approveCheckIn(checkInId, {});
      fetchCheckIns();
    } catch (err) {
      console.error("Error approving check-in:", err);
      alert("Failed to approve check-in");
    }
  };

  const handleReject = async (checkInId, reason) => {
    try {
      await adminApi.rejectCheckIn(checkInId, { reason });
      fetchCheckIns();
    } catch (err) {
      console.error("Error rejecting check-in:", err);
      alert("Failed to reject check-in");
    }
  };

  if (loading && checkIns.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">
        Check-In/Out Management
      </h1>

      <div className="flex gap-2 border-b border-neutral-200">
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-2 font-medium ${
            tab === "pending"
              ? "text-accent-blue border-b-2 border-accent-blue"
              : "text-neutral-600 hover:text-neutral-800"
          }`}
        >
          Pending ({checkIns.filter((c) => c.status === "Pending").length})
        </button>
        <button
          onClick={() => setTab("approved")}
          className={`px-4 py-2 font-medium ${
            tab === "approved"
              ? "text-accent-blue border-b-2 border-accent-blue"
              : "text-neutral-600 hover:text-neutral-800"
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setTab("rejected")}
          className={`px-4 py-2 font-medium ${
            tab === "rejected"
              ? "text-accent-blue border-b-2 border-accent-blue"
              : "text-neutral-600 hover:text-neutral-800"
          }`}
        >
          Rejected
        </button>
      </div>

      {error && (
        <div className="bg-accent-terracotta/20 border border-accent-terracotta rounded-md p-4">
          <p className="text-accent-terracotta">{error}</p>
        </div>
      )}

      <Card>
        <div className="space-y-4">
          {checkIns.map((checkIn) => (
            <div
              key={checkIn.id}
              className="border border-neutral-200 rounded-md p-4 hover:bg-neutral-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold text-neutral-800">
                      {checkIn.userName}
                    </h3>
                    <Badge
                      variant={
                        checkIn.status === "Approved"
                          ? "success"
                          : checkIn.status === "Rejected"
                          ? "error"
                          : "warning"
                      }
                    >
                      {checkIn.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-600">Vehicle:</span>
                      <p className="font-medium text-neutral-800">
                        {checkIn.vehicleMake} {checkIn.vehicleModel}
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-600">Check-in Time:</span>
                      <p className="font-medium text-neutral-800">
                        {new Date(checkIn.checkInTime).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-600">Odometer:</span>
                      <p className="font-medium text-neutral-800">
                        {checkIn.odometerReading} km
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-600">Battery:</span>
                      <p className="font-medium text-neutral-800">
                        {checkIn.batteryPercentage}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {checkIn.status === "Pending" && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleApprove(checkIn.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="error"
                        size="sm"
                        onClick={() => {
                          const reason = prompt("Reason for rejection:");
                          if (reason) {
                            handleReject(checkIn.id, reason);
                          }
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      // View details
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && checkIns.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-600">No check-ins found</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CheckInOutManagement;
