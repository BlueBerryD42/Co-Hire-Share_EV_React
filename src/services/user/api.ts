import { createApiClient } from "@/services/api";
import type { User } from "@/models/auth";

const http = createApiClient("/api/User");

export const userApi = {
  /**
   * Get current user profile (full profile with KYC documents)
   */
  getProfile: async (): Promise<User> => {
    const { data } = await http.get<UserProfileDto>("/profile");
    // Backend returns PascalCase, transform to camelCase for frontend
    return {
      id: data.Id || data.id || "",
      email: data.Email || data.email || "",
      firstName: data.FirstName || data.firstName || "",
      lastName: data.LastName || data.lastName || "",
      phone: data.Phone || data.phone || "",
      role: data.Role ?? data.role ?? 0,
      kycStatus: data.KycStatus ?? data.kycStatus ?? 0,
      createdAt: data.CreatedAt || data.createdAt || new Date().toISOString(),
    };
  },

  /**
   * Get basic user information by ID (for displaying other users' names)
   */
  getBasicInfo: async (userId: string): Promise<User> => {
    const { data } = await http.get<BasicUserInfoDto>(`/basic/${userId}`);
    // Backend returns PascalCase, transform to camelCase for frontend
    return {
      id: data.Id || data.id || userId,
      email: data.Email || data.email || "",
      firstName: data.FirstName || data.firstName || "",
      lastName: data.LastName || data.lastName || "",
      phone: data.Phone || data.phone || "",
      role: 0, // Not included in basic info
      kycStatus: 0, // Not included in basic info
      createdAt: new Date().toISOString(), // Not included in basic info
    };
  },

  /**
   * Update current user profile
   */
  updateProfile: async (updates: UpdateUserProfileDto): Promise<User> => {
    // Transform camelCase to PascalCase for backend
    const backendData = {
      FirstName: updates.firstName,
      LastName: updates.lastName,
      Phone: updates.phone,
      Address: updates.address,
      City: updates.city,
      Country: updates.country,
      PostalCode: updates.postalCode,
      DateOfBirth: updates.dateOfBirth,
    };
    const { data } = await http.put<UserProfileDto>("/profile", backendData);
    // Backend returns PascalCase, transform to camelCase for frontend
    return {
      id: data.Id || data.id || "",
      email: data.Email || data.email || "",
      firstName: data.FirstName || data.firstName || "",
      lastName: data.LastName || data.lastName || "",
      phone: data.Phone || data.phone || "",
      role: data.Role ?? data.role ?? 0,
      kycStatus: data.KycStatus ?? data.kycStatus ?? 0,
      createdAt: data.CreatedAt || data.createdAt || new Date().toISOString(),
    };
  },
};

export type UserApi = typeof userApi;

// DTOs matching backend structure (backend uses PascalCase)
interface UserProfileDto {
  // Support both PascalCase (backend) and camelCase (if transformed)
  Id?: string;
  id?: string;
  Email?: string;
  email?: string;
  FirstName?: string;
  firstName?: string;
  LastName?: string;
  lastName?: string;
  Phone?: string | null;
  phone?: string | null;
  Address?: string | null;
  address?: string | null;
  City?: string | null;
  city?: string | null;
  Country?: string | null;
  country?: string | null;
  PostalCode?: string | null;
  postalCode?: string | null;
  DateOfBirth?: string | null;
  dateOfBirth?: string | null;
  Role?: number;
  role?: number;
  KycStatus?: number;
  kycStatus?: number;
  CreatedAt?: string;
  createdAt?: string;
  UpdatedAt?: string;
  updatedAt?: string;
  KycDocuments?: any[];
  kycDocuments?: any[];
}

interface BasicUserInfoDto {
  // Support both PascalCase (backend) and camelCase (if transformed)
  Id?: string;
  id?: string;
  Email?: string;
  email?: string;
  FirstName?: string;
  firstName?: string;
  LastName?: string;
  lastName?: string;
  Phone?: string | null;
  phone?: string | null;
}

interface UpdateUserProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  dateOfBirth?: string;
}

