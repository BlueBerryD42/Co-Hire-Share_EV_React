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
  priority?: BookingPriority;
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

export interface BookingNotificationPreferenceDto {
  enableReminders: boolean;
  enableEmail: boolean;
  enableSms: boolean;
  preferredTimeZoneId?: string | null;
  updatedAt: ISODate;
}

export interface UpdateBookingNotificationPreferenceDto {
  enableReminders?: boolean;
  enableEmail?: boolean;
  enableSms?: boolean;
  preferredTimeZoneId?: string | null;
}
