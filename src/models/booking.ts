import type { VehicleStatus } from "@/models/vehicle";

// Shared helpers
export type UUID = string;
export type ISODate = string;

export type BookingStatus =
  | "Pending"
  | "PendingApproval"
  | "Confirmed"
  | "InProgress"
  | "Completed"
  | "Cancelled"
  | "NoShow";

export type BookingPriority = "Low" | "Normal" | "High" | "Emergency";

export interface BookingDto {
  id: UUID;
  vehicleId: UUID;
  vehicleModel: string;
  vehiclePlateNumber: string;
  groupId: UUID;
  groupName: string;
  userId: UUID;
  userFirstName: string;
  userLastName: string;
  startAt: ISODate;
  endAt: ISODate;
  status: BookingStatus;
  priorityScore: number;
  notes?: string;
  purpose?: string;
  isEmergency: boolean;
  priority: BookingPriority;
  requiresDamageReview: boolean;
  recurringBookingId?: UUID;
  createdAt: ISODate;
  vehicleStatus: VehicleStatus;
  distanceKm?: number | null;
  tripFeeAmount: number;
}

export interface CreateBookingDto {
  vehicleId: UUID;
  startAt: ISODate;
  endAt: ISODate;
  notes?: string;
  purpose?: string;
  isEmergency?: boolean;
  emergencyReason?: string;
  emergencyAutoCancelConflicts?: boolean;
  priority?: BookingPriority | number;
  userId: UUID;
  groupId: UUID;
}

export interface UpdateBookingDto {
  startAt?: ISODate;
  endAt?: ISODate;
  status?: BookingStatus;
  notes?: string;
}

export interface CancelBookingDto {
  reason?: string;
}

export interface UpdateVehicleStatusDto {
  status: VehicleStatus;
}

export interface UpdateTripSummaryDto {
  distanceKm: number;
}

export interface BookingConflictSummaryDto {
  vehicleId: UUID;
  requestedStartAt: ISODate;
  requestedEndAt: ISODate;
  hasConflicts: boolean;
  conflictingBookings: BookingDto[];
}

export interface BookingPriorityDto {
  bookingId: UUID;
  userId: UUID;
  userName: string;
  vehicleId: UUID;
  startAt: ISODate;
  endAt: ISODate;
  status: BookingStatus;
  priority: number;
  isEmergency: boolean;
  priorityScore: number;
  ownershipPercentage: number;
}

export interface BookingCalendarResponse {
  vehicleId: UUID;
  startDate: ISODate;
  endDate: ISODate;
  bookings: BookingDto[];
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
}

export interface BookingSuggestion {
  startAt: ISODate;
  endAt: ISODate;
  isOptimal: boolean;
  confidence: "High" | "Medium" | "Low";
}

export interface BookingSuggestionResponse {
  vehicleId: UUID;
  preferredDate: ISODate;
  durationHours: number;
  suggestions: BookingSuggestion[];
}

export type DateRangeQuery = {
  from?: ISODate;
  to?: ISODate;
};

export type SuggestionsQuery = {
  vehicleId: UUID;
  preferredDate: ISODate;
  durationHours?: number;
};

export type VehicleRangeQuery = DateRangeQuery & {
  vehicleId: UUID;
};

// Check-in / trip DTOs (previously in bookingExtras)
export type CheckInType = "CheckOut" | "CheckIn";

export const PhotoTypeValue = {
  Exterior: 0,
  Interior: 1,
  Dashboard: 2,
  Damage: 3,
  Other: 4,
} as const;

export type PhotoType = (typeof PhotoTypeValue)[keyof typeof PhotoTypeValue];

export interface CheckInPhotoDto {
  id: UUID;
  checkInId: UUID;
  photoUrl: string;
  thumbnailUrl?: string | null;
  type: PhotoType;
  description?: string | null;
  contentType?: string | null;
  capturedAt?: ISODate;
  latitude?: number | null;
  longitude?: number | null;
  isDeleted: boolean;
}

export interface CheckInPhotoInputDto {
  photoUrl: string;
  type: PhotoType;
  description?: string;
}

export interface SignatureMetadataDto {
  capturedAt?: ISODate;
  device?: string | null;
  deviceId?: string | null;
  ipAddress?: string | null;
  hash?: string | null;
  matchesPrevious?: boolean | null;
  certificateUrl?: string | null;
  additionalMetadata?: Record<string, string>;
}

export interface LateReturnFeeDto {
  id: UUID;
  bookingId: UUID;
  checkInId: UUID;
  userId: UUID;
  vehicleId: UUID;
  groupId: UUID;
  lateDurationMinutes: number;
  feeAmount: number;
  originalFeeAmount?: number;
  calculationMethod?: string;
  status: string;
  expenseId?: UUID;
  invoiceId?: UUID;
  waivedBy?: UUID;
  waivedReason?: string;
  waivedAt?: ISODate;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface CheckInDto {
  id: UUID;
  bookingId: UUID;
  userId: UUID;
  vehicleId?: UUID | null;
  userFirstName: string;
  userLastName: string;
  type: CheckInType;
  odometer: number;
  checkInTime: ISODate;
  isLateReturn: boolean;
  lateReturnMinutes?: number | null;
  lateFeeAmount?: number | null;
  lateReturnFee?: LateReturnFeeDto | null;
  notes?: string | null;
  signatureReference?: string | null;
  signatureMetadata?: SignatureMetadataDto | null;
  photos: CheckInPhotoDto[];
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface BookingHistoryEntryDto {
  booking: BookingDto;
  checkIns: CheckInDto[];
}

export interface StartTripDto {
  bookingId: UUID;
  odometerReading: number;
  notes?: string;
  signatureReference?: string;
  clientTimestamp?: ISODate;
  photos?: CheckInPhotoInputDto[];
}

export interface EndTripDto {
  bookingId: UUID;
  odometerReading: number;
  notes?: string;
  signatureReference?: string;
  clientTimestamp?: ISODate;
  photos?: CheckInPhotoInputDto[];
}

export interface VehicleQrCodeResponseDto {
  vehicleId: UUID;
  format: "dataUrl" | "payload";
  payload: string;
  expiresAt: ISODate;
}
