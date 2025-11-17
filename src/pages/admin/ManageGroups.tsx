import { useEffect, useState, useRef } from "react";
import { adminApi } from "@/utils/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/Loading";
import { Link } from "react-router-dom";

const ManageGroups = () => {
  const [groups, setGroups] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const searchTimeoutRef = useRef(null);
  const isInitialMount = useRef(true);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setAppliedSearch(search);
      setPage(1); // Reset to page 1 when search changes
    }, 500); // 500ms debounce

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
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, appliedSearch]);

  const fetchGroups = async () => {
    const isFirstLoad = isInitialMount.current;

    try {
      // On initial load, show full page spinner
      if (isFirstLoad) {
        setInitialLoading(true);
        isInitialMount.current = false;
      } else {
        // On subsequent fetches (filter changes), only show overlay
        setIsFetching(true);
      }
      setError(null);

      const params = {
        page,
        pageSize: 20,
        search: appliedSearch || undefined,
        status: statusFilter || undefined,
      };
      const response = await adminApi.getGroups(params);
      setGroups(response.data.groups || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setError("Failed to load groups");
      // Only clear groups on error if this is the initial load
      if (isFirstLoad) {
        setGroups([]);
      }
    } finally {
      setInitialLoading(false);
      setIsFetching(false);
    }
  };

  const handleApplyFilters = () => {
    // Immediately apply search without waiting for debounce
    setAppliedSearch(search);
    setPage(1); // Reset to page 1
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Active: { variant: "success", label: "Active" },
      Inactive: { variant: "warning", label: "Inactive" },
      Suspended: { variant: "error", label: "Suspended" },
      Dissolved: { variant: "error", label: "Dissolved" },
    };
    const statusInfo = statusMap[status] || {
      variant: "default",
      label: status,
    };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getHealthBadge = (health) => {
    const healthMap = {
      Healthy: { variant: "success", label: "Healthy" },
      Warning: { variant: "warning", label: "Warning" },
      Critical: { variant: "error", label: "Critical" },
    };
    const healthInfo = healthMap[health] || {
      variant: "default",
      label: health,
    };
    return <Badge variant={healthInfo.variant}>{healthInfo.label}</Badge>;
  };

  // Show loading spinner only on initial load
  if (initialLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">Manage Groups</h1>
        <Button variant="accent">Create Group</Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, description..."
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
              <option value="Dissolved">Dissolved</option>
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
            onClick={fetchGroups}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Groups Table */}
      <Card>
        <div className="relative">
          {/* Loading overlay for table updates - only show when fetching and data exists */}
          {isFetching && groups.length > 0 && (
            <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-md pointer-events-none">
              <div className="w-8 h-8 border-2 border-neutral-200 border-t-accent-blue rounded-full animate-spin" />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Group Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Members
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Vehicles
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Health
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Created
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr
                    key={group.id}
                    className="border-b border-neutral-200 hover:bg-neutral-50"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-neutral-800">
                          {group.name}
                        </p>
                        {group.description && (
                          <p className="text-sm text-neutral-600 truncate max-w-xs">
                            {group.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-neutral-700">
                        {group.memberCount || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-neutral-700">
                        {group.vehicleCount || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(group.status)}
                    </td>
                    <td className="py-3 px-4">
                      {getHealthBadge(group.healthStatus)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-neutral-600">
                        {new Date(group.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/groups/${group.id}`}
                          className="text-accent-blue hover:underline text-sm"
                        >
                          View
                        </Link>
                        <button
                          className="text-accent-terracotta hover:underline text-sm"
                          onClick={() => {
                            // Handle suspend/activate
                          }}
                        >
                          {group.status === "Active" ? "Suspend" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-neutral-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isFetching && !initialLoading && groups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-600">No groups found</p>
          </div>
        )}

        {/* Loading State - when fetching but no data */}
        {isFetching && groups.length === 0 && !initialLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-neutral-200 border-t-accent-blue rounded-full animate-spin" />
          </div>
        )}
      </Card>
    </div>
  );
};

export default ManageGroups;
