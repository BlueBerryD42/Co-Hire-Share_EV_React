import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import LoadingSpinner from "@/components/ui/Loading";
import { UserRole } from "@/utils/roles";

interface UserOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * UserOnlyRoute - Blocks admin/staff from accessing user routes and redirects them to admin dashboard
 */
const UserOnlyRoute = ({ children }: UserOnlyRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAppSelector(
    (state) => state.auth
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect admin/staff to admin dashboard if they try to access user routes
  if (
    user &&
    (user.role === UserRole.SystemAdmin || user.role === UserRole.Staff)
  ) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default UserOnlyRoute;
