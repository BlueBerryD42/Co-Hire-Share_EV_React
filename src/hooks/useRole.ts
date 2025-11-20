import { useAppSelector } from '@/store/hooks'
import { UserRole, hasRole, hasAnyRole, isSystemAdmin, isStaff, isStaffOrAdmin } from '@/utils/roles'

/**
 * Custom hook for role-based access control
 */
export const useRole = () => {
  const { user, isLoading } = useAppSelector((state) => state.auth)

  return {
    user,
    isLoading,
    hasRole: (role: UserRole) => hasRole(user, role),
    hasAnyRole: (roles: UserRole[]) => hasAnyRole(user, roles),
    isSystemAdmin: isSystemAdmin(user),
    isStaff: isStaff(user),
    isStaffOrAdmin: isStaffOrAdmin(user),
  }
}

/**
 * Hook to check if user has a specific role
 */
export const useHasRole = (role: UserRole) => {
  const { user } = useAppSelector((state) => state.auth)
  return hasRole(user, role)
}

/**
 * Hook to check if user is Staff or Admin
 */
export const useIsStaffOrAdmin = () => {
  const { user } = useAppSelector((state) => state.auth)
  return isStaffOrAdmin(user)
}

/**
 * Hook to check if user is SystemAdmin
 */
export const useIsSystemAdmin = () => {
  const { user } = useAppSelector((state) => state.auth)
  return isSystemAdmin(user)
}

