import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { bookingApi } from "@/services/booking/api";
import type { BookingDto } from "@/models/booking";

// Parse ISO-like strings returned by the server. If the string already
// contains a timezone (Z or ±HH:MM) parse normally; otherwise assume the
// server returned a UTC timestamp without zone and append 'Z' so JS treats
// it as a UTC instant.
const parseServerIso = (iso?: string) =>
  iso && (iso.includes("Z") || /[+-]\d{2}:\d{2}$/.test(iso))
    ? new Date(iso)
    : iso
    ? new Date(iso + "Z")
    : new Date(NaN);

const statusStyles: Record<BookingDto["status"], string> = {
  Pending: "bg-amber-50 text-black border border-slate-800",
  PendingApproval: "bg-amber-50 text-black border border-slate-800",
  Confirmed: "bg-amber-50 text-black border border-slate-800",
  InProgress: "bg-amber-50 text-black border border-emerald-500/40",
  Completed: "bg-amber-50 text-black border border-slate-800",
  Cancelled: "bg-amber-50 text-black border border-rose-500/40",
  NoShow: "bg-amber-50 text-black border border-rose-500/40",
};

const formatCurrency = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "N/A";
  }
  return `$${value.toFixed(2)}`;
};

const formatDateTime = (iso?: string) =>
  iso
    ? parseServerIso(iso).toLocaleString("vi-VN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

const formatDuration = (start?: string, end?: string) => {
  if (!start || !end) return "N/A";
  const startTime = parseServerIso(start).getTime();
  const endTime = parseServerIso(end).getTime();
  if (Number.isNaN(startTime) || Number.isNaN(endTime)) return "N/A";
  const hours = Math.max((endTime - startTime) / 3_600_000, 0);
  return `${hours.toFixed(1)}h`;
};

const BookingDetails = () => {
  const params = useParams<{ bookingId?: string }>();
  const navigate = useNavigate();
  const bookingKey = params.bookingId ?? "";
  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!bookingKey) {
      setBooking(null);
      setError("No booking id provided in the URL.");
      return;
    }
    let mounted = true;
    setLoading(true);
    bookingApi
      .getBooking(bookingKey)
      .then((data) => {
        if (!mounted) return;
        setBooking(data);
        setError(null);
      })
      .catch((err) => {
        if (mounted) {
          setError("Unable to load booking details from the API.");
        }
        console.warn("Unable to fetch booking", err);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [bookingKey]);

  const summaryStats = useMemo(() => {
    if (!booking) return [];
    return [
      {
        label: "Duration",
        value: formatDuration(booking.startAt, booking.endAt),
        detail: `${formatDateTime(booking.startAt)} → ${formatDateTime(
          booking.endAt
        )}`,
      },
      {
        label: "Trip fee",
        value: formatCurrency(booking.tripFeeAmount),
        detail: "Estimated from booking data",
      },
      {
        label: "Distance target",
        value: booking.distanceKm
          ? `${booking.distanceKm.toFixed(1)} km`
          : "N/A",
        detail: "Planned distance",
      },
    ];
  }, [booking]);

  const handleCancel = async () => {
    if (!booking?.id) {
      setActionMessage("Select a booking before cancelling.");
      return;
    }
    setIsCancelling(true);
    setActionMessage("Submitting cancellation request...");
    try {
      await bookingApi.cancelBooking(booking.id, { reason: cancelReason });
      setBooking({ ...booking, status: "Cancelled" });
      setActionMessage("Booking cancelled successfully.");
    } catch (err) {
      console.error("Unable to cancel booking", err);
      setActionMessage("Unable to cancel booking. Please try again later.");
    } finally {
      setIsCancelling(false);
    }
  };

  const canShowDetails = Boolean(booking && bookingKey);

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 bg-amber-50 p-8 text-black">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-black">
          Booking details
        </p>
        <h1 className="text-4xl font-semibold text-black">Booking summary</h1>
        <p className="text-black">
          Displaying data fetched directly from the /api/Booking/
          {bookingKey || "..."} endpoint.
        </p>
      </header>

      {!bookingKey && (
        <div className="rounded-3xl border border-slate-800 bg-amber-50 p-6 text-sm text-black">
          Provide a booking id in the route (e.g.
          /booking/details/&lt;bookingId&gt;) to view details.
        </div>
      )}

      {loading && (
        <div className="rounded-3xl border border-slate-800 bg-amber-50 p-6 text-sm text-black">
          Loading booking from the server...
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-rose-500/40 bg-amber-50 p-6 text-sm text-black">
          <p>{error}</p>
        </div>
      )}

      {canShowDetails && booking && (
        <div className="rounded-3xl border border-slate-800 bg-amber-50 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-black">Vehicle</p>
              <p className="text-2xl font-semibold text-black">
                {booking.vehicleModel}
              </p>
              <p className="text-black">{booking.vehiclePlateNumber}</p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
                statusStyles[booking.status]
              }`}
            >
              {booking.status}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {summaryStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-800 bg-amber-50 p-4"
              >
                <p className="text-xs uppercase text-black">{stat.label}</p>
                <p className="text-2xl font-semibold text-black">
                  {stat.value}
                </p>
                <p className="text-xs text-black">{stat.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-amber-50 p-4 text-sm text-black">
              <p className="text-xs uppercase text-black">Purpose</p>
              <p>{booking.purpose ?? "Purpose not provided"}</p>
              <p className="mt-3 text-xs uppercase text-black">Notes</p>
              <p>{booking.notes ?? "No notes attached"}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-amber-50 p-4 text-sm text-black">
              <p className="text-xs uppercase text-black">Ownership</p>
              <p>{booking.groupName || booking.userId}</p>
              <p className="mt-3 text-xs uppercase text-black">Priority</p>
              <p>{booking.priority}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-amber-50 p-4 text-sm text-black">
            <p className="text-xs uppercase text-black">Actions</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {["/booking/check-in", "/booking/check-out"].map((path) => (
                <Link
                  key={path}
                  to={`${path}?bookingId=${booking.id}`}
                  className="rounded-2xl border border-slate-800 px-4 py-2 text-black"
                >
                  {path.replace("/booking/", "").split("-").join(" ")}
                </Link>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              <label className="text-xs text-black">
                Cancellation reason
                <textarea
                  rows={2}
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-800 bg-amber-50 px-4 py-2 text-sm text-black"
                  placeholder="Explain why you are cancelling"
                />
              </label>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCancelling}
                className="rounded-2xl border border-rose-500/40 px-4 py-2 text-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCancelling ? "Cancelling..." : "Cancel booking"}
              </button>
              {actionMessage && (
                <p className="text-xs text-black">{actionMessage}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-sm text-black">
        <Link
          to="/booking"
          className="rounded-2xl border border-slate-700 px-4 py-2"
        >
          Back to Booking hub
        </Link>
        <button
          type="button"
          onClick={() => navigate("/booking")}
          className="rounded-2xl bg-brand px-4 py-2 font-semibold text-black"
        >
          Refresh booking list
        </button>
      </div>
    </section>
  );
};

export default BookingDetails;
