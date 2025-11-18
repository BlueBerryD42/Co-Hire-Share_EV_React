import { useEffect, useState, useRef } from "react";
import { adminApi } from "@/utils/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/Loading";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
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
  }, [roleFilter]);

  // Fetch users when filters or page change
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter, appliedSearch]);

  const fetchUsers = async () => {
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
        role: roleFilter || undefined,
      };
      const response = await adminApi.getUsers(params);
      setUsers(response.data.users || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
      // Only clear users on error if this is the initial load
      if (isFirstLoad) {
        setUsers([]);
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

  const getRoleBadge = (role) => {
    const roleMap = {
      CoOwner: { variant: "default", label: "Co-Owner" },
      Staff: { variant: "primary", label: "Staff" },
      SystemAdmin: { variant: "warning", label: "Admin" },
    };
    const roleInfo = roleMap[role] || { variant: "default", label: role };
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
  };

  const getKycBadge = (kycStatus) => {
    const kycMap = {
      Verified: { variant: "success", label: "Verified" },
      Pending: { variant: "warning", label: "Pending" },
      Rejected: { variant: "error", label: "Rejected" },
      Unverified: { variant: "default", label: "Unverified" },
    };
    const kycInfo = kycMap[kycStatus] || {
      variant: "default",
      label: kycStatus,
    };
    return <Badge variant={kycInfo.variant}>{kycInfo.label}</Badge>;
  };

  const fetchUserDetails = async (userId) => {
    try {
      setLoadingDetails(true);
      const response = await adminApi.getUserDetails(userId);
      setUserDetails(response.data);
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError("Failed to load user details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    fetchUserDetails(user.id);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setUserDetails(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatBoolean = (value) => {
    if (value === null || value === undefined) return "N/A";
    return value ? "Yes" : "No";
  };

  // Show loading spinner only on initial load
  if (initialLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">User Management</h1>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email..."
          />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-neutral-50 border-2 border-neutral-200 rounded-md px-4 py-3 text-neutral-700 focus:outline-none focus:border-accent-blue"
            >
              <option value="">All Roles</option>
              <option value="CoOwner">Co-Owner</option>
              <option value="Staff">Staff</option>
              <option value="SystemAdmin">System Admin</option>
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
            onClick={fetchUsers}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      <Card>
        <div className="relative">
          {/* Loading overlay for table updates - only show when fetching and data exists */}
          {isFetching && users.length > 0 && (
            <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-md pointer-events-none">
              <div className="w-8 h-8 border-2 border-neutral-200 border-t-accent-blue rounded-full animate-spin" />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    User
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Phone
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    KYC Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Joined
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-neutral-200 hover:bg-neutral-50"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-neutral-800">
                          {user.fullName}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-neutral-700">{user.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-neutral-700">
                        {user.phone || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                    <td className="py-3 px-4">{getKycBadge(user.kycStatus)}</td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-neutral-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                        >
                          View
                        </Button>
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => {
                            // Edit user
                          }}
                        >
                          Edit
                        </Button>
                      </div>
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
        {!isFetching && !initialLoading && users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-600">No users found</p>
          </div>
        )}

        {/* Loading State - when fetching but no data */}
        {isFetching && users.length === 0 && !initialLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-neutral-200 border-t-accent-blue rounded-full animate-spin" />
          </div>
        )}
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-800">
                User Details
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-neutral-500 hover:text-neutral-800 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-neutral-200 border-t-accent-blue rounded-full animate-spin" />
                </div>
              ) : userDetails ? (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-200">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-600">
                          User ID
                        </label>
                        <p className="text-neutral-800 mt-1">
                          {userDetails.id || selectedUser.id || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">
                          User Name
                        </label>
                        <p className="text-neutral-800 mt-1">
                          {userDetails.userName ||
                            selectedUser.userName ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">
                          Normalized User Name
                        </label>
                        <p className="text-neutral-800 mt-1">
                          {userDetails.normalizedUserName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">
                          Full Name
                        </label>
                        <p className="text-neutral-800 mt-1">
                          {selectedUser.fullName ||
                            userDetails.fullName ||
                            "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-200">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-600">
                          Email
                        </label>
                        <p className="text-neutral-800 mt-1">
                          {userDetails.email || selectedUser.email || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">
                          Normalized Email
                        </label>
                        <p className="text-neutral-800 mt-1">
                          {userDetails.normalizedEmail || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">
                          Email Confirmed
                        </label>
                        <p className="text-neutral-800 mt-1">
                          {formatBoolean(userDetails.emailConfirmed)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">
                          Phone Number
                        </label>
                        <p className="text-neutral-800 mt-1">
                          {userDetails.phoneNumber ||
                            selectedUser.phone ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">
                          Phone Number Confirmed
                        </label>
                        <p className="text-neutral-800 mt-1">
                          {formatBoolean(userDetails.phoneNumberConfirmed)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Security Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-200">
                      Security Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-600">
                          Two Factor Enabled
                        </label>
                        <p className="text-neutral-800 mt-1">
                          {formatBoolean(userDetails.twoFactorEnabled)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">
                          Lockout Enabled
                        </label>
                        <p className="text-neutral-800 mt-1">
                          {formatBoolean(userDetails.lockoutEnabled)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">
                          Access Failed Count
                        </label>
                        <p className="text-neutral-800 mt-1">
                          {userDetails.accessFailedCount ?? "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">
                          Lockout End
                        </label>
                        <p className="text-neutral-800 mt-1">
                          {userDetails.lockoutEnd
                            ? formatDate(userDetails.lockoutEnd)
                            : "Not locked"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-neutral-600">
                          Security Stamp
                        </label>
                        <p className="text-neutral-800 mt-1 break-all text-xs">
                          {userDetails.securityStamp || "N/A"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-neutral-600">
                          Concurrency Stamp
                        </label>
                        <p className="text-neutral-800 mt-1 break-all text-xs">
                          {userDetails.concurrencyStamp || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-200">
                      Additional Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-600">
                          Role
                        </label>
                        <div className="mt-1">
                          {getRoleBadge(userDetails.role || selectedUser.role)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">
                          KYC Status
                        </label>
                        <div className="mt-1">
                          {getKycBadge(
                            userDetails.kycStatus || selectedUser.kycStatus
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">
                          Created At
                        </label>
                        <p className="text-neutral-800 mt-1">
                          {formatDate(
                            userDetails.createdAt || selectedUser.createdAt
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-neutral-600">
                    Failed to load user details
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fetchUserDetails(selectedUser.id)}
                    className="mt-4"
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-neutral-50 border-t border-neutral-200 px-6 py-4 flex justify-end gap-3">
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
