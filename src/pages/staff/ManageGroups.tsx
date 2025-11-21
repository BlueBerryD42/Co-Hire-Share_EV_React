import { useEffect, useState, useRef } from "react";
import { adminApi } from "@/utils/api";
import { groupApi } from "@/services/group/groups";
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
import type { GroupDto, PendingGroupDto, RejectGroupDto } from "@/models/group";
import { CheckCircle, Cancel } from "@mui/icons-material";

interface CombinedGroup extends GroupDto {
  isPending?: boolean;
  memberCount?: number;
  vehicleCount?: number;
}

const ManageGroups = () => {
  const [groups, setGroups] = useState<CombinedGroup[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<CombinedGroup | null>(
    null
  );
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
      setPage(1);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search]);

  // Reset page when status filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  // Fetch groups when filters or page change
  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, appliedSearch]);

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

      // Fetch both pending and all groups in parallel
      const [pendingResponse, allGroupsResponse] = await Promise.all([
        groupApi.getPendingGroups().catch(() => []),
        adminApi.getGroups({
        page,
        pageSize: 20,
        search: appliedSearch || undefined,
        status: statusFilter || undefined,
        }),
      ]);

      const pending = pendingResponse as PendingGroupDto[];
      const allGroups = (allGroupsResponse.data.groups || []) as GroupDto[];

      // Mark pending groups
      const pendingIds = new Set(pending.map((g) => g.id));
      const combined: CombinedGroup[] = allGroups.map((g) => ({
        ...g,
        isPending: pendingIds.has(g.id),
      }));

      // If status filter is "Pending" or empty, include pending groups
      if (
        !statusFilter ||
        statusFilter === "PendingApproval" ||
        statusFilter === "0"
      ) {
        const pendingNotInAll = pending.filter((p) => !pendingIds.has(p.id));
        pendingNotInAll.forEach((p) => {
          combined.push({ ...p, isPending: true });
        });
      }

      setGroups(combined);
      setTotalPages(allGroupsResponse.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setError("Failed to load groups");
      if (isFirstLoad) {
        setGroups([]);
      }
    } finally {
      setInitialLoading(false);
      setIsFetching(false);
    }
  };

  const handleApplyFilters = () => {
    setAppliedSearch(search);
    setPage(1);
  };

  const handleApprove = async (groupId: string) => {
    try {
      setProcessing(groupId);
      await groupApi.approveGroup(groupId);
      setSnackbar({
        open: true,
        message: "Đã phê duyệt nhóm thành công",
        severity: "success",
      });
      await fetchAllData();
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null);
      }
    } catch (error) {
      console.error("Error approving group:", error);
      setSnackbar({
        open: true,
        message: "Không thể phê duyệt nhóm. Vui lòng thử lại.",
        severity: "error",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedGroup || !rejectReason.trim()) {
      setSnackbar({
        open: true,
        message: "Vui lòng nhập lý do từ chối",
        severity: "warning",
      });
      return;
    }

    try {
      setProcessing(selectedGroup.id);
      const payload: RejectGroupDto = { reason: rejectReason };
      await groupApi.rejectGroup(selectedGroup.id, payload);
      setRejectDialogOpen(false);
      setRejectReason("");
      setSnackbar({
        open: true,
        message: "Đã từ chối nhóm thành công",
        severity: "success",
      });
      await fetchAllData();
      setSelectedGroup(null);
    } catch (error) {
      console.error("Error rejecting group:", error);
      setSnackbar({
        open: true,
        message: "Không thể từ chối nhóm. Vui lòng thử lại.",
        severity: "error",
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string | number) => {
    // Convert status to string for mapping
    const statusStr = String(status);

    // Handle numeric status: 0 = PendingApproval, 1 = Active, etc.
    const numericStatusMap: Record<number, { variant: string; label: string }> =
      {
        0: { variant: "warning", label: "Pending" },
        1: { variant: "success", label: "Active" },
        2: { variant: "warning", label: "Inactive" },
        3: { variant: "error", label: "Dissolved" },
        4: { variant: "error", label: "Rejected" },
      };

    // If status is a number, use numeric map
    if (typeof status === "number" || !isNaN(Number(statusStr))) {
      const numStatus =
        typeof status === "number" ? status : parseInt(statusStr, 10);
      const statusInfo = numericStatusMap[numStatus];
      if (statusInfo) {
        return (
          <Badge
            variant={
              statusInfo.variant as "success" | "warning" | "error" | "default"
            }
          >
            {statusInfo.label}
          </Badge>
        );
      }
    }

    // Handle string status
    const statusMap: Record<string, { variant: string; label: string }> = {
      PendingApproval: { variant: "warning", label: "Pending" },
      "0": { variant: "warning", label: "Pending" },
      Active: { variant: "success", label: "Active" },
      "1": { variant: "success", label: "Active" },
      Inactive: { variant: "warning", label: "Inactive" },
      "2": { variant: "warning", label: "Inactive" },
      Suspended: { variant: "error", label: "Suspended" },
      Dissolved: { variant: "error", label: "Dissolved" },
      "3": { variant: "error", label: "Dissolved" },
      Rejected: { variant: "error", label: "Rejected" },
      "4": { variant: "error", label: "Rejected" },
    };

    const statusInfo = statusMap[statusStr] || {
      variant: "default",
      label: statusStr,
    };
    return (
      <Badge
        variant={
          statusInfo.variant as "success" | "warning" | "error" | "default"
        }
      >
        {statusInfo.label}
      </Badge>
    );
  };

  if (initialLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">Manage Groups</h1>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Search"
            type="text"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            placeholder="Search by name, description..."
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
              <option value="PendingApproval">Pending</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
              <option value="Dissolved">Dissolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="secondary" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Error */}
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
        {/* Left: Groups List */}
      <Card>
        <div className="relative">
          {isFetching && groups.length > 0 && (
            <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-md pointer-events-none">
              <div className="w-8 h-8 border-2 border-neutral-200 border-t-accent-blue rounded-full animate-spin" />
            </div>
          )}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-800">
                Groups ({groups.length})
              </h3>
            </div>

            {groups.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neutral-600">No groups found</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {groups.map((group) => (
                    <div
                    key={group.id}
                      className={`border rounded-md p-4 cursor-pointer transition-colors ${
                        selectedGroup?.id === group.id
                          ? "border-primary-600 bg-primary-50"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                      onClick={() => setSelectedGroup(group)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-neutral-800">
                          {group.name}
                        </h4>
                        {getStatusBadge(group.status)}
                      </div>
                        {group.description && (
                        <p className="text-sm text-neutral-600 mb-2 truncate">
                            {group.description}
                          </p>
                        )}
                      <div className="flex items-center gap-4 text-sm text-neutral-600">
                        <span>
                          Members:{" "}
                          {group.memberCount ?? group.members?.length ?? 0}
                      </span>
                        <span>
                          Vehicles:{" "}
                          {group.vehicleCount ?? group.vehicles?.length ?? 0}
                      </span>
                        {group.createdAt && (
                          <span>
                        {new Date(group.createdAt).toLocaleDateString()}
                      </span>
                        )}
          </div>
                    </div>
                  ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200">
                    <Button
                      variant="secondary"
                      size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
                    </Button>
            <span className="text-sm text-neutral-600">
              Page {page} of {totalPages}
            </span>
                    <Button
                      variant="secondary"
                      size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Right: Group Details */}
        {selectedGroup ? (
          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-neutral-800">
                  Group Details
                </h3>
                {getStatusBadge(selectedGroup.status)}
              </div>

              <div className="p-3 bg-neutral-50 rounded-md">
                <p className="font-medium text-neutral-800 text-lg">
                  {selectedGroup.name}
                </p>
                {selectedGroup.description && (
                  <p className="text-sm text-neutral-600 mt-1">
                    {selectedGroup.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600">Members</p>
                  <p className="text-lg font-medium text-neutral-800">
                    {selectedGroup.memberCount ??
                      selectedGroup.members?.length ??
                      0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Vehicles</p>
                  <p className="text-lg font-medium text-neutral-800">
                    {selectedGroup.vehicleCount ??
                      selectedGroup.vehicles?.length ??
                      0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Created</p>
                  <p className="text-sm font-medium text-neutral-800">
                    {selectedGroup.createdAt
                      ? new Date(selectedGroup.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedGroup.status)}
                  </div>
                </div>
              </div>

              {selectedGroup.members && selectedGroup.members.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-neutral-700 mb-2">
                    Members:
                  </p>
                  <div className="space-y-2">
                    {selectedGroup.members.map((member) => (
                      <div
                        key={member.id}
                        className="p-2 bg-neutral-50 rounded text-sm"
                      >
                        <p className="font-medium text-neutral-800">
                          {member.userFirstName} {member.userLastName}
                        </p>
                        <p className="text-neutral-600">
                          {member.userEmail} -{" "}
                          {(member.sharePercentage * 100).toFixed(1)}% -{" "}
                          {member.roleInGroup}
                        </p>
                      </div>
                    ))}
                  </div>
          </div>
        )}

              {/* Actions for Pending Groups */}
              {(selectedGroup.isPending ||
                String(selectedGroup.status) === "PendingApproval" ||
                String(selectedGroup.status) === "0" ||
                Number(selectedGroup.status) === 0) && (
                <div className="flex gap-2 pt-4 border-t border-neutral-200">
                  <Button
                    variant="primary"
                    onClick={() => handleApprove(selectedGroup.id)}
                    disabled={processing === selectedGroup.id}
                    className="flex-1"
                  >
                    <CheckCircle sx={{ fontSize: 20, marginRight: 1 }} />
                    Approve
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setRejectDialogOpen(true)}
                    disabled={processing === selectedGroup.id}
                    className="flex-1"
                  >
                    <Cancel sx={{ fontSize: 20, marginRight: 1 }} />
                    Reject
                  </Button>
          </div>
        )}

              {/* Actions for Approved Groups */}
              {!selectedGroup.isPending &&
                (String(selectedGroup.status) === "Active" ||
                  String(selectedGroup.status) === "1" ||
                  Number(selectedGroup.status) === 1) && (
                  <div className="pt-4 border-t border-neutral-200">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        // Handle suspend/activate
                      }}
                    >
                      Suspend
                    </Button>
          </div>
        )}
            </div>
          </Card>
        ) : (
          <Card>
            <div className="text-center py-12">
              <p className="text-neutral-600">Select a group to view details</p>
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
        <DialogTitle>Reject Group</DialogTitle>
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
            placeholder="Enter reason for rejecting this group..."
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

export default ManageGroups;
