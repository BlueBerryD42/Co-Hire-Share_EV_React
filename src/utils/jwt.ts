/**
 * Decode JWT token and extract claims
 * JWT structure: header.payload.signature
 */
export const decodeJWT = (token: string): Record<string, any> | null => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }
    
    // Decode the payload (second part)
    const payload = parts[1]
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4)
    const decoded = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}

/**
 * Extract user role from JWT token
 * Checks both the custom "role" claim and the Identity role claim
 * Returns the numeric role value: SystemAdmin=0, Staff=1, GroupAdmin=2, CoOwner=3
 */
export const getRoleFromToken = (token: string): number => {
  const claims = decodeJWT(token)
  if (!claims) {
    return 3 // Default to CoOwner
  }
  
  // Check Identity role claim first (most reliable)
  const identityRole = claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
  if (identityRole) {
    const roleMap: Record<string, number> = {
      'SystemAdmin': 0,
      'Staff': 1,
      'GroupAdmin': 2,
      'CoOwner': 3,
    }
    return roleMap[identityRole] ?? 3
  }
  
  // Fallback to custom "role" claim
  const customRole = claims['role']
  if (customRole) {
    const roleMap: Record<string, number> = {
      'SystemAdmin': 0,
      'Staff': 1,
      'GroupAdmin': 2,
      'CoOwner': 3,
    }
    return roleMap[customRole] ?? 3
  }
  
  return 3 // Default to CoOwner
}

