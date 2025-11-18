import Cookies from "js-cookie";
import { createApiClient } from "@/services/api";
import { userApi } from "@/services/user/api";
import { getRoleFromToken } from "@/utils/jwt";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordRequest,
  RegisterResponse,
} from "@/models/auth";

const http = createApiClient("/api");

// Handle 401 responses and log errors
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    // Log validation errors specifically
    if (error.response?.status === 400 && error.response?.data?.errors) {
      console.error("Validation Errors:", error.response.data.errors);
      console.log("You sent:", JSON.parse(error.config?.data || "{}"));
      console.log("Check if field names match what backend expects");
    }

    if (error.response?.status === 401) {
      // Clear invalid token
      Cookies.remove("auth_token");
      // Redirect to login if needed
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  /**
   * Login user with email/phone and password
   * Note: Auth service returns minimal user data. Profile data is fetched from User service.
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    console.log("Sending login request:", credentials);
    const response = await http.post<AuthResponse>("/Auth/login", credentials);
    console.log("Raw response from backend:", response);
    console.log("Response data:", response.data);
    
    // IMPORTANT: Store token immediately so subsequent API calls can use it
    // This must happen BEFORE fetching profile, otherwise getProfile() won't have the token
    if (response.data.accessToken) {
      const cookieOptions = credentials.RememberMe
        ? { expires: 7 } // 7 days
        : undefined // Session cookie
      
      Cookies.set('auth_token', response.data.accessToken, cookieOptions)
      Cookies.set('refresh_token', response.data.refreshToken, cookieOptions)
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      console.log('Token stored immediately after login')
    }
    
    // IMPORTANT: Get role from JWT token (most reliable source)
    // The JWT token contains the correct role from Identity claims
    // UserProfile might have outdated role data
    const roleFromToken = getRoleFromToken(response.data.accessToken);
    
    // Auth service no longer returns profile data - fetch from User service
    // Note: Profile might not exist immediately after registration, so handle gracefully
    try {
      const profile = await userApi.getProfile();
      // Merge profile data with auth response
      // Use role from JWT token instead of profile.role
      return {
        ...response.data,
        user: {
          ...response.data.user,
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          phone: profile.phone || "",
          role: roleFromToken, // Use role from JWT token, not profile
          kycStatus: profile.kycStatus ?? 0,
          createdAt: profile.createdAt || response.data.user.createdAt || new Date().toISOString(),
        },
      };
    } catch (error: any) {
      console.warn("Failed to fetch user profile from User service:", error);
      // If profile fetch fails (e.g., profile not created yet), return auth response with defaults
      // Frontend should handle empty firstName/lastName gracefully
      return {
        ...response.data,
        user: {
          ...response.data.user,
          firstName: response.data.user.firstName || "",
          lastName: response.data.user.lastName || "",
          phone: response.data.user.phone || "",
          role: roleFromToken, // Use role from JWT token
          kycStatus: response.data.user.kycStatus ?? 0,
        },
      };
    }
  },

  /**
   * Register new user
   */
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    // Split fullName into firstName and lastName
    const nameParts = userData.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || nameParts[0] || "";

    // Transform to backend format (PascalCase)
    // Note: Backend expects "Phone" not "PhoneNumber" for registration
    const backendData = {
      FirstName: firstName,
      LastName: lastName,
      Email: userData.email,
      Phone: userData.phoneNumber, // Backend DTO expects "Phone"
      Password: userData.password,
      ConfirmPassword: userData.confirmPassword,
    };

    const { data } = await http.post<RegisterResponse>(
      "Auth/register",
      backendData
    );
    return data;
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    const refreshToken = Cookies.get("refresh_token");
    await http.post("/Auth/logout", { RefreshToken: refreshToken });
  },

  /**
   * Get current authenticated user
   * Note: Auth service no longer returns profile data - fetch from User service instead
   * Role is extracted from JWT token (most reliable source)
   */
  getCurrentUser: async (): Promise<User> => {
    // Fetch profile from User service (which has all profile data)
    const profile = await userApi.getProfile();
    
    // Get role from JWT token (most reliable source)
    const token = Cookies.get('auth_token') || localStorage.getItem('accessToken');
    const roleFromToken = token ? getRoleFromToken(token) : profile.role;
    
    return {
      ...profile,
      role: roleFromToken, // Use role from JWT token, not profile
    };
  },

  /**
   * Request password reset email
   */
  requestPasswordReset: async (
    payload: PasswordResetRequest
  ): Promise<void> => {
    await http.post("/Auth/forgot-password", payload);
  },

  /**
   * Confirm password reset with token (from email link)
   */
  confirmPasswordReset: async (
    payload: PasswordResetConfirm
  ): Promise<void> => {
    await http.post("/Auth/reset-password", payload);
  },

  /**
   * Refresh authentication token
   * Note: Auth service returns minimal user data. Profile data is fetched from User service.
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await http.post<AuthResponse>("Auth/refresh", {
      refreshToken,
    });
    
    // IMPORTANT: Get role from JWT token (most reliable source)
    const roleFromToken = getRoleFromToken(data.accessToken);
    
    // Auth service no longer returns profile data - fetch from User service
    try {
      const profile = await userApi.getProfile();
      // Merge profile data with auth response
      // Use role from JWT token instead of profile.role
      return {
        ...data,
        user: {
          ...data.user,
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          phone: profile.phone || "",
          role: roleFromToken, // Use role from JWT token, not profile
          kycStatus: profile.kycStatus ?? 0,
          createdAt: profile.createdAt || data.user.createdAt || new Date().toISOString(),
        },
      };
    } catch (error: any) {
      console.warn("Failed to fetch user profile after token refresh:", error);
      // Return auth response with defaults if profile fetch fails
      return {
        ...data,
        user: {
          ...data.user,
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          phone: data.user.phone || "",
          role: roleFromToken, // Use role from JWT token
          kycStatus: data.user.kycStatus ?? 0,
        },
      };
    }
  },

  /**
   * Confirm email with token (verify email)
   */
  verifyEmail: async (userId: string, token: string): Promise<void> => {
    const payload = {
      UserId: userId,
      Token: token,
    };
    console.log("Sending verify email request:", payload);
    console.log("  UserId length:", userId.length);
    console.log("  Token length:", token.length);

    const response = await http.post("Auth/confirm-email", payload);
    console.log("Verify email response:", response);
    return response.data;
  },

  /**
   * Resend email confirmation
   */
  resendVerificationEmail: async (email: string): Promise<void> => {
    await http.post("Auth//resend-confirmation", { Email: email });
  },

  /**
   * Validate authentication token
   */
  validateToken: async (token: string): Promise<boolean> => {
    const { data } = await http.post<boolean>("Auth//validate", { Token: token });
    return data;
  },

  /**
   * Change password (when user is logged in)
   */
  changePassword: async (payload: ChangePasswordRequest): Promise<void> => {
    await http.post("Auth/change-password", {
      CurrentPassword: payload.currentPassword,
      NewPassword: payload.newPassword,
      ConfirmPassword: payload.confirmPassword,
    });
  },

  /**
   * Get user by ID
   * Note: Auth service no longer returns profile data - use User service instead
   */
  getUserById: async (userId: string): Promise<User> => {
    // Fetch basic user info from User service
    return await userApi.getBasicInfo(userId);
  },
};

export type AuthApi = typeof authApi;
