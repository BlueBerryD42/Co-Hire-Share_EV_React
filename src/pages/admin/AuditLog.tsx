import { useEffect, useState, useRef } from "react";
import { adminApi } from "@/utils/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/Loading";
import { useAppSelector } from "@/store/hooks";
import { isSystemAdmin } from "@/utils/roles";
import Unauthorized from "@/components/auth/Unauthorized";

const AuditLog = () => {
  const { user } = useAppSelector((state) => state.auth);
  
  // Role check - SystemAdmin only
  if (!isSystemAdmin(user)) {
    return <Unauthorized requiredRole="SystemAdmin" />;
  }
  const [logs, setLogs] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
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

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [actionFilter, moduleFilter]);

  // Fetch logs when filters or page change
  useEffect(() => {
    fetchAuditLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, actionFilter, moduleFilter, appliedSearch]);

  const fetchAuditLogs = async () => {
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
        actionType: actionFilter || undefined,
        module: moduleFilter || undefined,
      };
      const response = await adminApi.getAuditLogs(params);
      setLogs(response.data.logs || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError("Failed to load audit logs");
      // Only clear logs on error if this is the initial load
      if (isFirstLoad) {
        setLogs([]);
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

  const getActionBadge = (action) => {
    const actionMap = {
      Create: { variant: "success", label: "Create" },
      Read: { variant: "primary", label: "Read" },
      Update: { variant: "warning", label: "Update" },
      Delete: { variant: "error", label: "Delete" },
      Login: { variant: "success", label: "Login" },
      Logout: { variant: "default", label: "Logout" },
    };
    const actionInfo = actionMap[action] || {
      variant: "default",
      label: action,
    };
    return <Badge variant={actionInfo.variant}>{actionInfo.label}</Badge>;
  };

  // Show loading spinner only on initial load
  if (initialLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">Audit Log</h1>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, action..."
          />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Action Type
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full bg-neutral-50 border-2 border-neutral-200 rounded-md px-4 py-3 text-neutral-700 focus:outline-none focus:border-accent-blue"
            >
              <option value="">All Actions</option>
              <option value="Create">Create</option>
              <option value="Read">Read</option>
              <option value="Update">Update</option>
              <option value="Delete">Delete</option>
              <option value="Login">Login</option>
              <option value="Logout">Logout</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Module
            </label>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full bg-neutral-50 border-2 border-neutral-200 rounded-md px-4 py-3 text-neutral-700 focus:outline-none focus:border-accent-blue"
            >
              <option value="">All Modules</option>
              <option value="User">User</option>
              <option value="Group">Group</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Booking">Booking</option>
              <option value="Payment">Payment</option>
              <option value="Document">Document</option>
              <option value="System">System</option>
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
            onClick={fetchAuditLogs}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      <Card>
        <div className="relative">
          {/* Loading overlay for table updates - only show when fetching and data exists */}
          {isFetching && logs.length > 0 && (
            <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-md pointer-events-none">
              <div className="w-8 h-8 border-2 border-neutral-200 border-t-accent-blue rounded-full animate-spin" />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Timestamp
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    User
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Action
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Module
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Details
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    IP Address
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-neutral-200 hover:bg-neutral-50"
                  >
                    <td className="py-3 px-4">
                      <span className="text-sm text-neutral-700">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-neutral-800">
                        {log.userName || "System"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getActionBadge(log.actionType)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-neutral-700">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-neutral-600 truncate max-w-xs">
                        {log.details || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-neutral-600">
                        {log.ipAddress || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          // View log details
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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
        {!isFetching && !initialLoading && logs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-600">No audit logs found</p>
          </div>
        )}

        {/* Loading State - when fetching but no data */}
        {isFetching && logs.length === 0 && !initialLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-neutral-200 border-t-accent-blue rounded-full animate-spin" />
          </div>
        )}
      </Card>
    </div>
  );
};

export default AuditLog;
