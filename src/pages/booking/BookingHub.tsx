import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { bookingApi } from "@/services/booking/api";
import type { BookingDto, DateRangeQuery } from "@/models/booking";

const bookingScreens = [
  {
    id: 12,
    title: "Booking Calendar",
    description:
      "Month/week/day schedule with co-owner colors and fairness bar.",
    href: "/booking/calendar",
    badge: "Scheduling",
  },
  {
    id: 17,
    title: "Active Trip",
    description: "Large timer, live stats, safety shortcuts.",
    href: "/booking/active-trip",
    badge: "Realtime",
  },
  {
    id: 18,
    title: "Expenses & Payments",
    description: "Summary cards, filters and list of shared costs.",
    href: "/booking/expenses",
    badge: "Finance",
  },
  {
    id: 60,
    title: "AI Booking Recommendations",
    description: "AI suggestions with confidence, fairness impact and CTA.",
    href: "/booking/ai-recommendations",
    badge: "AI",
  },
];

const STATUS_BADGES: Record<BookingDto["status"], string> = {
  Pending: "badge badge-warning",
  PendingApproval: "badge badge-warning",
  Confirmed: "badge badge-success",
  InProgress: "badge badge-primary",
  Completed: "badge badge-neutral",
  Cancelled: "badge badge-error",
  NoShow: "badge badge-error",
};

const PRIORITY_COLORS: Record<BookingDto["priority"], string> = {
  Low: "text-[var(--neutral-900)]",
  Normal: "text-[var(--neutral-900)]",
  High: "text-[var(--neutral-900)]",
  Emergency: "text-[var(--neutral-900)]",
};

const bookingDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatDateTime = (iso: string) =>
  bookingDateFormatter.format(new Date(iso));

const buildTripLink = (path: string, bookingId: string) => ({
  pathname: path,
  search: `?bookingId=${bookingId}`,
});


const tripActionLinks = [
  { label: "Trip history", path: "/booking/trip-history" },
  { label: "Check-in", path: "/booking/check-in" },
  { label: "Check-out", path: "/booking/check-out" },
  { label: "Feedback", path: "/booking/success-feedback" },
  { label: "Report issue", path: "/booking/report-issue" },
];

const bookingFlowSteps = [
  { id: 12, label: "Booking Calendar", href: "/booking/calendar" },
  { id: 13, label: "Create Booking", href: "/booking/create" },
  { id: 14, label: "Booking Details", href: "/booking/details/BK-2034" },
  { id: 15, label: "Check-In", href: "/booking/check-in" },
  { id: 17, label: "Active Trip", href: "/booking/active-trip" },
  { id: 16, label: "Check-Out", href: "/booking/check-out" },
  { id: 39, label: "Trip History", href: "/booking/trip-history" },
  { id: 40, label: "Report Issue", href: "/booking/report-issue" },
  { id: 18, label: "Expenses & Payments", href: "/booking/expenses" },
];

const BookingHub = () => {
  const [myBookings, setMyBookings] = useState<BookingDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [activeRange, setActiveRange] = useState<DateRangeQuery | undefined>();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(true);

  const fetchBookings = useCallback(async (range?: DateRangeQuery) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await bookingApi.getMyBookings(range);
      setMyBookings(Array.isArray(data) ? data : []);
      setIsUsingMockData(false);
    } catch (error) {
      console.error("Failed to load my bookings", error);
      setFetchError("Unable to load bookings.");
      setMyBookings([]);
      setIsUsingMockData(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setDateFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilter = () => {
    const range: DateRangeQuery = {};
    if (dateFilter.from) range.from = new Date(dateFilter.from).toISOString();
    if (dateFilter.to) range.to = new Date(dateFilter.to).toISOString();
    const normalizedRange = Object.keys(range).length ? range : undefined;
    setActiveRange(normalizedRange);
    fetchBookings(normalizedRange);
  };

  const handleResetFilter = () => {
    setDateFilter({ from: "", to: "" });
    setActiveRange(undefined);
    fetchBookings();
  };

  const handleCancelBooking = async (bookingId: string) => {
    const confirmCancel = window.confirm(
      "Bạn có chắc muốn huỷ booking này không?"
    );
    if (!confirmCancel) return;

    setCancellingId(bookingId);
    setActionMessage(null);
    try {
      await bookingApi.cancelBooking(bookingId, {
        reason: "Cancelled from BookingHub",
      });
      setActionMessage("Đã huỷ booking thành công.");
      await fetchBookings(activeRange);
    } catch (error) {
      console.error("Failed to cancel booking", error);
      setActionMessage("Không thể huỷ booking. Vui lòng thử lại.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-10 bg-amber-50 p-8 text-black">
      <section className="rounded-3xl border border-black/10 bg-amber-50 p-6">
        <p className="text-xs uppercase tracking-wide text-[var(--neutral-900)]">
          Booking lifecycle (Screens 12 → 18 → 39 → 40)
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold">
          {bookingFlowSteps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-3">
              <Link
                to={step.href}
                className="rounded-full border border-[var(--neutral-300)] bg-amber-50 px-4 py-2 shadow-sm hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
              >
                {step.id}. {step.label}
              </Link>
              {index < bookingFlowSteps.length - 1 && (
                <span className="text-xs text-[var(--neutral-500)]">then</span>
              )}
            </div>
          ))}
        </div>
      </section>
      <section className="booking-panel space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--neutral-900)]">
              My bookings
            </h2>
          </div>
          <Link to="/booking/create" className="btn-primary text-sm">
            Create Booking
          </Link>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex min-w-[180px] flex-1 flex-col text-xs uppercase tracking-wide text-[var(--neutral-900)]">
            From
            <input
              type="datetime-local"
              name="from"
              value={dateFilter.from}
              onChange={handleFilterChange}
              className="ds-input mt-1 w-full text-sm"
            />
          </label>
          <label className="flex min-w-[180px] flex-1 flex-col text-xs uppercase tracking-wide text-[var(--neutral-900)]">
            To
            <input
              type="datetime-local"
              name="to"
              value={dateFilter.to}
              onChange={handleFilterChange}
              className="ds-input mt-1 w-full text-sm"
            />
          </label>
          <div className="flex items-end gap-3">
            <button
              type="button"
              onClick={handleApplyFilter}
              className="btn-accent text-sm"
            >
              Apply filter
            </button>
            <button
              type="button"
              onClick={handleResetFilter}
              className="btn-secondary text-sm"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => fetchBookings(activeRange)}
              disabled={isLoading}
              className="btn-secondary text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Syncing..." : "Sync real data"}
            </button>
          </div>
        </div>
        {(actionMessage || isUsingMockData) && (
          <p className="text-sm text-[var(--neutral-900)]">
            {actionMessage ??
              "Mock data loaded from BookingDto model for preview."}
          </p>
        )}

        <div className="overflow-x-auto rounded-2xl border border-black/10 bg-amber-50">
          {fetchError ? (
            <p className="p-6 text-sm text-[var(--accent-terracotta)]">
              {fetchError}
            </p>
          ) : isLoading ? (
            <p className="p-6 text-sm text-[var(--neutral-900)]">
              Loading bookings...
            </p>
          ) : myBookings.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--neutral-900)]">
              No bookings found for this range.
            </div>
          ) : (
            <table className="booking-table text-sm">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Window</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Group</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--neutral-200)]">
                {myBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="transition hover:bg-amber-50"
                  >
                    <td>
                      <p className="font-medium text-[var(--neutral-900)]">
                        {booking.vehicleModel}
                      </p>
                      <p className="text-xs text-[var(--neutral-900)]">
                        Plate {booking.vehiclePlateNumber}
                      </p>
                    </td>
                    <td>
                      <p>{formatDateTime(booking.startAt)}</p>
                      <p className="text-xs text-[var(--neutral-900)]">
                        to {formatDateTime(booking.endAt)}
                      </p>
                    </td>
                    <td>
                      <span className={STATUS_BADGES[booking.status]}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`text-sm font-semibold ${
                          PRIORITY_COLORS[booking.priority]
                        }`}
                      >
                        {booking.priority}
                      </span>
                      {booking.isEmergency && (
                        <p className="text-xs text-[var(--accent-terracotta)]">
                          Emergency
                        </p>
                      )}
                    </td>
                    <td>
                      <p className="font-medium text-[var(--neutral-900)]">
                        {booking.groupName}
                      </p>
                      <p className="text-xs text-[var(--neutral-900)]">
                        Owner {booking.userFirstName} {booking.userLastName}
                      </p>
                    </td>
                    <td>
                      <div className="flex flex-col gap-2 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link
                            to={`/booking/details/${booking.id}`}
                            className="action-chip"
                          >
                            View detail
                          </Link>
                          {["Pending", "PendingApproval", "Confirmed"].includes(
                            booking.status
                          ) ? (
                            <button
                              type="button"
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={cancellingId === booking.id}
                              className="action-chip action-chip--danger"
                            >
                              {cancellingId === booking.id
                                ? "Cancelling..."
                                : "Cancel"}
                            </button>
                          ) : (
                            <span className="text-xs text-[var(--neutral-900)]">
                              Cannot cancel
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          {tripActionLinks.map((action) => (
                            <Link
                              key={`${booking.id}-${action.label}`}
                              to={buildTripLink(action.path, booking.id)}
                              className="action-chip"
                            >
                              {action.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--neutral-900)]">
            Supporting booking tools
          </p>
          <p className="text-sm text-[var(--neutral-900)]">
            Các flow phụ phục vụ việc chuẩn bị chuyến đi, thống kê và chạy thử
            UI riêng.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {bookingScreens.map((screen) => (
            <Link
              key={screen.id}
              to={screen.href}
              className="card group relative flex flex-col gap-3 transition hover:border-[var(--neutral-300)]"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--neutral-900)]">
                Screen {screen.id} - {screen.badge}
              </span>
              <h2 className="text-2xl font-semibold text-[var(--neutral-900)] group-hover:text-[var(--accent-blue)]">
                {screen.title}
              </h2>
              <p className="text-sm text-[var(--neutral-900)]">
                {screen.description}
              </p>
              <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-blue)]">
                Open screen
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path d="M7 17 17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
};

export default BookingHub;
