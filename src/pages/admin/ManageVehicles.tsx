import { useEffect, useState, useRef } from "react";
import { adminApi } from "@/utils/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/Loading";

const ManageVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const searchTimeoutRef = useRef(null);
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

  const getStatusBadge = (status) => {
    const statusMap = {
      Available: { variant: "success", label: "Available" },
      InUse: { variant: "primary", label: "In Use" },
      Maintenance: { variant: "warning", label: "Maintenance" },
      Inactive: { variant: "error", label: "Inactive" },
    };
    const statusInfo = statusMap[status] || {
      variant: "default",
      label: status,
    };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  // Show loading spinner only on initial load
  if (initialLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">Manage Vehicles</h1>
        <Button variant="accent">Add Vehicle</Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by make, model, plate..."
          />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-neutral-50 border-2 border-neutral-200 rounded-md px-4 py-3 text-neutral-700 focus:outline-none focus:border-accent-blue"
            >
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="InUse">In Use</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
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
                            {vehicle.make} {vehicle.model}
                          </h3>
                          <p className="text-sm text-neutral-600">
                            {vehicle.year}
                          </p>
                          <p className="text-sm text-neutral-600">
                            {vehicle.licensePlate}
                          </p>
                        </div>
                        {getStatusBadge(vehicle.status)}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600">
                            Battery
                          </span>
                          <span className="text-sm font-medium text-neutral-800">
                            {vehicle.batteryCapacity} kWh
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600">
                            Range
                          </span>
                          <span className="text-sm font-medium text-neutral-800">
                            {vehicle.range} km
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
                      </div>

                      <div className="flex gap-2 pt-4 border-t border-neutral-200">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            // View details
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => {
                            // Edit vehicle
                          }}
                        >
                          Edit
                        </Button>
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
