import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { bookingApi } from "@/services/booking/api";
import { checkInApi } from "@/services/booking/checkIn";
import TripStageCard from "@/pages/user/booking/components/TripStageCard";
import {
  PhotoTypeValue,
  type BookingDto,
  type CheckInDto,
  type CheckInPhotoInputDto,
} from "@/models/booking";
import type { VehicleStatus } from "@/models/vehicle";
import { parseServerIso, isInactiveStatus } from "@/utils/bookingHelpers";

const stepLabels = ["Load booking", "Pre-trip photos", "Confirm start"];

const normalizeCheckRecordType = (type: CheckInDto["type"] | number) => {
  if (typeof type === "number") {
    return type === 0 ? "CheckOut" : "CheckIn";
  }
  return type;
};

const isCheckOutRecord = (record: CheckInDto) =>
  normalizeCheckRecordType(record.type) === "CheckOut";

const isCheckInRecord = (record: CheckInDto) =>
  normalizeCheckRecordType(record.type) === "CheckIn";

const HistoryTable = ({
  title,
  records,
}: {
  title: string;
  records: CheckInDto[];
}) => (
  <div className="rounded-3xl border border-slate-800 bg-[#f5ebe0] p-4 text-sm text-black">
    <p className="text-xs uppercase tracking-wide text-black">{title}</p>
    {records.length === 0 ? (
      <p className="py-3 text-center text-xs text-black">Chưa có dữ liệu</p>
    ) : (
      <table className="mt-3 w-full text-left text-xs">
        <thead>
          <tr>
            <th className="py-2">Time</th>
            <th className="py-2">Odometer</th>
            <th className="py-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td className="py-2">
                {parseServerIso(record.checkInTime).toLocaleString()}
              </td>
              <td className="py-2">{record.odometer ?? "--"}</td>
              <td className="py-2">{record.notes ?? "--"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

const CheckIn = () => {
  const [searchParams] = useSearchParams();
  const [bookingId, setBookingId] = useState("");
  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<CheckInDto[]>([]);
  const [historyMessage, setHistoryMessage] = useState<string | null>(null);
  const [startForm, setStartForm] = useState({ odometer: "", notes: "" });
  const [startPhotos, setStartPhotos] = useState<CheckInPhotoInputDto[]>([]);
  const [tripStarted, setTripStarted] = useState(false);
  const checkOutHistory = useMemo(
    () => history.filter(isCheckOutRecord),
    [history]
  );

  const bookingStartsInFuture = useMemo(() => {
    if (!booking) return false;
    const startTime = parseServerIso(booking.startAt).getTime();
    return !Number.isNaN(startTime) && startTime > Date.now();
  }, [booking]);

  const bookingExpired = useMemo(() => {
    if (!booking) return false;
    const endTime = parseServerIso(booking.endAt).getTime();
    return !Number.isNaN(endTime) && endTime < Date.now();
  }, [booking]);

  // use shared helper `isInactiveStatus` from utils

  const bookingIsReadOnly = useMemo(() => {
    if (!booking) return true;
    return bookingExpired || isInactiveStatus(booking.status);
  }, [booking, bookingExpired]);

  const refreshHistory = useCallback(async () => {
    if (!booking) return;
    try {
      const records = await checkInApi.getHistory(booking.id);
      setHistory(records);
      setHistoryMessage(
        `Fetched ${
          records.length
        } check-in record(s) for booking ${booking.id.slice(0, 8)}.`
      );

      const lastStart = [...records]
        .reverse()
        .find((record) => isCheckOutRecord(record));
      const lastEnd = [...records]
        .reverse()
        .find((record) => isCheckInRecord(record));

      let hasOpenTrip = false;
      if (lastStart) {
        const lastEndBeforeStart =
          !lastEnd ||
          parseServerIso(lastEnd.checkInTime).getTime() <
            parseServerIso(lastStart.checkInTime).getTime();
        hasOpenTrip = lastEndBeforeStart;
      }
      setTripStarted(hasOpenTrip);
    } catch {
      setHistoryMessage("Unable to load check-in history.");
    }
  }, [booking]);

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory]);

  const convertFilesToPhotos = async (
    fileList: FileList,
    existing: CheckInPhotoInputDto[]
  ) => {
    const files = Array.from(fileList);
    const newPhotos = await Promise.all(
      files.map(
        (file) =>
          new Promise<CheckInPhotoInputDto>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                photoUrl: reader.result as string,
                type: PhotoTypeValue.Exterior,
                description: file.name,
              });
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );
    return [...existing, ...newPhotos];
  };

  const updateVehicleStatus = async (status: VehicleStatus) => {
    if (!booking) return;
    try {
      await bookingApi.updateVehicleStatus(booking.id, { status });
    } catch {
      // Non-fatal: ignore vehicle status update failures
    }
  };

  const handleLoadBookingById = useCallback(async (id: string) => {
    if (!id) {
      setMessage("Enter a booking id before loading.");
      return;
    }
    setLoading(true);
    setMessage("Loading booking...");
    setBookingId(id);
    try {
      const data = await bookingApi.getBooking(id);
      setBooking(data);
      setMessage(`Loaded ${data.vehicleModel}`);
      setStartForm({ odometer: "", notes: "" });
      setStartPhotos([]);
      setTripStarted(false);
      setHistory([]);
      setHistoryMessage(null);
    } catch {
      setMessage("Unable to load booking. Check console for details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const idFromQuery = searchParams.get("bookingId");
    if (idFromQuery) {
      setBookingId(idFromQuery);
      void handleLoadBookingById(idFromQuery);
    }
  }, [handleLoadBookingById, searchParams]);

  const handleStartTrip = async () => {
    if (!booking) return;
    if (bookingIsReadOnly) {
      setMessage("Booking đã hoàn tất hoặc bị hủy — chỉ có thể xem chi tiết.");
      return;
    }
    if (bookingStartsInFuture) {
      setMessage("Cannot start trip before the booking's start time.");
      return;
    }
    if (!startForm.odometer) {
      setMessage("Enter an odometer reading before starting.");
      return;
    }
    setMessage("Submitting start-trip payload...");
    try {
      const odo = Number(startForm.odometer);
      await checkInApi.startTrip({
        bookingId: booking.id,
        odometerReading: odo,
        notes: startForm.notes || undefined,
        clientTimestamp: new Date().toISOString(),
        photos: startPhotos,
      });
      await updateVehicleStatus("InUse");
      // If the booking has already ended (endAt < now), tell the server to mark it Completed
      try {
        const bookingEndTime = parseServerIso(booking.endAt).getTime();
        if (!Number.isNaN(bookingEndTime) && bookingEndTime < Date.now()) {
          await bookingApi.completeBooking(booking.id);
        }
      } catch {
        // Non-fatal: continue UI flow
      }
      setTripStarted(true);
      setStartPhotos([]);
      setMessage(
        `Đã check-in lúc ${new Date().toLocaleString()} (ghi nhận cả phía FE lẫn BE).`
      );
      await refreshHistory();
    } catch {
      setMessage("Unable to start trip.");
    }
  };

  const handleLoadBooking = async () => {
    if (!bookingId) {
      setMessage("Enter a booking id before loading.");
      return;
    }
    await handleLoadBookingById(bookingId);
  };

  const handleStartFiles = async (files: FileList) => {
    const updated = await convertFilesToPhotos(files, startPhotos);
    setStartPhotos(updated);
  };

  const resolveStepStatus = (index: number) => {
    if (index === 0) {
      return booking ? "done" : "pending";
    }
    if (index === 1) {
      if (!booking) return "pending";
      return tripStarted ? "done" : "current";
    }
    if (index === 2) {
      if (!booking) return "pending";
      return tripStarted ? "done" : "current";
    }
    return "pending";
  };

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-8 bg-[#f5ebe0] p-8 text-black">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-black">Trip tools</p>
        <h1 className="text-4xl font-semibold text-black">Vehicle check-in</h1>
        <p className="text-black">
          Capture pre-trip details, photos, and update the vehicle status.
        </p>
      </header>

      <div className="rounded-3xl border border-slate-800 bg-[#f5ebe0] p-4">
        <p className="text-sm font-semibold text-black">
          Sync booking from API
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            className="flex-1 rounded-2xl border border-slate-700 bg-[#f5ebe0] px-4 py-2 text-sm"
            placeholder="Enter BookingId (GUID)"
          />
          <button
            type="button"
            onClick={handleLoadBooking}
            className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Loading..." : "Load booking"}
          </button>
        </div>
        {message && <p className="mt-2 text-xs text-black">{message}</p>}
        {booking && (
          <p className="mt-1 text-xs text-black">
            Vehicle: {booking.vehicleModel} (
            {parseServerIso(booking.startAt).toLocaleString()})
          </p>
        )}
      </div>
      {historyMessage && <p className="text-xs text-black">{historyMessage}</p>}

      <div className="rounded-3xl border border-slate-800 bg-[#f5ebe0] p-6">
        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide text-black">
          {stepLabels.map((label, index) => {
            const status = resolveStepStatus(index);
            const badgeClass =
              status === "done"
                ? "bg-[#ede0d4] text-black border border-slate-700"
                : status === "current"
                ? "bg-brand/30 text-black border border-brand"
                : "bg-[#f5ebe0] text-black border border-slate-400";
            return (
              <span
                key={label}
                className={`rounded-full px-4 py-1 ${badgeClass}`}
              >
                {index + 1}. {label}
              </span>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4">
          <TripStageCard
            title="Check-in xe"
            subtitle="Ghi nhận tình trạng trước khi khởi hành"
            odometerLabel="Odometer (km)"
            notesLabel="Tình trạng xe / ghi chú"
            notesPlaceholder="Ảnh đã chụp, mức pin, hỏng hóc..."
            form={startForm}
            onChange={(field, value) =>
              setStartForm((prev) => ({ ...prev, [field]: value }))
            }
            photos={startPhotos}
            onFilesSelected={handleStartFiles}
            onRemovePhoto={(index) =>
              setStartPhotos((prev) => prev.filter((_, idx) => idx !== index))
            }
            buttonLabel={
              tripStarted ? "Đã check-in chuyến này" : "Xác nhận bắt đầu chuyến"
            }
            onSubmit={handleStartTrip}
            disabled={
              !booking ||
              tripStarted ||
              bookingStartsInFuture ||
              bookingIsReadOnly
            }
            footerSlot={
              booking && (
                <div className="rounded-2xl border border-dashed border-slate-500 bg-[#f5ebe0]/80 p-3 text-xs text-black">
                  {bookingIsReadOnly ? (
                    <p className="text-sm text-rose-600">
                      Booking đã hoàn tất hoặc bị hủy — không thể Check-in hoặc
                      Check-out.
                    </p>
                  ) : bookingStartsInFuture ? (
                    <p className="text-sm text-rose-600">
                      Không thể check-in trước thời gian bắt đầu của booking.
                    </p>
                  ) : null}
                  <p>
                    Hoàn tất chuyến đi? Vào{" "}
                    <Link
                      to={`/booking/check-out?bookingId=${booking?.id ?? ""}`}
                      className="font-semibold underline"
                    >
                      màn Check-out
                    </Link>{" "}
                    để cập nhật số km và ảnh trả xe.
                  </p>
                </div>
              )
            }
          />
        </div>
      </div>

      {booking && (
        <HistoryTable title="Check-in history" records={checkOutHistory} />
      )}
    </section>
  );
};

export default CheckIn;
