import { createApiClient } from "@/services/api";
import type { User } from "@/models/auth";
import type {
  KycDocumentDto,
  UploadKycDocumentRequest,
  KycDocumentType,
} from "@/models/kyc";
import type {
  UserProfile,
  UpdateProfileRequest,
  NotificationPreferences,
} from "@/models/user";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/models/user";

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
   * Search user by email to get user ID (for adding members to groups)
   */
  searchByEmail: async (
    email: string
  ): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  }> => {
    const { data } = await http.get<{
      Id: string;
      Email: string;
      FirstName: string;
      LastName: string;
    }>(`/search?email=${encodeURIComponent(email)}`);
    return {
      id: data.Id || data.id || "",
      email: data.Email || data.email || "",
      firstName: data.FirstName || data.firstName || "",
      lastName: data.LastName || data.lastName || "",
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
   * Get full user profile with extended fields
   */
  getFullProfile: async (): Promise<UserProfile> => {
    const { data } = await http.get<ExtendedUserProfileDto>("/profile");
    // Parse notification preferences if present
    let notificationPreferences: NotificationPreferences | undefined;
    if (data.NotificationPreferences || data.notificationPreferences) {
      try {
        const prefsJson =
          data.NotificationPreferences || data.notificationPreferences || "{}";
        notificationPreferences = JSON.parse(prefsJson);
      } catch {
        notificationPreferences = DEFAULT_NOTIFICATION_PREFERENCES;
      }
    }

    return {
      id: data.Id || data.id || "",
      email: data.Email || data.email || "",
      firstName: data.FirstName || data.firstName || "",
      lastName: data.LastName || data.lastName || "",
      phone: data.Phone || data.phone,
      address: data.Address || data.address,
      city: data.City || data.city,
      country: data.Country || data.country,
      postalCode: data.PostalCode || data.postalCode,
      dateOfBirth: data.DateOfBirth || data.dateOfBirth,
      profilePhotoUrl: data.ProfilePhotoUrl || data.profilePhotoUrl,
      bio: data.Bio || data.bio,
      emergencyContact:
        data.EmergencyContactName || data.emergencyContactName
          ? {
              name:
                data.EmergencyContactName || data.emergencyContactName || "",
              phone:
                data.EmergencyContactPhone || data.emergencyContactPhone || "",
            }
          : undefined,
      preferredPaymentMethod:
        data.PreferredPaymentMethod || data.preferredPaymentMethod,
      notificationPreferences,
      languagePreference: data.LanguagePreference || data.languagePreference,
      createdAt: data.CreatedAt || data.createdAt || new Date().toISOString(),
      updatedAt: data.UpdatedAt || data.updatedAt,
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

  /**
   * Update profile with extended fields (for Profile Setup)
   */
  updateProfileExtended: async (
    updates: UpdateProfileRequest
  ): Promise<UserProfile> => {
    // Transform camelCase to PascalCase for backend
    const backendData: any = {
      FirstName: updates.firstName,
      LastName: updates.lastName,
      Phone: updates.phone,
      Address: updates.address,
      City: updates.city,
      Country: updates.country,
      PostalCode: updates.postalCode,
      DateOfBirth: updates.dateOfBirth,
      ProfilePhotoUrl: updates.profilePhotoUrl,
      Bio: updates.bio,
      EmergencyContactName: updates.emergencyContactName,
      EmergencyContactPhone: updates.emergencyContactPhone,
      PreferredPaymentMethod: updates.preferredPaymentMethod,
      NotificationPreferences: updates.notificationPreferences,
      LanguagePreference: updates.languagePreference,
    };

    // Remove undefined values
    Object.keys(backendData).forEach(
      (key) => backendData[key] === undefined && delete backendData[key]
    );

    const { data } = await http.put<ExtendedUserProfileDto>(
      "/profile",
      backendData
    );

    // Parse notification preferences
    let notificationPreferences: NotificationPreferences | undefined;
    if (data.NotificationPreferences || data.notificationPreferences) {
      try {
        const prefsJson =
          data.NotificationPreferences || data.notificationPreferences || "{}";
        notificationPreferences = JSON.parse(prefsJson);
      } catch {
        notificationPreferences = DEFAULT_NOTIFICATION_PREFERENCES;
      }
    }

    return {
      id: data.Id || data.id || "",
      email: data.Email || data.email || "",
      firstName: data.FirstName || data.firstName || "",
      lastName: data.LastName || data.lastName || "",
      phone: data.Phone || data.phone,
      address: data.Address || data.address,
      city: data.City || data.city,
      country: data.Country || data.country,
      postalCode: data.PostalCode || data.postalCode,
      dateOfBirth: data.DateOfBirth || data.dateOfBirth,
      profilePhotoUrl: data.ProfilePhotoUrl || data.profilePhotoUrl,
      bio: data.Bio || data.bio,
      emergencyContact:
        data.EmergencyContactName || data.emergencyContactName
          ? {
              name:
                data.EmergencyContactName || data.emergencyContactName || "",
              phone:
                data.EmergencyContactPhone || data.emergencyContactPhone || "",
            }
          : undefined,
      preferredPaymentMethod:
        data.PreferredPaymentMethod || data.preferredPaymentMethod,
      notificationPreferences,
      languagePreference: data.LanguagePreference || data.languagePreference,
      createdAt: data.CreatedAt || data.createdAt || new Date().toISOString(),
      updatedAt: data.UpdatedAt || data.updatedAt,
    };
  },

  /**
   * Upload profile photo
   */
  uploadProfilePhoto: async (file: File): Promise<string> => {
    // Convert file to base64
    const base64Content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const fileName = `profile-photo-${Date.now()}.${file.name
      .split(".")
      .pop()}`;

    // Use similar pattern to KYC upload
    const backendData = {
      FileName: fileName,
      Base64Content: base64Content,
    };

    const { data } = await http.post<{
      StorageUrl: string;
      storageUrl: string;
    }>("/profile/photo", backendData);

    return data.StorageUrl || data.storageUrl || "";
  },

  /**
   * Download profile photo file
   */
  downloadProfilePhoto: async (storageUrl: string): Promise<Blob> => {
    // Don't try to download blob URLs (they're local browser URLs)
    if (storageUrl.startsWith("blob:")) {
      throw new Error("Cannot download blob URL. Use storage URL from server.");
    }

    // Extract fileName from storageUrl
    // Format from backend: /api/User/profile/photos/{fileName}
    // But http client baseURL is already /api/User, so we need just /profile/photos/{fileName}
    let fileName = storageUrl;

    // Extract fileName from various URL formats
    if (storageUrl.includes("/profile/photos/")) {
      fileName = storageUrl.substring(storageUrl.lastIndexOf("/") + 1);
    } else if (storageUrl.includes("/photos/")) {
      fileName = storageUrl.substring(storageUrl.lastIndexOf("/") + 1);
    }

    // http client baseURL is /api/User, so endpoint should be /profile/photos/{fileName}
    const { data } = await http.get(`/profile/photos/${fileName}`, {
      responseType: "blob",
    });
    return data;
  },

  /**
   * Upload KYC document
   */
  uploadKycDocument: async (
    request: UploadKycDocumentRequest
  ): Promise<KycDocumentDto> => {
    // Transform to PascalCase for backend
    const backendData = {
      DocumentType: request.documentType,
      FileName: request.fileName,
      Base64Content: request.base64Content,
      Notes: request.notes,
    };
    const { data } = await http.post<KycDocumentDtoResponse>(
      "/kyc/upload",
      backendData
    );
    // Backend returns PascalCase, transform to camelCase
    return {
      id: data.Id || data.id || "",
      userId: data.UserId || data.userId || "",
      userName: data.UserName || data.userName || "",
      documentType: data.DocumentType ?? data.documentType ?? 0,
      fileName: data.FileName || data.fileName || "",
      storageUrl: data.StorageUrl || data.storageUrl || "",
      status: data.Status ?? data.status ?? 0,
      reviewNotes: data.ReviewNotes || data.reviewNotes,
      reviewedBy: data.ReviewedBy || data.reviewedBy,
      reviewerName: data.ReviewerName || data.reviewerName,
      reviewedAt: data.ReviewedAt || data.reviewedAt,
      uploadedAt:
        data.UploadedAt || data.uploadedAt || new Date().toISOString(),
    };
  },

  /**
   * Get current user's KYC documents
   */
  getKycDocuments: async (): Promise<KycDocumentDto[]> => {
    const { data } = await http.get<KycDocumentDtoResponse[]>("/kyc/documents");
    // Backend returns PascalCase array, transform to camelCase
    return (Array.isArray(data) ? data : []).map((item) => ({
      id: item.Id || item.id || "",
      userId: item.UserId || item.userId || "",
      userName: item.UserName || item.userName || "",
      documentType: item.DocumentType ?? item.documentType ?? 0,
      fileName: item.FileName || item.fileName || "",
      storageUrl: item.StorageUrl || item.storageUrl || "",
      status: item.Status ?? item.status ?? 0,
      reviewNotes: item.ReviewNotes || item.reviewNotes,
      reviewedBy: item.ReviewedBy || item.reviewedBy,
      reviewerName: item.ReviewerName || item.reviewerName,
      reviewedAt: item.ReviewedAt || item.reviewedAt,
      uploadedAt:
        item.UploadedAt || item.uploadedAt || new Date().toISOString(),
    }));
  },

  /**
   * Download KYC document file
   */
  downloadKycDocument: async (documentId: string): Promise<Blob> => {
    const { data } = await http.get(`/kyc/documents/${documentId}/download`, {
      responseType: "blob",
    });
    return data;
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

// Extended User Profile DTO with new fields
interface ExtendedUserProfileDto extends UserProfileDto {
  ProfilePhotoUrl?: string | null;
  profilePhotoUrl?: string | null;
  Bio?: string | null;
  bio?: string | null;
  EmergencyContactName?: string | null;
  emergencyContactName?: string | null;
  EmergencyContactPhone?: string | null;
  emergencyContactPhone?: string | null;
  PreferredPaymentMethod?: string | null;
  preferredPaymentMethod?: string | null;
  NotificationPreferences?: string | null;
  notificationPreferences?: string | null;
  LanguagePreference?: string | null;
  languagePreference?: string | null;
}

// KYC DTOs matching backend structure (backend uses PascalCase)
interface KycDocumentDtoResponse {
  Id?: string;
  id?: string;
  UserId?: string;
  userId?: string;
  UserName?: string;
  userName?: string;
  DocumentType?: KycDocumentType;
  documentType?: KycDocumentType;
  FileName?: string;
  fileName?: string;
  StorageUrl?: string;
  storageUrl?: string;
  Status?: number;
  status?: number;
  ReviewNotes?: string;
  reviewNotes?: string;
  ReviewedBy?: string;
  reviewedBy?: string;
  ReviewerName?: string;
  reviewerName?: string;
  ReviewedAt?: string;
  reviewedAt?: string;
  UploadedAt?: string;
  uploadedAt?: string;
}
