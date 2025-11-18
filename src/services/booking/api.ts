import { createApiClient } from "@/services/api";
import {
  type BookingCalendarResponse,
  type BookingConflictSummaryDto,
  type BookingDto,
  type BookingPriorityDto,
  type BookingSuggestionResponse,
  type CancelBookingDto,
  type CreateBookingDto,
  type DateRangeQuery,
  type SuggestionsQuery,
  type UpdateTripSummaryDto,
  type UpdateVehicleStatusDto,
  type VehicleRangeQuery,
} from "@/models/booking";

const http = createApiClient("/api/Booking");

const buildRangeRecord = (range?: DateRangeQuery) => {
  const params: Record<string, string> = {};
  if (range?.from) params.from = range.from;
  if (range?.to) params.to = range.to;
  return params;
};

export const bookingApi = {
  create: async (payload: CreateBookingDto) => {
    const { data } = await http.post<BookingDto>("", payload);
    return data;
  },
  getMyBookings: async (range?: DateRangeQuery) => {
    const { data } = await http.get<BookingDto[]>("/my-bookings", {
      params: buildRangeRecord(range),
    });
    return data;
  },
  getVehicleBookings: async ({ vehicleId, ...range }: VehicleRangeQuery) => {
    const { data } = await http.get<BookingDto[]>(`/vehicle/${vehicleId}`, {
      params: buildRangeRecord(range),
    });
    return data;
  },
  getBooking: async (bookingId: string) => {
    const { data } = await http.get<BookingDto>(`/${bookingId}`);
    return data;
  },
  checkConflicts: async (
    vehicleId: string,
    startAt: string,
    endAt: string,
    excludeBookingId?: string
  ) => {
    const params: Record<string, string> = { vehicleId, startAt, endAt };
    if (excludeBookingId) params.excludeBookingId = excludeBookingId;
    const { data } = await http.get<BookingConflictSummaryDto>("/conflicts", {
      params,
    });
    return data;
  },
  getPriorityQueue: async (
    vehicleId: string,
    startAt: string,
    endAt: string
  ) => {
    const { data } = await http.get<BookingPriorityDto[]>("/priority-queue", {
      params: { vehicleId, startAt, endAt },
    });
    return data;
  },
  getPendingApprovals: async () => {
    const { data } = await http.get<BookingDto[]>("/pending-approvals");
    return data;
  },
  approveBooking: async (bookingId: string) => {
    const { data } = await http.post<BookingDto>(`/${bookingId}/approve`);
    return data;
  },
  cancelBooking: async (bookingId: string, payload: CancelBookingDto) => {
    const { data } = await http.post<BookingDto>(
      `/${bookingId}/cancel`,
      payload
    );
    return data;
  },
  updateVehicleStatus: async (
    bookingId: string,
    payload: UpdateVehicleStatusDto
  ) => {
    const { data } = await http.patch<BookingDto>(
      `/${bookingId}/vehicle-status`,
      payload
    );
    return data;
  },
  updateTripSummary: async (
    bookingId: string,
    payload: UpdateTripSummaryDto
  ) => {
    const { data } = await http.patch<BookingDto>(
      `/${bookingId}/trip-summary`,
      payload
    );
    return data;
  },
  getCalendar: async (vehicleId: string, startDate?: string) => {
    const params: Record<string, string> = { vehicleId };
    if (startDate) params.startDate = startDate;
    const { data } = await http.get<BookingCalendarResponse>("/calendar", {
      params,
    });
    return data;
  },
  getSuggestions: async ({
    vehicleId,
    preferredDate,
    durationHours = 4,
  }: SuggestionsQuery) => {
    const { data } = await http.get<BookingSuggestionResponse>("/suggestions", {
      params: {
        vehicleId,
        preferredDate,
        durationHours,
      },
    });
    return data;
  },
};

export type BookingApi = typeof bookingApi;
