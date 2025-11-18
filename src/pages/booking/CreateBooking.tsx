import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { bookingApi } from "@/services/booking/api";
import type { BookingPriority, CreateBookingDto } from "@/models/booking";
import { useAppSelector } from "@/store/hooks";
import Cookies from "js-cookie";
import { useGroups } from "@/hooks/useGroups";

const initialForm = {
  vehicle: "Tesla Model 3 Performance",
  date: "2025-03-18",
  endDate: "2025-03-18",
  start: "08:00",
  end: "15:00",
  repeat: "none",
  purpose: "Business",
  distance: 120,
  notes: "",
  priority: "Normal" as BookingPriority,
  isEmergency: false,
  emergencyReason: "",
  emergencyAutoCancelConflicts: false,
};

const repeatOptions = [
  { value: "none", label: "No repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

const priorityMap: Record<BookingPriority, number> = {
  Low: 0,
  Normal: 1,
  High: 2,
  Emergency: 3,
};

const vehicleMap: Record<string, string> = {
  "Tesla Model 3 Performance": "00000000-0000-0000-0000-000000000001",
  "Kia EV6 GT-Line": "00000000-0000-0000-0000-000000000002",
};

type FormState = typeof initialForm;

const decodeUserIdFromToken = (token?: string | null) => {
  if (!token) return "";
  try {
    const parts = token.split(".");
    if (parts.length < 2) return "";
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    const payload = JSON.parse(json);
    return payload?.sub || payload?.nameid || payload?.userId || "";
  } catch {
    return "";
  }
};

const CreateBooking = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [purpose, setPurpose] = useState("Business");
  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const auth = useAppSelector((state) => state.auth);
  const derivedUserId = useMemo(() => {
    if (auth.user?.id) return auth.user.id;
    return decodeUserIdFromToken(auth.token || Cookies.get("auth_token"));
  }, [auth.token, auth.user?.id]);
  const [userId, setUserId] = useState(derivedUserId);
  const {
    data: groups,
    loading: groupsLoading,
    error: groupsError,
  } = useGroups();
  const [groupId, setGroupId] = useState("");
  const [lastPayload, setLastPayload] = useState<CreateBookingDto | null>(null);

  useEffect(() => {
    setUserId(derivedUserId);
  }, [derivedUserId]);

  useEffect(() => {
    if (!groupId && groups && groups.length > 0) {
      setGroupId(groups[0].id);
    }
  }, [groups, groupId]);

  const updateForm = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const vehicleId = vehicleMap[form.vehicle] ?? form.vehicle;
    if (!vehicleId) {
      setServerMessage("Vehicle ID is missing");
      setSubmissionStatus("error");
      return;
    }

    const buildIso = (date: string, time: string) =>
      new Date(`${date}T${time}:00`).toISOString();
    if (!userId || !groupId) {
      setServerMessage("UserId và GroupId là bắt buộc");
      setSubmissionStatus("error");
      return;
    }

    const startIso = buildIso(form.date, form.start);
    const endIso = buildIso(form.endDate, form.end);

    try {
      const conflicts = await bookingApi.checkConflicts(
        vehicleId,
        startIso,
        endIso
      );
      if (conflicts?.hasConflicts) {
        setConflictMessage(
          `Time conflict with ${conflicts.conflictingBookings.length} existing booking(s). Please select another slot.`
        );
        setSubmissionStatus("error");
        return;
      }
      setConflictMessage(null);
    } catch (checkError) {
      console.warn("Unable to check booking conflicts", checkError);
      setConflictMessage(
        "Could not verify conflicts due to network error. Please try again."
      );
      setSubmissionStatus("error");
      return;
    }

    const prioritySelection: BookingPriority = form.priority;
    const apiPayload: CreateBookingDto = {
      vehicleId,
      startAt: startIso,
      endAt: endIso,
      notes: form.notes,
      purpose,
      isEmergency: form.isEmergency,
      emergencyReason: form.isEmergency ? form.emergencyReason : undefined,
      emergencyAutoCancelConflicts: form.isEmergency
        ? form.emergencyAutoCancelConflicts
        : undefined,
      priority: priorityMap[prioritySelection],
      userId,
      groupId,
    };

    setLastPayload(apiPayload);
    setSubmissionStatus("submitting");
    setServerMessage("Sending to /api/booking ...");
    try {
      const booking = await bookingApi.create(apiPayload);
      setSubmissionStatus("success");
      const successMessage = `Created booking ${booking.id.slice(0, 8)} for ${booking.vehicleModel}`;
      setServerMessage(successMessage);
      setCreatedBookingId(booking.id);
      setTimeout(() => navigate("/booking/calendar"), 800);
    } catch (error) {
      console.error("Failed to create booking", error);
      setSubmissionStatus("error");
      setServerMessage("Failed to create booking. Check console for details.");
      setCreatedBookingId(null);
    }
  };

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 bg-amber-50 p-8 text-black">
      <div className="grid gap-1">
        <form className="space-y-6 rounded-3xl border border-slate-800 bg-amber-50 p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-black">
              <span>Vehicle</span>
              <select
                value={form.vehicle}
                onChange={(e) => updateForm("vehicle", e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-amber-50 px-4 py-3"
              >
                <option>Tesla Model 3 Performance</option>
                <option>Kia EV6 GT-Line</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-black">
              <span>Start date</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => updateForm("date", e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-amber-50 px-4 py-3"
              />
            </label>
            <label className="space-y-2 text-sm text-black">
              <span>End date</span>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => updateForm("endDate", e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-amber-50 px-4 py-3"
              />
            </label>
            <label className="space-y-2 text-sm text-black">
              <span>Start time</span>
              <input
                type="time"
                value={form.start}
                onChange={(e) => updateForm("start", e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-amber-50 px-4 py-3"
              />
            </label>
            <label className="space-y-2 text-sm text-black">
              <span>End time</span>
              <input
                type="time"
                value={form.end}
                onChange={(e) => updateForm("end", e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-amber-50 px-4 py-3"
              />
            </label>
          </div>
          {conflictMessage && (
            <p className="text-xs text-rose-600">{conflictMessage}</p>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-black">
              <span>User ID</span>
              <input
                type="text"
                value={userId}
                readOnly
                className="w-full rounded-2xl border border-slate-800 bg-amber-50 px-4 py-3 font-mono text-xs text-black"
              />
            </label>
            <label className="space-y-2 text-sm text-black">
              <span>Group</span>
              <select
                value={groupId}
                disabled={groupsLoading || !groups?.length}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-amber-50 px-4 py-3 text-sm"
              >
                {groupsLoading && <option value="">Loading groups...</option>}
                {!groupsLoading && !groups?.length && (
                  <option value="">No groups available</option>
                )}
                {groups?.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              {groupsError && (
                <p className="text-xs text-black">
                  Không thể tải danh sách nhóm.
                </p>
              )}
            </label>
          </div>

          <label className="space-y-2 text-sm text-black">
            <span>Repeat</span>
            <div className="grid gap-3 sm:grid-cols-3">
              {repeatOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    form.repeat === option.value
                      ? "border-brand bg-brand/20 text-black"
                      : "border-slate-800 text-black hover:border-brand/40"
                  }`}
                  onClick={() => updateForm("repeat", option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </label>

          <label className="space-y-2 text-sm text-black">
            <span>Purpose</span>
            <select
              value={purpose}
              onChange={(e) => {
                setPurpose(e.target.value);
                updateForm("purpose", e.target.value);
              }}
              className="w-full rounded-2xl border border-slate-800 bg-amber-50 px-4 py-3"
            >
              <option>Personal</option>
              <option>Business</option>
              <option>Other</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-black">
            <span>Priority</span>
            <select
              value={form.priority}
              onChange={(e) =>
                updateForm("priority", e.target.value as BookingPriority)
              }
              className="w-full rounded-2xl border border-slate-800 bg-amber-50 px-4 py-3"
            >
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Emergency">Emergency</option>
            </select>
          </label>

          <div className="space-y-4 rounded-3xl border border-slate-800 bg-amber-50 p-4">
            <div className="flex items-center gap-3">
              <input
                id="emergency-toggle"
                type="checkbox"
                checked={form.isEmergency}
                onChange={(e) => updateForm("isEmergency", e.target.checked)}
                className="h-4 w-4 rounded border border-slate-800 text-brand focus:ring-brand"
              />
              <label htmlFor="emergency-toggle" className="text-sm text-black">
                Emergency booking
              </label>
            </div>
            {form.isEmergency && (
              <div className="space-y-4">
                <label className="space-y-2 text-sm text-black">
                  <span>Emergency reason</span>
                  <textarea
                    rows={3}
                    value={form.emergencyReason}
                    onChange={(e) =>
                      updateForm("emergencyReason", e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-800 bg-amber-50 px-4 py-3"
                    placeholder="Describe why this booking is urgent"
                  />
                </label>
                <label className="flex items-center gap-3 text-sm text-black">
                  <input
                    type="checkbox"
                    checked={form.emergencyAutoCancelConflicts}
                    onChange={(e) =>
                      updateForm(
                        "emergencyAutoCancelConflicts",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 rounded border border-slate-800 text-brand focus:ring-brand"
                  />
                  <span>Auto-cancel conflicting bookings</span>
                </label>
              </div>
            )}
          </div>

          <label className="space-y-2 text-sm text-black">
            <span>Estimated distance (km)</span>
            <input
              type="number"
              value={form.distance}
              onChange={(e) => updateForm("distance", Number(e.target.value))}
              className="w-full rounded-2xl border border-slate-800 bg-amber-50 px-4 py-3"
            />
          </label>

          <label className="space-y-2 text-sm text-black">
            <span>Notes</span>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) => updateForm("notes", e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-amber-50 px-4 py-3"
              placeholder="Add context for other co-owners"
            />
          </label>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submissionStatus === "submitting"}
            className="w-full rounded-2xl bg-brand/90 px-6 py-3 text-center text-sm font-semibold text-black transition hover:bg-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submissionStatus === "submitting"
              ? "Creating..."
              : "Create booking"}
          </button>
          {serverMessage && (
            <p className="text-xs text-black" aria-live="polite">
              {serverMessage}
            </p>
          )}
          {createdBookingId && (
            <div className="text-xs text-black">
              <Link to={`/booking/details/${createdBookingId}`}>
                Next: Booking Details (Screen 14)
              </Link>
            </div>
          )}
          {lastPayload && (
            <div className="rounded-2xl border border-emerald-800 bg-amber-50 p-4 text-xs text-black">
              <p className="text-black">Payload preview (gửi lên API)</p>
              <pre className="mt-2 overflow-auto text-[11px] leading-4">
                {JSON.stringify(lastPayload, null, 2)}
              </pre>
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default CreateBooking;
