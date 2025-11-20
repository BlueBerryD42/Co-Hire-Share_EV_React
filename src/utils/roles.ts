import type { User } from '@/models/auth'

/**
 * User role enum matching backend values
 * SystemAdmin = 0, Staff = 1, GroupAdmin = 2, CoOwner = 3
 */
export enum UserRole {
  SystemAdmin = 0,
  Staff = 1,
  GroupAdmin = 2,
  CoOwner = 3,
}

/**
 * Check if user has a specific role
 */
export const hasRole = (user: User | null, role: UserRole): boolean => {
  if (!user) return false
  return user.role === role
}

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (user: User | null, roles: UserRole[]): boolean => {
  if (!user) return false
  return roles.includes(user.role)
}

/**
 * Check if user is SystemAdmin
 */
export const isSystemAdmin = (user: User | null): boolean => {
  return hasRole(user, UserRole.SystemAdmin)
}

/**
 * Check if user is Staff
 */
export const isStaff = (user: User | null): boolean => {
  return hasRole(user, UserRole.Staff)
}

/**
 * Check if user is Staff or SystemAdmin
 */
export const isStaffOrAdmin = (user: User | null): boolean => {
  if (!user) return false
  return user.role === UserRole.SystemAdmin || user.role === UserRole.Staff
}

/**
 * Check if user is GroupAdmin
 */
export const isGroupAdmin = (user: User | null): boolean => {
  return hasRole(user, UserRole.GroupAdmin)
}

/**
 * Check if user is CoOwner
 */
export const isCoOwner = (user: User | null): boolean => {
  return hasRole(user, UserRole.CoOwner)
}

/**
 * Get role name as string
 */
export const getRoleName = (role: number): string => {
  switch (role) {
    case UserRole.SystemAdmin:
      return 'SystemAdmin'
    case UserRole.Staff:
      return 'Staff'
    case UserRole.GroupAdmin:
      return 'GroupAdmin'
    case UserRole.CoOwner:
      return 'CoOwner'
    default:
      return 'Unknown'
  }
}

