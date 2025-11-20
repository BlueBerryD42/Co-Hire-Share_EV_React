import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import LoadingSpinner from '@/components/ui/Loading'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * ProtectedRoute - Ensures user is authenticated before accessing route
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

