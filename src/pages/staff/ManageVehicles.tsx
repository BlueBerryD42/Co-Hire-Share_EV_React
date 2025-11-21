import { useEffect, useState, useRef } from "react";
import { adminApi } from "@/utils/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/Loading";

interface Vehicle {
  id: string;
  vin: string;
  plateNumber: string;
  model: string;
  year: number;
  color?: string | null;
  status: number | string;
  lastServiceDate?: string | null;
  odometer: number;
  groupId?: string | null;
  groupName?: string | null;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string | null;
  submittedAt?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
}

const ManageVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const searchTimeoutRef = useRef<number | null>(null);
  const isInitialMount = useRef(true);

  // Debounced search effect
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      setAppliedSearch(search);
    }, 500); // 500ms debounce

    // Cleanup on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search]);

  // Fetch vehicles when filters change
  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, appliedSearch]);

  const fetchVehicles = async () => {
    const isFirstLoad = isInitialMount.current;

    try {
      // On initial load, show full page spinner
      if (isFirstLoad) {
        setInitialLoading(true);
        isInitialMount.current = false;
      } else {
        // On subsequent fetches (filter changes), only show overlay
        // Don't clear vehicles, keep showing previous data while fetching
        setIsFetching(true);
      }
      setError(null);

      const params = {
        search: appliedSearch || undefined,
        status: statusFilter || undefined,
      };
      const response = await adminApi.getVehicles(params);
      // Only update vehicles when we have the new data
      setVehicles(response.data.vehicles || []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("Failed to load vehicles");
      // Only clear vehicles on error if this is the initial load
      if (isFirstLoad) {
        setVehicles([]);
      }
      // Otherwise, keep showing previous data on error
    } finally {
      setInitialLoading(false);
      setIsFetching(false);
    }
  };

  const handleApplyFilters = () => {
    // Immediately apply search without waiting for debounce
    setAppliedSearch(search);
  };

  // Map numeric status to string label
  const getStatusLabel = (status: number | string): string => {
    // Handle both numeric and string status values
    const statusNum =
      typeof status === "number" ? status : parseInt(String(status), 10);

    const statusMap: Record<number, string> = {
      0: "Pending Approval",
      1: "Available",
      2: "In Use",
      3: "Maintenance",
      4: "Unavailable",
      5: "Rejected",
    };

    // If status is a string name, try to match it directly
    if (isNaN(statusNum) && typeof status === "string") {
      return status;
    }

    return statusMap[statusNum] || "Unknown";
  };

  const getStatusBadge = (status: number | string) => {
    // Handle both numeric and string status values
    const statusNum =
      typeof status === "number" ? status : parseInt(String(status), 10);
    const statusLabel = getStatusLabel(status);

    // Map numeric status to badge variant
    const variantMap: Record<number, string> = {
      0: "default", // Pending Approval
      1: "success", // Available
      2: "primary", // In Use
      3: "warning", // Maintenance
      4: "error", // Unavailable
      5: "error", // Rejected
    };

    // If status is a string, try to match by label
    let variant: string = variantMap[statusNum] || "default";
    if (!variantMap[statusNum] && typeof status === "string") {
      const stringMap: Record<string, string> = {
        PendingApproval: "default",
        Available: "success",
        InUse: "primary",
        Maintenance: "warning",
        Unavailable: "error",
        Rejected: "error",
      };
      variant = stringMap[status] || "default";
    }

    return <Badge variant={variant || "default"}>{statusLabel}</Badge>;
  };

  // Show loading spinner only on initial load
  if (initialLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">Manage Vehicles</h1>
        <Button variant="accent" onClick={() => {}}>
          Add Vehicle
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Search"
            type="text"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            placeholder="Search by make, model, plate..."
            error=""
          />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setStatusFilter(e.target.value)
              }
              className="w-full bg-neutral-50 border-2 border-neutral-200 rounded-md px-4 py-3 text-neutral-700 focus:outline-none focus:border-accent-blue"
            >
              <option value="">All Status</option>
              <option value="0">Pending Approval</option>
              <option value="1">Available</option>
              <option value="2">In Use</option>
              <option value="3">Maintenance</option>
              <option value="4">Unavailable</option>
              <option value="5">Rejected</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="secondary" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <div className="bg-accent-terracotta/20 border border-accent-terracotta rounded-md p-4">
          <p className="text-accent-terracotta">{error}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchVehicles}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Vehicles Grid */}
      <div className="relative">
        {/* Loading overlay - show when fetching after initial load */}
        {isFetching && vehicles.length > 0 && (
          <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-md pointer-events-none">
            <div className="w-8 h-8 border-2 border-neutral-200 border-t-accent-blue rounded-full animate-spin" />
          </div>
        )}

        {/* Show vehicles grid if we have data OR if we're fetching (to keep previous data visible) */}
        {vehicles.length > 0 || isFetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.length > 0
              ? vehicles.map((vehicle) => (
                  <Card key={vehicle.id}>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-neutral-800">
                            {vehicle.model}
                          </h3>
                          <p className="text-sm text-neutral-600">
                            {vehicle.year}
                          </p>
                          <p className="text-sm text-neutral-600">
                            {vehicle.plateNumber}
                          </p>
                        </div>
                        {getStatusBadge(vehicle.status)}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600">VIN</span>
                          <span className="text-sm font-medium text-neutral-800">
                            {vehicle.vin}
                          </span>
                        </div>
                        {vehicle.color && (
                          <div className="flex justify-between">
                            <span className="text-sm text-neutral-600">
                              Color
                            </span>
                            <span className="text-sm font-medium text-neutral-800">
                              {vehicle.color}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600">
                            Odometer
                          </span>
                          <span className="text-sm font-medium text-neutral-800">
                            {vehicle.odometer.toLocaleString()} km
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600">
                            Group
                          </span>
                          <span className="text-sm font-medium text-neutral-800">
                            {vehicle.groupName || "N/A"}
                          </span>
                        </div>
                        {vehicle.lastServiceDate && (
                          <div className="flex justify-between">
                            <span className="text-sm text-neutral-600">
                              Last Service
                            </span>
                            <span className="text-sm font-medium text-neutral-800">
                              {new Date(
                                vehicle.lastServiceDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              : /* Show spinner while fetching and no data */
                isFetching && (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-neutral-200 border-t-accent-blue rounded-full animate-spin" />
                  </div>
                )}
          </div>
        ) : (
          /* Empty State - only show when not fetching and no data */
          !isFetching && (
            <Card>
              <div className="text-center py-12">
                <p className="text-neutral-600">No vehicles found</p>
              </div>
            </Card>
          )
        )}
      </div>
    </div>
  );
};

export default ManageVehicles;
