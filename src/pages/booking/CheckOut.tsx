import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { bookingApi } from "@/services/booking/api";
import { checkInApi } from "@/services/booking/checkIn";
import TripStageCard from "@/pages/booking/components/TripStageCard";
import {
  PhotoTypeValue,
  type BookingDto,
  type CheckInDto,
  type CheckInPhotoInputDto,
} from "@/models/booking";

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

const isCheckOutRecord = (record: CheckInDto) =>
  record.type === 0 || record.type === "CheckOut";

const isCheckInRecord = (record: CheckInDto) =>
  record.type === 1 || record.type === "CheckIn";

const HistoryTable = ({
  title,
  records,
}: {
  title: string;
  records: CheckInDto[];
}) => (
  <div className="rounded-3xl border border-slate-800 bg-amber-50 p-4 text-sm text-black">
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

const CheckOut = () => {
  const [searchParams] = useSearchParams();
  const [bookingId, setBookingId] = useState("");
  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<CheckInDto[]>([]);
  const [historyMessage, setHistoryMessage] = useState<string | null>(null);
  const [endForm, setEndForm] = useState({ odometer: "", notes: "" });
  const [photos, setPhotos] = useState<CheckInPhotoInputDto[]>([]);
  const [startOdometer, setStartOdometer] = useState<number | null>(null);
  const [endOdometer, setEndOdometer] = useState<number | null>(null);
  const [tripCompleted, setTripCompleted] = useState(false);
  const checkInHistory = useMemo(
    () => history.filter(isCheckInRecord),
    [history]
  );

  const refreshHistory = useCallback(async () => {
    if (!booking) return;
    try {
      const records = await checkInApi.getHistory(booking.id);
      setHistory(records);
      setHistoryMessage(
        `Loaded ${records.length} trip record(s) for booking ${booking.id.slice(
          0,
          8
        )}.`
      );
      const lastStart = [...records]
        .reverse()
        .find((record) => isCheckOutRecord(record));
      const lastEnd = [...records]
        .reverse()
        .find((record) => isCheckInRecord(record));
      setStartOdometer(lastStart?.odometer ?? null);
      setEndOdometer(lastEnd?.odometer ?? null);
      const hasValidEnd =
        Boolean(lastEnd) &&
        (!lastStart ||
          parseServerIso(lastEnd.checkInTime).getTime() >=
            parseServerIso(lastStart.checkInTime).getTime());
      setTripCompleted(hasValidEnd);
    } catch (error) {
      console.error("Unable to load check-in history for checkout", error);
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
      setEndForm({ odometer: "", notes: "" });
      setPhotos([]);
      setStartOdometer(null);
      setEndOdometer(null);
      setTripCompleted(false);
      setHistory([]);
      setHistoryMessage(null);
    } catch (error) {
      console.error("Failed to load booking for checkout", error);
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

  const handleCompleteTrip = async () => {
    if (!booking) return;
    if (!endForm.odometer) {
      setMessage("Enter an odometer reading before completing the trip.");
      return;
    }
    setMessage("Submitting checkout payload...");
    try {
      const odo = Number(endForm.odometer);
      await checkInApi.endTrip({
        bookingId: booking.id,
        odometerReading: odo,
        notes: endForm.notes || undefined,
        clientTimestamp: new Date().toISOString(),
        photos,
      });
      await bookingApi.updateVehicleStatus(booking.id, { status: "Available" });
      if (startOdometer != null && odo > startOdometer) {
        await bookingApi.updateTripSummary(booking.id, {
          distanceKm: odo - startOdometer,
        });
      }
      setEndOdometer(odo);
      setPhotos([]);
      setTripCompleted(true);
      const clientTs = new Date();
      // Refresh history and then fetch latest record to show server timestamp
      await refreshHistory();
      try {
        const records = await checkInApi.getHistory(booking.id);
        const latest = [...records]
          .sort(
            (a, b) =>
              parseServerIso(a.checkInTime).getTime() -
              parseServerIso(b.checkInTime).getTime()
          )
          .pop();
        if (latest) {
          setMessage(
            `Checkout recorded: client=${clientTs.toLocaleString()} server=${parseServerIso(
              latest.checkInTime
            ).toLocaleString()}`
          );
        } else {
          setMessage(
            `Checkout captured at ${clientTs.toLocaleString()} (client timestamp).`
          );
        }
      } catch {
        // If fetching latest fails, at least show client timestamp
        setMessage(
          `Checkout captured at ${clientTs.toLocaleString()} (client timestamp).`
        );
      }
    } catch (error) {
      console.error("Checkout failed", error);
      setMessage("Unable to complete checkout.");
    }
  };

  const handleLoadBooking = async () => {
    if (!bookingId) {
      setMessage("Enter a booking id before loading.");
      return;
    }
    await handleLoadBookingById(bookingId);
  };

  const handlePhotoSelection = async (files: FileList) => {
    const updated = await convertFilesToPhotos(files, photos);
    setPhotos(updated);
  };

  const distanceKm = useMemo(() => {
    if (startOdometer != null && endOdometer != null) {
      return Math.max(0, endOdometer - startOdometer);
    }
    if (booking?.distanceKm != null) {
      return booking.distanceKm;
    }
    return null;
  }, [booking?.distanceKm, endOdometer, startOdometer]);

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-8 bg-amber-50 p-8 text-black">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-black">Trip tools</p>
        <h1 className="text-4xl font-semibold text-black">Vehicle check-out</h1>
        <p className="text-black">
          Record ending odometer, upload post-trip photos, and wrap up fees.
        </p>
      </header>

      <div className="rounded-3xl border border-slate-800 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-black">Select booking</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            className="flex-1 rounded-2xl border border-slate-700 bg-amber-50 px-4 py-2 text-sm"
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
            Vehicle: {booking.vehicleModel} ·{" "}
            {parseServerIso(booking.endAt).toLocaleString()}
          </p>
        )}
      </div>
      {historyMessage && <p className="text-xs text-black">{historyMessage}</p>}

      <div className="rounded-3xl border border-slate-800 bg-amber-50 p-6">
        <div className="grid gap-4 text-sm text-black md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-amber-50 p-3">
            <p className="text-xs uppercase text-black">Start odometer</p>
            <p className="text-xl font-semibold text-black">
              {startOdometer ?? "--"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-amber-50 p-3">
            <p className="text-xs uppercase text-black">End odometer</p>
            <p className="text-xl font-semibold text-black">
              {endOdometer ?? "--"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-amber-50 p-3">
            <p className="text-xs uppercase text-black">Distance (km)</p>
            <p className="text-xl font-semibold text-black">
              {distanceKm ?? "--"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-amber-50 p-3">
            <p className="text-xs uppercase text-black">Trip fee</p>
            <p className="text-xl font-semibold text-black">
              {booking ? `$${booking.tripFeeAmount.toFixed(2)}` : "--"}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <TripStageCard
            title="Check-out xe"
            subtitle="Hoàn tất chuyến đi và trả xe về trạng thái Available"
            odometerLabel="Ending odometer (km)"
            notesLabel="Ghi chú sau chuyến"
            notesPlaceholder="Tình trạng pin, vệ sinh, hư hỏng..."
            form={endForm}
            onChange={(field, value) =>
              setEndForm((prev) => ({ ...prev, [field]: value }))
            }
            photos={photos}
            onFilesSelected={handlePhotoSelection}
            onRemovePhoto={(index) =>
              setPhotos((prev) => prev.filter((_, idx) => idx !== index))
            }
            buttonLabel={
              tripCompleted ? "Đã checkout chuyến này" : "Xác nhận trả xe"
            }
            onSubmit={handleCompleteTrip}
            disabled={!booking || tripCompleted}
            footerSlot={
              <p className="text-xs text-black/80">
                Dữ liệu sẽ gửi tới backend để cập nhật lịch sử chuyến, trạng
                thái xe và chi phí quãng đường.
              </p>
            }
          />
        </div>
      </div>

      {booking && (
        <HistoryTable title="Check-out history" records={checkInHistory} />
      )}
    </section>
  );
};

export default CheckOut;
