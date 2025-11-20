import { useEffect, useState } from "react";
import { adminApi } from "@/utils/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/Loading";

const VehicleMaintenance = () => {
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("list"); // 'list' or 'calendar'

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const fetchMaintenance = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getMaintenance({});
      setMaintenance(response.data.maintenance || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching maintenance:", err);
      setError("Failed to load maintenance data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Scheduled: { variant: "warning", label: "Scheduled" },
      InProgress: { variant: "primary", label: "In Progress" },
      Completed: { variant: "success", label: "Completed" },
      Overdue: { variant: "error", label: "Overdue" },
    };
    const statusInfo = statusMap[status] || {
      variant: "default",
      label: status,
    };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading && maintenance.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">
          Vehicle Maintenance
        </h1>
        <div className="flex gap-2">
          <Button
            variant={view === "list" ? "accent" : "secondary"}
            onClick={() => setView("list")}
          >
            List View
          </Button>
          <Button
            variant={view === "calendar" ? "accent" : "secondary"}
            onClick={() => setView("calendar")}
          >
            Calendar View
          </Button>
          <Button variant="accent">Add Service</Button>
        </div>
      </div>

      {error && (
        <div className="bg-accent-terracotta/20 border border-accent-terracotta rounded-md p-4">
          <p className="text-accent-terracotta">{error}</p>
        </div>
      )}

      {view === "list" ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Vehicle
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Service Type
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Cost
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {maintenance.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-neutral-200 hover:bg-neutral-50"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-neutral-800">
                          {item.vehicleMake} {item.vehicleModel}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {item.vehiclePlate}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-neutral-700">
                        {item.serviceType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-neutral-700">
                        {new Date(item.scheduledDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-neutral-800">
                        ${item.cost?.toFixed(2) || "0.00"}
                      </span>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            // View details
                          }}
                        >
                          View
                        </Button>
                        {item.status === "Scheduled" && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => {
                              // Mark complete
                            }}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && maintenance.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-600">No maintenance records found</p>
            </div>
          )}
        </Card>
      ) : (
        <Card>
          <div className="text-center py-12">
            <p className="text-neutral-600">Calendar view coming soon</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default VehicleMaintenance;
