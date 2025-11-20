import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { bookingApi } from "@/services/booking/api";
import type { BookingDto } from "@/models/booking";
import { parseServerIso } from "@/utils/bookingHelpers";

const formatDuration = (durationMs: number) => {
  const totalSeconds = Math.max(Math.floor(durationMs / 1000), 0);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const formatDateTime = (date: Date) =>
  date.toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const formatCurrency = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Pending";
  }
  return `$${value.toFixed(2)}`;
};

const ActiveTrip = () => {
  const [activeBooking, setActiveBooking] = useState<BookingDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    bookingApi
      .getMyBookings()
      .then((data) => {
        if (!mounted) return;
        const nextActive =
          data.find((booking) => booking.status === "InProgress") ??
          data[0] ??
          null;
        setActiveBooking(nextActive);
        setError(null);
      })
      .catch(() => {
        if (mounted) {
          setError("Unable to load active trip.");
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    if (!activeBooking) return [];
    const start = new Date(activeBooking.startAt);
    const end = new Date(activeBooking.endAt);
    const now = new Date();
    const elapsedMs = Math.max(now.getTime() - start.getTime(), 0);
    const plannedMs = Math.max(end.getTime() - start.getTime(), 0);
    return [
      {
        label: "Elapsed time",
        value: formatDuration(elapsedMs),
        detail: `Started ${formatDateTime(start)}`,
      },
      {
        label: "Trip window",
        value: `${formatDateTime(start)} – ${formatDateTime(end)}`,
        detail: `${(plannedMs / 3_600_000).toFixed(1)}h planned`,
      },
      {
        label: "Priority",
        value: activeBooking.priority,
        detail: activeBooking.isEmergency ? "Emergency booking" : "Standard",
      },
      {
        label: "Trip fee",
        value: formatCurrency(activeBooking.tripFeeAmount),
        detail: "Estimate from booking record",
      },
    ];
  }, [activeBooking]);

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 bg-amber-50 p-8 text-black">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-black">Screen 17</p>
        <h1 className="text-4xl font-semibold text-black">Active trip</h1>
        <p className="text-black">
          Timer, live stats, map preview and quick actions.
        </p>
      </header>

      <div className="rounded-3xl border border-slate-800 bg-amber-50 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase text-black">Trip timer</p>
            <p className="text-6xl font-semibold text-black">
              {stats.length > 0 ? stats[0].value : "00:00:00"}
            </p>
            <p className="text-black">
              {activeBooking
                ? `${activeBooking.vehicleModel} · ${parseServerIso(
                    activeBooking.startAt
                  ).toLocaleTimeString()}`
                : isLoading
                ? "Đang tải chuyến..."
                : error
                ? error
                : "Chưa có chuyến đang hoạt động"}
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm text-black">
            <button
              type="button"
              className="rounded-full border border-rose-500/50 px-5 py-3 text-black"
            >
              Emergency contact
            </button>
            <button
              type="button"
              className="rounded-full border border-brand/60 bg-brand/10 px-5 py-3 font-semibold text-black"
            >
              End trip
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-rose-600">{error}</p>}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {stats.length > 0 ? (
            stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-800 bg-amber-50 p-4"
              >
                <p className="text-xs uppercase text-black">{stat.label}</p>
                <p className="text-3xl font-semibold text-black">
                  {stat.value}
                </p>
                <p className="text-sm text-black">{stat.detail}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-amber-50 p-4">
              <p className="text-sm text-black">
                {isLoading
                  ? "Đang tải dữ liệu chuyến..."
                  : "Không có chuyến đang hoạt động."}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-black">Map view</p>
            <div className="mt-3 h-64 rounded-2xl border border-dashed border-slate-700 bg-[radial-gradient(circle_at_top,#1e293b,#020617)]" />
          </div>
          <div className="space-y-3 rounded-3xl border border-slate-800 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-black">Booking notes</p>
            <p className="text-sm text-black">
              {activeBooking?.notes ?? "Không có ghi chú thêm từ người dùng."}
            </p>
            <p className="text-xs uppercase text-black">
              Status: {activeBooking?.status ?? "N/A"}
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              <Link
                to="/booking/check-in"
                className="rounded-full border border-slate-800 px-4 py-2 text-black"
              >
                Go to Check-in
              </Link>
              <Link
                to="/booking/check-out"
                className="rounded-full border border-slate-800 px-4 py-2 text-black"
              >
                Go to Check-out
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-black">
          <Link
            to="/booking/check-out"
            className="rounded-2xl bg-brand px-5 py-2 text-black font-semibold"
          >
            Next: Check-Out (Screen 16)
          </Link>
          <Link
            to="/booking/trip-history"
            className="rounded-2xl border border-slate-700 px-5 py-2"
          >
            View Trip History
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ActiveTrip;
