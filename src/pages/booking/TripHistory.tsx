import { useEffect, useMemo, useState } from "react";
import { bookingApi } from "@/services/booking/api";
import type {
  BookingDto,
  BookingHistoryEntryDto,
  CheckInDto,
} from "@/models/booking";

type TripStatus = "Completed" | "Cancelled" | string;

const normalizeStatus = (status: BookingDto["status"]): TripStatus => {
  if (typeof status === "number") {
    if (status === 4) return "Completed";
    if (status === 5) return "Cancelled";
    return status.toString();
  }
  return status;
};

const getLatestRecord = (
  records: CheckInDto[],
  type: CheckInDto["type"]
): CheckInDto | undefined =>
  [...records]
    .filter((record) => record.type === type)
    .sort(
      (a, b) =>
        new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime()
    )
    .pop();

const formatOdometer = (value?: number | null) =>
  typeof value === "number" ? `${value.toLocaleString("vi-VN")} km` : "N/A";

const formatDateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatDateTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

const getStatusBadgeClass = (status: TripStatus) => {
  const map: Record<TripStatus, string> = {
    Completed: "bg-amber-50 text-black",
    Cancelled: "bg-amber-50 text-black",
  };
  return map[status] ?? "bg-amber-50 text-black";
};

const buildHistoryCards = (entries: BookingHistoryEntryDto[]) =>
  entries.map((entry) => {
    const { booking, checkIns } = entry;
    const lastCheckOut = getLatestRecord(checkIns, "CheckOut");
    const lastCheckIn = getLatestRecord(checkIns, "CheckIn");
    const start = new Date(booking.startAt);
    const end = new Date(booking.endAt);
    const durationHours = Math.max(
      (end.getTime() - start.getTime()) / 3_600_000,
      0
    );
    const normalizedStatus = normalizeStatus(booking.status);

    return {
      id: booking.id,
      date: formatDateLabel(booking.startAt),
      vehicle: booking.vehicleModel,
      duration: `${durationHours.toFixed(1)}h`,
      distance: booking.distanceKm
        ? `${booking.distanceKm.toFixed(1)} km`
        : "N/A",
      cost:
        typeof booking.tripFeeAmount === "number"
          ? `$${booking.tripFeeAmount.toFixed(2)}`
          : "N/A",
      status: normalizedStatus,
      checkIn: {
        odo: formatOdometer(lastCheckIn?.odometer),
        time: formatDateTime(lastCheckIn?.checkInTime),
      },
      checkOut: {
        odo: formatOdometer(lastCheckOut?.odometer),
        time: formatDateTime(lastCheckOut?.checkInTime),
      },
      issues:
        normalizedStatus === "Cancelled"
          ? [booking.notes ? `Reason: ${booking.notes}` : "Cancelled"]
          : booking.requiresDamageReview
          ? ["Damage review required"]
          : [],
    };
  });

const TripHistory = () => {
  const [historyEntries, setHistoryEntries] = useState<
    BookingHistoryEntryDto[]
  >([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    let mounted = true;
    setStatus("loading");
    bookingApi
      .getMyBookingHistory(50)
      .then((data) => {
        if (mounted) {
          setHistoryEntries(data);
          setStatus("idle");
        }
      })
      .catch((error) => {
        console.error("TripHistory: unable to fetch booking history", error);
        if (mounted) setStatus("error");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const cards = useMemo(
    () => buildHistoryCards(historyEntries),
    [historyEntries]
  );

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 bg-amber-50 p-8 text-black">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold text-black">Trip history</h1>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {["Date", "Vehicle", "Status"].map((label) => (
          <label key={label} className="space-y-2 text-sm text-black">
            <span>{label}</span>
            <select className="w-full rounded-2xl border border-slate-800 bg-amber-50 px-4 py-3">
              <option>All</option>
              <option>Option A</option>
              <option>Option B</option>
            </select>
          </label>
        ))}
      </div>

      <div className="space-y-4">
        {status === "error" && (
          <p className="text-sm text-red-600">
            Không thể tải lịch sử booking. Vui lòng thử lại.
          </p>
        )}
        {status === "idle" && cards.length === 0 && (
          <p className="text-sm text-black">
            Bạn chưa có booking đã hoàn thành hoặc bị hủy.
          </p>
        )}
        {cards.map((trip) => (
          <article
            key={trip.id}
            className="rounded-3xl border border-slate-800 bg-amber-50 p-6"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase text-black">{trip.date}</p>
                <h2 className="text-2xl font-semibold text-black">
                  {trip.vehicle} - {trip.id}
                </h2>
                <p className="text-black">
                  {trip.duration} - {trip.distance}
                </p>
              </div>
              <span
                className={`inline-flex rounded-full px-4 py-1 text-xs font-semibold ${getStatusBadgeClass(
                  trip.status
                )}`}
              >
                {trip.status}
              </span>
            </div>

            <div className="mt-4 grid gap-4 text-sm text-black md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-amber-50 p-4">
                <p className="text-xs uppercase text-black">Check-in</p>
                <p>Odo {trip.checkIn.odo}</p>
                <p>{trip.checkIn.time}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-amber-50 p-4">
                <p className="text-xs uppercase text-black">Check-out</p>
                <p>Odo {trip.checkOut.odo}</p>
                <p>{trip.checkOut.time}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-amber-50 p-4">
                <p className="text-xs uppercase text-black">Cost</p>
                <p className="text-2xl font-semibold text-black">{trip.cost}</p>
                {trip.issues.length > 0 ? (
                  <p className="text-black">Issues: {trip.issues.join(", ")}</p>
                ) : (
                  <p className="text-black">No issues</p>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TripHistory;
