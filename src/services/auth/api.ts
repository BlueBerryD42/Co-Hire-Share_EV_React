import Cookies from "js-cookie";
import { createApiClient } from "@/services/api";
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

const http = createApiClient("/api/Auth");

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
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    console.log("Sending login request:", credentials);
    const response = await http.post<AuthResponse>("/login", credentials);
    console.log("Raw response from backend:", response);
    console.log("Response data:", response.data);
    return response.data;
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
    const backendData = {
      FirstName: firstName,
      LastName: lastName,
      Email: userData.email,
      PhoneNumber: userData.phoneNumber,
      Password: userData.password,
      ConfirmPassword: userData.confirmPassword,
    };

    const { data } = await http.post<RegisterResponse>(
      "/register",
      backendData
    );
    return data;
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    const refreshToken = Cookies.get("refresh_token");
    await http.post("/logout", { RefreshToken: refreshToken });
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<User> => {
    const { data } = await http.get<User>("/me");
    return data;
  },

  /**
   * Request password reset email
   */
  requestPasswordReset: async (
    payload: PasswordResetRequest
  ): Promise<void> => {
    await http.post("/forgot-password", payload);
  },

  /**
   * Confirm password reset with token
   */
  confirmPasswordReset: async (
    payload: PasswordResetConfirm
  ): Promise<void> => {
    await http.post("/reset-password", payload);
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await http.post<AuthResponse>("/refresh", {
      refreshToken,
    });
    return data;
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

    const response = await http.post("/confirm-email", payload);
    console.log("Verify email response:", response);
    return response.data;
  },

  /**
   * Resend email confirmation
   */
  resendVerificationEmail: async (email: string): Promise<void> => {
    await http.post("/resend-confirmation", { Email: email });
  },

  /**
   * Validate authentication token
   */
  validateToken: async (token: string): Promise<boolean> => {
    const { data } = await http.post<boolean>("/validate", { Token: token });
    return data;
  },

  /**
   * Change password (when user is logged in)
   */
  changePassword: async (payload: ChangePasswordRequest): Promise<void> => {
    await http.post("/change-password", {
      CurrentPassword: payload.currentPassword,
      NewPassword: payload.newPassword,
      ConfirmPassword: payload.confirmPassword,
    });
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: string): Promise<User> => {
    const { data } = await http.get<User>(`/user/${userId}`);
    return data;
  },
};

export type AuthApi = typeof authApi;
