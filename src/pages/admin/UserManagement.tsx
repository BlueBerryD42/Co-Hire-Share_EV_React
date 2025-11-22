import { useEffect, useState, useRef } from "react";
import { adminApi } from "@/utils/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/Loading";
import { useAppSelector } from "@/store/hooks";
import { UserRole, isSystemAdmin } from "@/utils/roles";
import Unauthorized from "@/components/auth/Unauthorized";

interface User {
  id?: string;
  Id?: string;
  userName?: string;
  UserName?: string;
  normalizedUserName?: string;
  NormalizedUserName?: string;
  email?: string;
  Email?: string;
  normalizedEmail?: string;
  NormalizedEmail?: string;
  emailConfirmed?: boolean;
  EmailConfirmed?: boolean;
  phoneNumber?: string;
  PhoneNumber?: string;
  phoneNumberConfirmed?: boolean;
  PhoneNumberConfirmed?: boolean;
  twoFactorEnabled?: boolean;
  TwoFactorEnabled?: boolean;
  lockoutEnabled?: boolean;
  LockoutEnabled?: boolean;
  lockoutEnd?: string | null;
  LockoutEnd?: string | null;
  accessFailedCount?: number;
  AccessFailedCount?: number;
  fullName?: string;
  phone?: string;
}

const UserManagement = () => {
  const { user } = useAppSelector((state) => state.auth);

  // Role check - SystemAdmin only
  if (!isSystemAdmin(user)) {
    return <Unauthorized requiredRole="SystemAdmin" />;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const handleViewUser = async (user: User) => {
    const userId = user.id || user.Id;
    if (!userId) {
      console.error("User ID not found");
      return;
    }

    setSelectedUser(user);
    setLoadingDetails(true);
    setUserDetails(null);

    try {
      const response = await adminApi.getUserDetails(userId);
      setUserDetails(response.data);
    } catch (err) {
      console.error("Error fetching user details:", err);
      // If API fails, use the user data from the list
      setUserDetails(user);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setUserDetails(null);
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            placeholder="Search by name, email..."
            error=""
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
                    User Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Phone Number
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Email Confirmed
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Phone Confirmed
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Two Factor
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Lockout Enabled
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Access Failed
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id || user.Id}
                    className="border-b border-neutral-200 hover:bg-neutral-50"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-neutral-800">
                          {user.userName ||
                            user.UserName ||
                            user.fullName ||
                            "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-neutral-700">
                        {user.email || user.Email || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-neutral-700">
                        {user.phoneNumber ||
                          user.PhoneNumber ||
                          user.phone ||
                          "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          user.emailConfirmed || user.EmailConfirmed
                            ? "success"
                            : "default"
                        }
                      >
                        {user.emailConfirmed || user.EmailConfirmed
                          ? "Yes"
                          : "No"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          user.phoneNumberConfirmed || user.PhoneNumberConfirmed
                            ? "success"
                            : "default"
                        }
                      >
                        {user.phoneNumberConfirmed || user.PhoneNumberConfirmed
                          ? "Yes"
                          : "No"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          user.twoFactorEnabled || user.TwoFactorEnabled
                            ? "primary"
                            : "default"
                        }
                      >
                        {user.twoFactorEnabled || user.TwoFactorEnabled
                          ? "Yes"
                          : "No"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          user.lockoutEnabled || user.LockoutEnabled
                            ? "warning"
                            : "default"
                        }
                      >
                        {user.lockoutEnabled || user.LockoutEnabled
                          ? "Yes"
                          : "No"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-neutral-700">
                        {user.accessFailedCount !== undefined
                          ? user.accessFailedCount
                          : user.AccessFailedCount !== undefined
                          ? user.AccessFailedCount
                          : 0}
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-800">
                User Details
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-neutral-500 hover:text-neutral-700 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-neutral-200 border-t-accent-blue rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-600">
                        User ID
                      </label>
                      <p className="text-neutral-800 mt-1">
                        {userDetails?.id ||
                          userDetails?.Id ||
                          selectedUser?.id ||
                          selectedUser?.Id ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-600">
                        User Name
                      </label>
                      <p className="text-neutral-800 mt-1">
                        {userDetails?.userName ||
                          userDetails?.UserName ||
                          selectedUser?.userName ||
                          selectedUser?.UserName ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-600">
                        Normalized User Name
                      </label>
                      <p className="text-neutral-800 mt-1">
                        {userDetails?.normalizedUserName ||
                          userDetails?.NormalizedUserName ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-600">
                        Email
                      </label>
                      <p className="text-neutral-800 mt-1">
                        {userDetails?.email ||
                          userDetails?.Email ||
                          selectedUser?.email ||
                          selectedUser?.Email ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-600">
                        Normalized Email
                      </label>
                      <p className="text-neutral-800 mt-1">
                        {userDetails?.normalizedEmail ||
                          userDetails?.NormalizedEmail ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-600">
                        Phone Number
                      </label>
                      <p className="text-neutral-800 mt-1">
                        {userDetails?.phoneNumber ||
                          userDetails?.PhoneNumber ||
                          selectedUser?.phoneNumber ||
                          selectedUser?.PhoneNumber ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-600">
                        Email Confirmed
                      </label>
                      <div className="mt-1">
                        <Badge
                          variant={
                            userDetails?.emailConfirmed ||
                            userDetails?.EmailConfirmed ||
                            selectedUser?.emailConfirmed ||
                            selectedUser?.EmailConfirmed
                              ? "success"
                              : "default"
                          }
                        >
                          {userDetails?.emailConfirmed ||
                          userDetails?.EmailConfirmed ||
                          selectedUser?.emailConfirmed ||
                          selectedUser?.EmailConfirmed
                            ? "Yes"
                            : "No"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-600">
                        Phone Confirmed
                      </label>
                      <div className="mt-1">
                        <Badge
                          variant={
                            userDetails?.phoneNumberConfirmed ||
                            userDetails?.PhoneNumberConfirmed ||
                            selectedUser?.phoneNumberConfirmed ||
                            selectedUser?.PhoneNumberConfirmed
                              ? "success"
                              : "default"
                          }
                        >
                          {userDetails?.phoneNumberConfirmed ||
                          userDetails?.PhoneNumberConfirmed ||
                          selectedUser?.phoneNumberConfirmed ||
                          selectedUser?.PhoneNumberConfirmed
                            ? "Yes"
                            : "No"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-600">
                        Two Factor Enabled
                      </label>
                      <div className="mt-1">
                        <Badge
                          variant={
                            userDetails?.twoFactorEnabled ||
                            userDetails?.TwoFactorEnabled ||
                            selectedUser?.twoFactorEnabled ||
                            selectedUser?.TwoFactorEnabled
                              ? "primary"
                              : "default"
                          }
                        >
                          {userDetails?.twoFactorEnabled ||
                          userDetails?.TwoFactorEnabled ||
                          selectedUser?.twoFactorEnabled ||
                          selectedUser?.TwoFactorEnabled
                            ? "Yes"
                            : "No"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-600">
                        Lockout Enabled
                      </label>
                      <div className="mt-1">
                        <Badge
                          variant={
                            userDetails?.lockoutEnabled ||
                            userDetails?.LockoutEnabled ||
                            selectedUser?.lockoutEnabled ||
                            selectedUser?.LockoutEnabled
                              ? "warning"
                              : "default"
                          }
                        >
                          {userDetails?.lockoutEnabled ||
                          userDetails?.LockoutEnabled ||
                          selectedUser?.lockoutEnabled ||
                          selectedUser?.LockoutEnabled
                            ? "Yes"
                            : "No"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-600">
                        Access Failed Count
                      </label>
                      <p className="text-neutral-800 mt-1">
                        {userDetails?.accessFailedCount !== undefined
                          ? userDetails.accessFailedCount
                          : userDetails?.AccessFailedCount !== undefined
                          ? userDetails.AccessFailedCount
                          : selectedUser?.accessFailedCount !== undefined
                          ? selectedUser.accessFailedCount
                          : selectedUser?.AccessFailedCount !== undefined
                          ? selectedUser.AccessFailedCount
                          : 0}
                      </p>
                    </div>
                    {(userDetails?.lockoutEnd || userDetails?.LockoutEnd) && (
                      <div>
                        <label className="text-sm font-medium text-neutral-600">
                          Lockout End
                        </label>
                        <p className="text-neutral-800 mt-1">
                          {(() => {
                            const lockoutDate =
                              userDetails?.lockoutEnd ||
                              userDetails?.LockoutEnd;
                            return lockoutDate
                              ? new Date(lockoutDate).toLocaleString()
                              : "N/A";
                          })()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-neutral-50 border-t border-neutral-200 px-6 py-4 flex justify-end">
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
