import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import LoadingSpinner from '@/components/ui/Loading'
import { UserRole, hasAnyRole } from '@/utils/roles'

interface RoleProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  redirectTo?: string
}

/**
 * RoleProtectedRoute - Ensures user is authenticated and has required role(s)
 */
const RoleProtectedRoute = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/home' 
}: RoleProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth)

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user || !hasAnyRole(user, allowedRoles)) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}

export default RoleProtectedRoute

