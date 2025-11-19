import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { bookingApi } from "@/services/booking/api";
import { checkInApi } from "@/services/booking/checkIn";
import type {
  BookingCalendarResponse,
  BookingDto,
  CheckInDto,
} from "@/models/booking";

const REFRESH_INTERVAL_MS = 30_000;

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type CalendarStatus = "mine" | "others" | "conflict" | "idle";

type CalendarEvent = {
  date: string;
  label: string;
  owner: string;
  type: CalendarStatus;
  time: string;
  booking?: BookingDto;
};

type CalendarCell = {
  iso: string;
  label: number;
  monthType: "previous" | "current" | "next";
};

const buildCalendar = (anchorDate: Date): CalendarCell[] => {
  const matrix: CalendarCell[] = [];
  const year = anchorDate.getFullYear();
  const month = anchorDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekDay = (firstDay.getDay() + 6) % 7;
  const firstVisibleDate = new Date(firstDay);
  firstVisibleDate.setDate(firstDay.getDate() - firstWeekDay);

  for (let i = 0; i < 42; i += 1) {
    const date = new Date(firstVisibleDate);
    date.setDate(firstVisibleDate.getDate() + i);
    const iso = date.toISOString().slice(0, 10);
    const monthType: CalendarCell["monthType"] =
      date.getMonth() < month
        ? "previous"
        : date.getMonth() > month
        ? "next"
        : "current";

    matrix.push({
      iso,
      label: date.getDate(),
      monthType,
    });
  }

  return matrix;
};

const formatTimeRange = (startIso: string, endIso: string) => {
  const start = new Date(startIso);
  const end = new Date(endIso);
  return `${start.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${end.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const expandBookingDates = (booking: BookingDto) => {
  const dates: string[] = [];
  const start = new Date(booking.startAt);
  const end = new Date(booking.endAt);
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

const getVehicleOwner = (booking: BookingDto) =>
  `${booking.userFirstName} ${booking.userLastName}`;

const isInactiveStatus = (status: BookingDto["status"]) => {
  if (typeof status === "number") {
    return status === 4 || status === 5;
  }
  return status === "Completed" || status === "Cancelled";
};

// const formatHistoryOdometer = (value?: number | null) =>
//   typeof value === "number" ? `${value.toLocaleString("vi-VN")} km` : "N/A";

// const formatHistoryTime = (iso?: string) =>
//   iso
//     ? new Date(iso).toLocaleString("vi-VN", {
//         hour: "2-digit",
//         minute: "2-digit",
//         day: "2-digit",
//         month: "short",
//       })
//     : "Chưa có";

// const getLatestCheckRecordForCalendar = (
//   records: CheckInDto[],
//   type: CheckInDto["type"]
// ) =>
//   [...records]
//     .filter((record) => record.type === type)
//     .sort(
//       (a, b) =>
//         new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime()
//     )
//     .pop();

const BookingCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const calendarDays = useMemo(
    () => buildCalendar(currentMonth),
    [currentMonth]
  );
  const [vehicleId, setVehicleId] = useState<string>("");
  const [calendarData, setCalendarData] =
    useState<BookingCalendarResponse | null>(null);
  const [myBookings, setMyBookings] = useState<BookingDto[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingDto | null>(
    null
  );
  const [checkInHistory, setCheckInHistory] = useState<
    Record<
      string,
      { status: "idle" | "loading" | "error"; records: CheckInDto[] }
    >
  >({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const currentMonthLabel = useMemo(
    () =>
      currentMonth.toLocaleString("en-US", { month: "long", year: "numeric" }),
    [currentMonth]
  );
  const currentMonthStartIso = useMemo(() => {
    const start = new Date(currentMonth);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return start.toISOString().slice(0, 10);
  }, [currentMonth]);

  useEffect(() => {
    let cancelled = false;
    const loadBookings = () => {
      bookingApi
        .getMyBookings()
        .then((data) => {
          if (cancelled) return;
          setMyBookings(data);
          if (data.length > 0) {
            setVehicleId((prev) => prev || data[0].vehicleId);
          }
          setSelectedBooking((previous) =>
            previous && data.some((booking) => booking.id === previous.id)
              ? previous
              : null
          );
          setSelectedDate((previous) =>
            previous &&
            data.some((booking) => booking.startAt.slice(0, 10) === previous)
              ? previous
              : null
          );
        })
        .catch((error) => {
          if (cancelled) return;
          console.error("BookingCalendar: unable to fetch bookings", error);
        });
    };

    loadBookings();
    const intervalId = window.setInterval(loadBookings, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!vehicleId) return;
    let cancelled = false;

    const loadCalendar = () => {
      bookingApi
        .getCalendar(vehicleId, currentMonthStartIso)
        .then((data) => {
          if (!cancelled) setCalendarData(data);
        })
        .catch((error) => {
          if (!cancelled) console.error("Failed to load calendar", error);
        })
        .finally(() => {
          if (!cancelled) setLoadingCalendar(false);
        });
    };

    loadCalendar();
    const intervalId = window.setInterval(loadCalendar, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [vehicleId, currentMonthStartIso]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    const myBookingIds = new Set(myBookings.map((booking) => booking.id));

    const addBookingEvent = (booking: BookingDto, type: CalendarStatus) => {
      const dates = expandBookingDates(booking);
      dates.forEach((date) => {
        if (!map[date]) map[date] = [];
        map[date].push({
          date,
          label: booking.vehicleModel,
          owner: getVehicleOwner(booking),
          type,
          time: formatTimeRange(booking.startAt, booking.endAt),
          booking,
        });
      });
    };

    myBookings
      .filter((booking) => !isInactiveStatus(booking.status))
      .forEach((booking) => addBookingEvent(booking, "mine"));
    calendarData?.bookings?.forEach((booking) => {
      if (myBookingIds.has(booking.id)) return;
      if (isInactiveStatus(booking.status)) return;
      addBookingEvent(booking, "others");
    });

    return map;
  }, [myBookings, calendarData]);

  const handleDaySelect = (iso: string) => {
    setSelectedDate(iso);
    const bookingEvent = (eventsByDate[iso] ?? []).find(
      (event) => event.booking
    );
    setSelectedBooking(bookingEvent?.booking ?? null);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedDate(event.date);
    if (event.booking) {
      setSelectedBooking(event.booking);
    }
  };

  const handleMonthChange = (delta: number) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + delta, 1);
      return next;
    });
  };

  const selectedDateEvents = selectedDate
    ? eventsByDate[selectedDate] ?? []
    : [];

  // const selectedHistoryMeta = selectedBooking
  //   ? checkInHistory[selectedBooking.id]
  //   : undefined;

  useEffect(() => {
    if (!selectedBooking) return;
    const bookingId = selectedBooking.id;
    const historyMeta = checkInHistory[bookingId];
    if (
      historyMeta?.status === "loading" ||
      (historyMeta && historyMeta.records.length > 0)
    ) {
      return;
    }
    let cancelled = false;
    setCheckInHistory((prev) => ({
      ...prev,
      [bookingId]: {
        status: "loading",
        records: prev[bookingId]?.records ?? [],
      },
    }));
    checkInApi
      .getHistory(bookingId)
      .then((data) => {
        if (!cancelled) {
          setCheckInHistory((prev) => ({
            ...prev,
            [bookingId]: { status: "idle", records: data },
          }));
        }
      })
      .catch((error) => {
        console.error(
          "BookingCalendar: unable to fetch check-in history",
          error
        );
        if (!cancelled) {
          setCheckInHistory((prev) => ({
            ...prev,
            [bookingId]: { status: "error", records: [] },
          }));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedBooking, selectedBooking?.id, checkInHistory]);

  // const selectedCheckIns = selectedHistoryMeta?.records ?? [];
  // const historyStatus =
  //   selectedHistoryMeta?.status ?? (selectedBooking ? "loading" : "idle");
  // const latestCheckOut = getLatestCheckRecordForCalendar(
  //   selectedCheckIns,
  //   "CheckOut"
  // );
  // const latestCheckIn = getLatestCheckRecordForCalendar(
  //   selectedCheckIns,
  //   "CheckIn"
  // );

  // const renderCheckSummary = (label: string, record?: CheckInDto) => (
  //   <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
  //     <p className="text-xs uppercase text-black">{label}</p>
  //     {record ? (
  //       <>
  //         <p>Odo {formatHistoryOdometer(record.odometer)}</p>
  //         <p>{formatHistoryTime(record.checkInTime)}</p>
  //       </>
  //     ) : (
  //       <p className="text-sm text-black">Chưa có dữ liệu</p>
  //     )}
  //   </div>
  // );

  return (
    <section className="mx-auto max-w-6xl space-y-10 rounded-3xl bg-amber-50 p-8 text-black shadow-2xl">
      <div className="space-y-10">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold text-black">My Booking</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/booking/create"
                className="rounded-2xl bg-brand px-5 py-2 font-semibold text-black transition hover:bg-brand/80"
              >
                Create booking
              </Link>
              <Link
                to="/booking/trip-history"
                className="rounded-2xl border border-slate-800 px-5 py-2 font-semibold text-black hover:border-brand hover:text-black"
              >
                Booking history
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-lg lg:col-span-2">
            <div className="flex flex-col gap-4 border-b border-amber-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-2xl font-semibold text-black">
                  {currentMonthLabel}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  className="rounded-full border border-amber-300 p-2 text-black transition hover:border-brand hover:text-black"
                  type="button"
                  onClick={() => handleMonthChange(-1)}
                  aria-label="Previous month"
                >
                  Prev
                </button>
                <button
                  className="rounded-full border border-amber-300 p-2 text-black transition hover:border-brand hover:text-black"
                  type="button"
                  onClick={() => handleMonthChange(1)}
                  aria-label="Next month"
                >
                  Next
                </button>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-wide text-black">
              {weekDays.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2 text-sm">
              {calendarDays.map((day) => {
                const events = eventsByDate[day.iso] ?? [];
                const isToday =
                  day.iso === new Date().toISOString().slice(0, 10);
                const hasMine = events.some((event) => event.type === "mine");
                const containerClasses = [
                  "flex",
                  "min-h-[120px]",
                  "flex-col",
                  "rounded-2xl",
                  "border",
                  "p-2",
                  "transition",
                  "hover:border-brand/60",
                  "hover:bg-amber-50",
                ];
                if (hasMine)
                  containerClasses.push("border-brand/60 bg-brand/10");
                else containerClasses.push("border-amber-200 bg-amber-50");
                if (day.monthType !== "current")
                  containerClasses.push("opacity-60");
                if (isToday) containerClasses.push("ring-1 ring-brand/60");

                return (
                  <div key={day.iso} className={containerClasses.join(" ")}>
                    <button
                      type="button"
                      className="flex items-center justify-between text-xs text-black"
                      onClick={() => handleDaySelect(day.iso)}
                    >
                      <span>{day.label}</span>
                      {events.length > 0 && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-black">
                          {events.length}
                        </span>
                      )}
                    </button>
                    <div className="mt-2 space-y-2">
                      {events.map((event) => {
                        const isSelected =
                          selectedBooking?.id &&
                          event.booking?.id === selectedBooking.id;
                        return (
                          <button
                            type="button"
                            key={`${day.iso}-${event.label}-${event.time}`}
                            onClick={() => handleEventClick(event)}
                            className={`w-full rounded-xl border px-2 py-1 text-left text-xs ${
                              isSelected
                                ? "border-brand bg-brand/10 text-black"
                                : "border-amber-200 bg-amber-50 text-black"
                            }`}
                          >
                            <p className="font-semibold">{event.label}</p>
                            <p className="text-[11px] text-black">
                              {event.time}
                            </p>
                            <p className="text-[11px] text-black">
                              {event.owner}
                            </p>
                          </button>
                        );
                      })}
                      {events.length === 0 && (
                        <p className="text-[11px] text-black">No bookings</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="space-y-4 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-black shadow-lg lg:sticky lg:top-8 lg:self-start">
            <p className="text-xs uppercase tracking-wide text-black">
              Booking info
            </p>
            {selectedBooking ? (
              <div className="space-y-3">
                <p className="text-lg font-semibold text-black">
                  {selectedBooking.vehicleModel}
                </p>
                <p>
                  {new Date(selectedBooking.startAt).toLocaleString()} -{" "}
                  {new Date(selectedBooking.endAt).toLocaleTimeString()}
                </p>
                <p>
                  Owner: {selectedBooking.userFirstName}{" "}
                  {selectedBooking.userLastName}
                </p>
                <p>Status: {selectedBooking.status}</p>
                <p>Purpose: {selectedBooking.purpose ?? "N/A"}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Link
                    to={`/booking/details/${selectedBooking.id}`}
                    className="rounded-full border border-amber-300 px-4 py-1 text-black hover:bg-amber-50"
                  >
                    Details
                  </Link>
                  <Link
                    to={`/booking/check-in?bookingId=${selectedBooking.id}`}
                    className="rounded-full border border-amber-300 px-4 py-1 text-black hover:bg-amber-50"
                  >
                    Check-In
                  </Link>
                  {/* <Link
                    to={`/booking/active-trip?bookingId=${selectedBooking.id}`}
                    className="rounded-full border border-amber-300 px-4 py-1 text-black hover:bg-amber-50"
                  >
                    Active Trip (17)
                  </Link> */}
                  <Link
                    to={`/booking/check-out?bookingId=${selectedBooking.id}`}
                    className="rounded-full border border-amber-300 px-4 py-1 text-black hover:bg-amber-50"
                  >
                    Check-Out
                  </Link>
                </div>
                {/* <div className="space-y-2 border-t border-amber-200 pt-4">
                  <p className="text-xs uppercase tracking-wide text-black">
                    Check-in / Check-out
                  </p>
                  {historyStatus === "loading" && (
                    <p className="text-sm text-black">
                      Đang tải lịch sử check-in/out...
                    </p>
                  )}
                  {historyStatus === "error" && (
                    <p className="text-sm text-red-600">
                      Không thể lấy lịch sử check-in/out.
                    </p>
                  )}
                  {historyStatus === "idle" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {renderCheckSummary("Latest check-out", latestCheckOut)}
                      {renderCheckSummary("Latest check-in", latestCheckIn)}
                    </div>
                  )}
                </div> */}
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDate ? (
                  <>
                    <p className="font-semibold text-black">
                      {new Date(selectedDate).toDateString()}
                    </p>
                    <p>No personal bookings selected on this date.</p>
                    {selectedDateEvents.length > 0 && (
                      <ul className="list-disc pl-4">
                        {selectedDateEvents.map((event) => (
                          <li key={`${event.label}-${event.time}`}>
                            {event.label} - {event.time} ({event.owner})
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <p>
                    Select a day or booking on the calendar to preview details
                    here.
                  </p>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
};

export default BookingCalendar;
