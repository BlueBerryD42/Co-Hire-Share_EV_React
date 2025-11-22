import { useEffect, useState, useRef } from "react";
import { adminApi } from "@/utils/api";
import vehicleService from "@/services/vehicleService";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/Loading";
import {
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import type { PendingVehicleDto, RejectVehicleDto } from "@/models/vehicle";
import { CheckCircle, Cancel } from "@mui/icons-material";

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
  isPending?: boolean;
}

const ManageVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const searchTimeoutRef = useRef<number | null>(null);
  const isInitialMount = useRef(true);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setAppliedSearch(search);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search]);

  // Fetch vehicles when filters change
  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, appliedSearch]);

  const fetchAllData = async () => {
    const isFirstLoad = isInitialMount.current;

    try {
      if (isFirstLoad) {
        setInitialLoading(true);
        isInitialMount.current = false;
      } else {
        setIsFetching(true);
      }
      setError(null);

      // Fetch both pending and all vehicles in parallel
      const [pendingResponse, allVehiclesResponse] = await Promise.all([
        vehicleService.getPendingVehicles().catch(() => []),
        adminApi.getVehicles({
        search: appliedSearch || undefined,
        status: statusFilter || undefined,
        }),
      ]);

      const pending = pendingResponse as PendingVehicleDto[];
      const allVehicles = (allVehiclesResponse.data.vehicles ||
        []) as Vehicle[];

      // Mark pending vehicles
      const pendingIds = new Set(pending.map((v) => v.id));
      const combined: Vehicle[] = allVehicles.map((v) => ({
        ...v,
        isPending: pendingIds.has(v.id),
      }));

      // If status filter is "0" (Pending Approval) or empty, include pending vehicles
      if (!statusFilter || statusFilter === "0") {
        const pendingNotInAll = pending.filter((p) => !pendingIds.has(p.id));
        pendingNotInAll.forEach((p) => {
          combined.push({
            id: p.id,
            vin: p.vin,
            plateNumber: p.plateNumber,
            model: p.model,
            year: p.year,
            color: p.color || null,
            status: 0, // Pending Approval
            odometer: p.odometer,
            groupId: p.groupId || null,
            groupName: undefined, // PendingVehicleDto doesn't have groupName
            createdAt: p.submittedAt || new Date().toISOString(),
            updatedAt: p.submittedAt || new Date().toISOString(),
            submittedAt: p.submittedAt,
            isPending: true,
          });
        });
      }

      setVehicles(combined);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("Failed to load vehicles");
      if (isFirstLoad) {
        setVehicles([]);
      }
    } finally {
      setInitialLoading(false);
      setIsFetching(false);
    }
  };

  const handleApplyFilters = () => {
    setAppliedSearch(search);
  };

  const handleApprove = async (vehicleId: string) => {
    try {
      setProcessing(vehicleId);
      await vehicleService.approveVehicle(vehicleId);
      setSnackbar({
        open: true,
        message: "Đã phê duyệt xe thành công",
        severity: "success",
      });
      await fetchAllData();
      if (selectedVehicle?.id === vehicleId) {
        setSelectedVehicle(null);
      }
    } catch (error) {
      console.error("Error approving vehicle:", error);
      setSnackbar({
        open: true,
        message: "Không thể phê duyệt xe. Vui lòng thử lại.",
        severity: "error",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedVehicle || !rejectReason.trim()) {
      setSnackbar({
        open: true,
        message: "Vui lòng nhập lý do từ chối",
        severity: "warning",
      });
      return;
    }

    try {
      setProcessing(selectedVehicle.id);
      const payload: RejectVehicleDto = { reason: rejectReason };
      await vehicleService.rejectVehicle(selectedVehicle.id, payload);
      setRejectDialogOpen(false);
      setRejectReason("");
      setSnackbar({
        open: true,
        message: "Đã từ chối xe thành công",
        severity: "success",
      });
      await fetchAllData();
      setSelectedVehicle(null);
    } catch (error) {
      console.error("Error rejecting vehicle:", error);
      setSnackbar({
        open: true,
        message: "Không thể từ chối xe. Vui lòng thử lại.",
        severity: "error",
      });
    } finally {
      setProcessing(null);
    }
  };

  // Map numeric status to string label
  const getStatusLabel = (status: number | string): string => {
    const statusNum =
      typeof status === "number" ? status : parseInt(String(status), 10);

    const statusMap: Record<number, string> = {
      0: "Pending Approval",
      1: "Active",
      2: "In Use",
      3: "Maintenance",
      4: "Unavailable",
      5: "Rejected",
    };

    if (isNaN(statusNum) && typeof status === "string") {
      return status;
    }

    return statusMap[statusNum] || "Unknown";
  };

  const getStatusBadge = (status: number | string) => {
    const statusNum =
      typeof status === "number" ? status : parseInt(String(status), 10);
    const statusLabel = getStatusLabel(status);

    const variantMap: Record<number, string> = {
      0: "default",
      1: "success",
      2: "primary",
      3: "warning",
      4: "error",
      5: "error",
    };

    let variant: string = variantMap[statusNum] || "default";
    if (!variantMap[statusNum] && typeof status === "string") {
      const stringMap: Record<string, string> = {
        PendingApproval: "default",
        Active: "success",
        Available: "success",
        InUse: "primary",
        Maintenance: "warning",
        Unavailable: "error",
        Rejected: "error",
      };
      variant = stringMap[status] || "default";
    }

    return (
      <Badge
        variant={
          variant as "success" | "warning" | "error" | "default" | "primary"
        }
      >
        {statusLabel}
      </Badge>
    );
  };

  if (initialLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">Manage Vehicles</h1>
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
              <option value="1">Active</option>
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
            onClick={fetchAllData}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Vehicles List */}
        <Card>
      <div className="relative">
        {isFetching && vehicles.length > 0 && (
          <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-md pointer-events-none">
            <div className="w-8 h-8 border-2 border-neutral-200 border-t-accent-blue rounded-full animate-spin" />
          </div>
        )}
            <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-neutral-800">
                Vehicles ({vehicles.length})
                          </h3>
            </div>

            {vehicles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neutral-600">No vehicles found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={`border rounded-md p-4 cursor-pointer transition-colors ${
                      selectedVehicle?.id === vehicle.id
                        ? "border-primary-600 bg-primary-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-neutral-800">
                          {vehicle.model} ({vehicle.year})
                        </h4>
                          <p className="text-sm text-neutral-600">
                            {vehicle.plateNumber}
                          </p>
                        </div>
                        {getStatusBadge(vehicle.status)}
                      </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <span>VIN: {vehicle.vin}</span>
                      <span>{vehicle.odometer.toLocaleString()} km</span>
                        </div>
                          </div>
                ))}
                          </div>
                        )}
                      </div>
        </Card>

        {/* Right: Vehicle Details */}
        {selectedVehicle ? (
          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-neutral-800">
                  Vehicle Details
                </h3>
                {getStatusBadge(selectedVehicle.status)}
              </div>

              <div className="p-3 bg-neutral-50 rounded-md">
                <p className="font-medium text-neutral-800 text-lg">
                  {selectedVehicle.model} ({selectedVehicle.year})
                </p>
                <p className="text-sm text-neutral-600 mt-1">
                  {selectedVehicle.plateNumber}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600">VIN</p>
                  <p className="text-sm font-medium text-neutral-800 font-mono">
                    {selectedVehicle.vin}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Plate Number</p>
                  <p className="text-sm font-medium text-neutral-800">
                    {selectedVehicle.plateNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Color</p>
                  <p className="text-sm font-medium text-neutral-800">
                    {selectedVehicle.color || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Odometer</p>
                  <p className="text-sm font-medium text-neutral-800">
                    {selectedVehicle.odometer.toLocaleString()} km
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Group</p>
                  <p className="text-sm font-medium text-neutral-800">
                    {selectedVehicle.groupName || "N/A"}
                  </p>
                    </div>
                {selectedVehicle.lastServiceDate && (
                  <div>
                    <p className="text-sm text-neutral-600">Last Service</p>
                    <p className="text-sm font-medium text-neutral-800">
                      {new Date(
                        selectedVehicle.lastServiceDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-neutral-600">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedVehicle.status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Created</p>
                  <p className="text-sm font-medium text-neutral-800">
                    {selectedVehicle.createdAt
                      ? new Date(selectedVehicle.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Actions for Pending Vehicles */}
              {(selectedVehicle.isPending ||
                selectedVehicle.status === 0 ||
                selectedVehicle.status === "0" ||
                getStatusLabel(selectedVehicle.status) ===
                  "Pending Approval") && (
                <div className="flex gap-2 pt-4 border-t border-neutral-200">
                  <Button
                    variant="primary"
                    onClick={() => handleApprove(selectedVehicle.id)}
                    disabled={processing === selectedVehicle.id}
                    className="flex-1"
                  >
                    <CheckCircle sx={{ fontSize: 20, marginRight: 1 }} />
                    Approve
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setRejectDialogOpen(true)}
                    disabled={processing === selectedVehicle.id}
                    className="flex-1"
                  >
                    <Cancel sx={{ fontSize: 20, marginRight: 1 }} />
                    Reject
                  </Button>
                  </div>
                )}
          </div>
          </Card>
        ) : (
            <Card>
              <div className="text-center py-12">
              <p className="text-neutral-600">
                Select a vehicle to view details
              </p>
              </div>
            </Card>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Vehicle</DialogTitle>
        <DialogContent>
          <TextField
            label="Rejection Reason"
            multiline
            rows={4}
            fullWidth
            value={rejectReason}
            onChange={(
              e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => setRejectReason(e.target.value)}
            placeholder="Enter reason for rejecting this vehicle..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="secondary"
            onClick={() => setRejectDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleReject}
            disabled={!rejectReason.trim() || !!processing}
          >
            Confirm Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ManageVehicles;
