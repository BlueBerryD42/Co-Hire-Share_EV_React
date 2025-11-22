/**
 * User Profile Models
 * Extended profile information beyond basic auth User model
 */

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  dateOfBirth?: string;
  profilePhotoUrl?: string;
  bio?: string;
  emergencyContact?: EmergencyContact;
  preferredPaymentMethod?: string;
  notificationPreferences?: NotificationPreferences;
  languagePreference?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship?: string;
}

export interface NotificationPreferences {
  bookings: {
    confirmed: boolean;
    reminder: boolean;
    checkInReminder: boolean;
    checkOutReminder: boolean;
  };
  payments: {
    due: boolean;
    received: boolean;
    failed: boolean;
  };
  groupActivity: {
    newMember: boolean;
    memberLeft: boolean;
    ownershipChanged: boolean;
  };
  proposals: {
    created: boolean;
    needsVote: boolean;
    results: boolean;
  };
  vehicle: {
    maintenanceDue: boolean;
    issueReported: boolean;
  };
  system: {
    updates: boolean;
    termsChanges: boolean;
  };
  marketing?: {
    tips: boolean;
    offers: boolean;
  };
}

export interface ProfileSetupFormData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profilePhoto?: File | string; // File for upload, string for existing URL
  bio?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  preferredPaymentMethod?: string;
  languagePreference?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  dateOfBirth?: string;
  profilePhotoUrl?: string;
  bio?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  preferredPaymentMethod?: string;
  notificationPreferences?: string; // JSON string
  languagePreference?: string;
}

// Payment method options
export const PAYMENT_METHODS = [
  { value: "momo", label: "Momo" },
  { value: "zalopay", label: "ZaloPay" },
  { value: "vnpay", label: "VNPay" },
  { value: "bank_transfer", label: "Chuyển khoản ngân hàng" },
  { value: "credit_card", label: "Thẻ tín dụng/Ghi nợ" },
] as const;

// Language options
export const LANGUAGES = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "English" },
] as const;

// Default notification preferences
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  bookings: {
    confirmed: true,
    reminder: true,
    checkInReminder: true,
    checkOutReminder: true,
  },
  payments: {
    due: true,
    received: true,
    failed: true,
  },
  groupActivity: {
    newMember: true,
    memberLeft: true,
    ownershipChanged: true,
  },
  proposals: {
    created: true,
    needsVote: true,
    results: true,
  },
  vehicle: {
    maintenanceDue: true,
    issueReported: true,
  },
  system: {
    updates: true,
    termsChanges: true,
  },
  marketing: {
    tips: false,
    offers: false,
  },
};
