export interface User {
  id: string
  email: string
  firstName: string      // Backend uses firstName/lastName
  lastName: string
  phone: string          
  role: number           
  kycStatus: number      
  createdAt: string
}

export interface LoginRequest {
  Email: string        
  Password: string     
  RememberMe?: boolean
}

export interface RegisterRequest {
  fullName: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
  acceptedTerms: boolean
}

export interface AuthResponse {
  user: User
  accessToken: string    
  refreshToken: string
  expiresAt: string      
}

export interface PasswordResetRequest {
  Email: string
}

export interface PasswordResetConfirm {
  UserId: string
  Token: string
  NewPassword: string
  ConfirmPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface RegisterResponse {
  message: string
  email: string
  emailConfirmationRequired: boolean
}