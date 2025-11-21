import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { bookingApi } from "@/services/booking/api";
import vehicleService from "@/services/vehicleService";
import type {
  AvailabilitySlotDto,
  BookingPriority,
  CreateBookingDto,
} from "@/models/booking";
import { useAppSelector } from "@/store/hooks";
import Cookies from "js-cookie";
import { useGroups } from "@/hooks/useGroups";
import type { VehicleListItem } from "@/models/vehicle";
import AiBookingRecommendations from "@/components/booking/AiBookingRecommendations";
import type { BookingSuggestionItem } from "@/models/ai";
import { Sparkles } from "lucide-react";

const now = new Date();
const tomorrow = new Date(now);
tomorrow.setDate(now.getDate() + 1);

const toDateInputLocal = (d: Date) => {
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const initialForm = {
  vehicle: "Tesla Model 3 Performance",
  date: toDateInputLocal(now),
  endDate: toDateInputLocal(now),
  start: now.toTimeString().slice(0, 5),
  end: new Date(now.getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5), // Default to 2 hours later
  repeat: "none",
  purpose: "Business",
  distance: 120,
  notes: "",
  priority: "Normal" as BookingPriority,
  isEmergency: false,
  emergencyReason: "",
  emergencyAutoCancelConflicts: false,
};

const priorityMap: Record<BookingPriority, number> = {
  Low: 0,
  Normal: 1,
  High: 2,
  Emergency: 3,
};
const slotStepMinutes = 30;
const minDurationMinutes = 30;
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
  const [vehicles, setVehicles] = useState<VehicleListItem[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlotDto[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [showAiRecommendations, setShowAiRecommendations] = useState(false);

  useEffect(() => {
    setUserId(derivedUserId);
  }, [derivedUserId]);

  const joinedGroups = useMemo(() => {
    const collection = groups ?? [];
    if (!userId) {
      return collection;
    }
    const filtered = collection.filter((group) =>
      group.members?.some((member) => member.userId === userId)
    );
    return filtered.length > 0 ? filtered : collection;
  }, [groups, userId]);

  useEffect(() => {
    if (!groupId && joinedGroups.length > 0) {
      setGroupId(joinedGroups[0].id);
    }
  }, [joinedGroups, groupId]);

  useEffect(() => {
    let cancelled = false;
    const loadVehicles = async () => {
      try {
        const data = await vehicleService.getAllVehicles();
        if (cancelled) {
          return;
        }
        if (data.length > 0) {
          setVehicles(data);
          setVehiclesError(null);
        } else {
          setVehicles([]);
          setVehiclesError("No vehicles returned from the vehicle service.");
        }
      } catch {
        if (!cancelled) {
          setVehicles([]);
          setVehiclesError("Unable to load vehicles at this time.");
        }
      }
    };
    void loadVehicles();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedGroup = useMemo(
    () => joinedGroups.find((group) => group.id === groupId),
    [joinedGroups, groupId]
  );

  const availableVehicles = useMemo(() => {
    // Filter out pending/rejected/maintenance vehicles - only show Available, InUse, Unavailable
    // Maintenance vehicles are blocked from booking
    const validStatuses = ["Available", "InUse", "Unavailable"];

    // Create a map of groupId -> group for quick lookup
    const groupsMap = new Map(groups?.map((g) => [g.id, g]) || []);

    // Filter vehicles: must have valid vehicle status AND belong to an Active group
    const filterVehicles = (vehicleList: VehicleListItem[]) => {
      return vehicleList.filter((vehicle) => {
        // Check vehicle status
        if (!validStatuses.includes(vehicle.status ?? "Available")) {
          return false;
        }

        // Check group status - vehicle must belong to an Active group
        if (vehicle.groupId) {
          const group = groupsMap.get(vehicle.groupId);
          if (!group || group.status !== "Active") {
            return false; // Group not found or not Active
          }
        } else {
          return false; // Vehicle has no group
        }

        return true;
      });
    };

    const groupVehicles =
      selectedGroup?.vehicles
        ?.filter((vehicle) =>
          validStatuses.includes(vehicle.status ?? "Available")
        )
        ?.map((vehicle) => ({
          id: vehicle.id,
          vin: vehicle.vin ?? "",
          plateNumber: vehicle.plateNumber ?? "",
          model: vehicle.model ?? vehicle.id,
          year: vehicle.year ?? new Date().getFullYear(),
          color: vehicle.color ?? null,
          status: vehicle.status ?? "Available",
          lastServiceDate: vehicle.lastServiceDate ?? null,
          odometer: vehicle.odometer ?? 0,
          groupId: vehicle.groupId ?? selectedGroup?.id ?? null,
          createdAt: vehicle.createdAt ?? new Date().toISOString(),
          updatedAt: vehicle.updatedAt ?? new Date().toISOString(),
          healthScore: null,
        })) ?? [];

    // Filter group vehicles by group status
    const filteredGroupVehicles = filterVehicles(groupVehicles);
    if (filteredGroupVehicles.length > 0) {
      return filteredGroupVehicles;
    }

    if (groupId) {
      const filtered = filterVehicles(
        vehicles.filter((vehicle) => vehicle.groupId === groupId)
      );
      if (filtered.length > 0) {
        return filtered;
      }
    }

    return filterVehicles(vehicles);
  }, [groupId, selectedGroup, vehicles, groups]);

  useEffect(() => {
    if (availableVehicles.length === 0) {
      return;
    }
    if (
      !vehicleId ||
      !availableVehicles.some((vehicle) => vehicle.id === vehicleId)
    ) {
      const initialVehicle = availableVehicles[0];
      setVehicleId(initialVehicle.id);
      setForm((prev) => ({ ...prev, vehicle: initialVehicle.model }));
    }
  }, [availableVehicles, vehicleId]);

  const updateForm = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleDateChange = (newDate: string) => {
    setForm((prev) => {
      const updatedForm = { ...prev, date: newDate };
      if (newDate > prev.endDate) {
        updatedForm.endDate = newDate;
      }
      return updatedForm;
    });
  };

  const handleVehicleSelect = (id: string) => {
    setVehicleId(id);
    const matched =
      availableVehicles.find((vehicle) => vehicle.id === id) ||
      vehicles.find((vehicle) => vehicle.id === id);
    setForm((prev) => ({
      ...prev,
      vehicle: matched?.model ?? id,
    }));
  };

  const buildIsoUtc = (date: string, time: string) =>
    new Date(`${date}T${time}:00`).toISOString();

  const formatLocalWithOffset = (d: Date) => {
    const pad2 = (n: number) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad2(d.getMonth() + 1);
    const day = pad2(d.getDate());
    const hours = pad2(d.getHours());
    const minutes = pad2(d.getMinutes());
    const seconds = pad2(d.getSeconds());
    const offsetMin = d.getTimezoneOffset(); // minutes behind UTC (e.g. -420 for +07:00)
    const sign = offsetMin <= 0 ? "+" : "-";
    const absMin = Math.abs(offsetMin);
    const offH = pad2(Math.floor(absMin / 60));
    const offM = pad2(absMin % 60);
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offH}:${offM}`;
  };

  // UTC instants used internally for calculations (slots, conflicts)
  const startIso = useMemo(
    () => buildIsoUtc(form.date, form.start),
    [form.date, form.start]
  );
  const endIso = useMemo(
    () => buildIsoUtc(form.endDate, form.end),
    [form.endDate, form.end]
  );

  // Payload values: serialize the local wall-clock time with timezone offset
  // so the backend receives the same local date/time you selected.
  const payloadStartAt = useMemo(
    () => formatLocalWithOffset(new Date(`${form.date}T${form.start}:00`)),
    [form.date, form.start]
  );
  const payloadEndAt = useMemo(
    () => formatLocalWithOffset(new Date(`${form.endDate}T${form.end}:00`)),
    [form.endDate, form.end]
  );

  const durationMinutes = useMemo(() => {
    const diff = new Date(endIso).getTime() - new Date(startIso).getTime();
    const minutes = Math.max(0, Math.round(diff / 60000));
    return Math.max(minDurationMinutes, minutes || 0);
  }, [startIso, endIso]);

  const conflictEndIso = useMemo(() => {
    const endMs = new Date(endIso).getTime();
    const exclusive = new Date(endMs - 1000); // minus 1 second: keeps same minute but avoids boundary collision
    return exclusive.toISOString();
  }, [endIso]);

  const conflictStartIso = useMemo(() => {
    const startMs = new Date(startIso).getTime();
    const exclusive = new Date(startMs - 60000); // minus 1 minute still represents same minute but avoids boundary collision
    return exclusive.toISOString();
  }, [startIso]);

  const toDateInput = useCallback((d: Date) => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const toTimeInput = useCallback((d: Date) => {
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }, []);

  useEffect(() => {
    const resolvedVehicleId = vehicleId || availableVehicles[0]?.id;
    if (!resolvedVehicleId) return;

    const from = new Date(`${form.date}T00:00:00`).toISOString();
    const to = new Date(`${form.endDate}T23:59:59`).toISOString();

    setSlotsLoading(true);
    bookingApi
      .getAvailability(resolvedVehicleId, from, to, durationMinutes, 0)
      .then((data) => {
        setSlots(data.slots ?? []);
        setSlotsError(null);
      })
      .catch(() => {
        setSlots([]);
        setSlotsError("Unable to load availability right now. Please retry.");
      })
      .finally(() => setSlotsLoading(false));
  }, [vehicleId, availableVehicles, form.date, form.endDate, durationMinutes]);

  const startOptions = useMemo(() => {
    if (!slots.length) return [];
    const options: { label: string; value: string }[] = [];
    const addedTimes = new Set<string>();
    const stepMs = slotStepMinutes * 60000;
    const durationMs = durationMinutes * 60000;

    slots.forEach((slot) => {
      const slotStart = new Date(slot.startAt).getTime();
      const slotEnd = new Date(slot.endAt).getTime();
      for (let t = slotStart; t + durationMs <= slotEnd; t += stepMs) {
        const dt = new Date(t);
        // Hide times that are already in the past relative to now.
        if (dt.getTime() < Date.now()) continue;
        const isoValue = dt.toISOString();
        if (!addedTimes.has(isoValue)) {
          options.push({
            value: isoValue,
            // Show the time in the user's local timezone for clarity.
            label: dt.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
          addedTimes.add(isoValue);
        }
      }
    });

    return options;
  }, [slots, durationMinutes]);

  const currentSlot = useMemo(() => {
    const start = new Date(startIso).getTime();
    return slots.find(
      (slot) =>
        start >= new Date(slot.startAt).getTime() &&
        start < new Date(slot.endAt).getTime()
    );
  }, [slots, startIso]);

  const endOptions = useMemo(() => {
    if (!currentSlot) return [];
    const options: { label: string; value: string }[] = [];
    const stepMs = slotStepMinutes * 60000;
    const start = new Date(startIso).getTime();
    const slotEnd = new Date(currentSlot.endAt).getTime();
    for (
      let t = start + minDurationMinutes * 60000;
      t <= slotEnd;
      t += stepMs
    ) {
      const dt = new Date(t);
      options.push({
        value: dt.toISOString(),
        label: dt.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }
    return options;
  }, [currentSlot, startIso]);

  const isSelectionAvailable = useMemo(() => {
    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();
    if (!slots.length) return false;
    return slots.some(
      (slot) =>
        start >= new Date(slot.startAt).getTime() &&
        end <= new Date(slot.endAt).getTime()
    );
  }, [slots, startIso, endIso]);

  const handleStartSelect = useCallback(
    (iso: string) => {
      const startDate = new Date(iso);
      const selectedSlot = slots.find(
        (slot) =>
          startDate.getTime() >= new Date(slot.startAt).getTime() &&
          startDate.getTime() < new Date(slot.endAt).getTime()
      );
      const slotEnd = selectedSlot
        ? new Date(selectedSlot.endAt).getTime()
        : startDate.getTime() +
          Math.max(durationMinutes, minDurationMinutes) * 60000;
      const desiredDurationMs = Math.max(
        minDurationMinutes * 60000,
        durationMinutes * 60000
      );
      const autoEndMs = Math.min(
        startDate.getTime() + desiredDurationMs,
        slotEnd
      );
      const newEndDate = new Date(autoEndMs);
      updateForm("date", toDateInput(startDate));
      updateForm("start", toTimeInput(startDate));
      updateForm("endDate", toDateInput(newEndDate));
      updateForm("end", toTimeInput(newEndDate));
    },
    [slots, durationMinutes, toDateInput, toTimeInput, updateForm]
  );

  const handleEndSelect = useCallback(
    (iso: string) => {
      const endDate = new Date(iso);
      updateForm("endDate", toDateInput(endDate));
      updateForm("end", toTimeInput(endDate));
    },
    [toDateInput, toTimeInput, updateForm]
  );

  useEffect(() => {
    if (slotsLoading || startOptions.length === 0 || !startIso) return;

    const isCurrentStartAnOption = startOptions.some(
      (opt) => opt.value === startIso
    );

    if (!isCurrentStartAnOption && startOptions[0]?.value) {
      handleStartSelect(startOptions[0].value);
    }
  }, [startOptions, startIso, slotsLoading, handleStartSelect]);

  const handleAiSuggestionSelect = useCallback(
    (suggestion: BookingSuggestionItem) => {
      const startDate = new Date(suggestion.start);
      const endDate = new Date(suggestion.end);

      // Update form with selected suggestion
      updateForm("date", toDateInput(startDate));
      updateForm("start", toTimeInput(startDate));
      updateForm("endDate", toDateInput(endDate));
      updateForm("end", toTimeInput(endDate));

      // Calculate duration in hours for display
      const durationHours =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
      updateForm("distance", Math.round(durationHours * 60)); // Rough estimate: 60km per hour

      setServerMessage(
        `AI suggestion applied: ${startDate.toLocaleString(
          "vi-VN"
        )} - ${endDate.toLocaleString("vi-VN")}`
      );
    },
    [toDateInput, toTimeInput, updateForm]
  );

  const handleSubmit = async () => {
    const resolvedVehicleId = vehicleId || availableVehicles[0]?.id;
    if (!resolvedVehicleId) {
      setServerMessage("Vehicle ID is missing");
      setSubmissionStatus("error");
      return;
    }

    if (!userId || !groupId) {
      setServerMessage("UserId and GroupId are required");
      setSubmissionStatus("error");
      return;
    }

    // Prevent submitting a start time that's already in the past (client-side guard).
    if (new Date(startIso).getTime() < Date.now()) {
      setServerMessage("Selected start time is in the past");
      setSubmissionStatus("error");
      return;
    }

    if (!isSelectionAvailable) {
      setConflictMessage(
        "Selected time is busy. Please pick another highlighted slot."
      );
      setSubmissionStatus("error");
      return;
    }

    try {
      const conflicts = await bookingApi.checkConflicts(
        resolvedVehicleId,
        conflictStartIso,
        conflictEndIso
      );
      if (conflicts?.hasConflicts) {
        setConflictMessage(
          `Time conflict with ${conflicts.conflictingBookings.length} existing booking(s). Please select another slot.`
        );
        setSubmissionStatus("error");
        return;
      }
      setConflictMessage(null);
    } catch {
      setConflictMessage(
        "Could not verify conflicts due to network error. Please try again."
      );
      setSubmissionStatus("error");
      return;
    }

    const prioritySelection: BookingPriority = form.priority;
    const apiPayload: CreateBookingDto = {
      vehicleId: resolvedVehicleId,
      // Send local wall-clock time with offset (e.g. +07:00) so payload shows
      // the same date/time the user selected.
      startAt: payloadStartAt,
      endAt: payloadEndAt,
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
      const successMessage = `Created booking ${booking.id.slice(0, 8)} for ${
        booking.vehicleModel
      }`;
      setServerMessage(successMessage);
      setCreatedBookingId(booking.id);
      // setTimeout(() => navigate("/booking/calendar"), 800);
    } catch {
      setSubmissionStatus("error");
      setServerMessage("Failed to create booking. Please try again later.");
      setCreatedBookingId(null);
    }
  };

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 bg-[#f5ebe0] p-8 text-black">
      <div className="grid gap-1">
        <form className="space-y-6 rounded-3xl border border-slate-800 bg-[#f5ebe0] p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-black">
              <span>Vehicle</span>
              <select
                value={vehicleId}
                onChange={(e) => handleVehicleSelect(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-[#f5ebe0] px-4 py-3"
                disabled={availableVehicles.length === 0}
              >
                {availableVehicles.length === 0 ? (
                  <option value="">Không có xe khả dụng</option>
                ) : (
                  availableVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.model}
                    </option>
                  ))
                )}
              </select>
              {vehiclesError && (
                <p className="text-xs text-[#8b7d6b]">{vehiclesError}</p>
              )}
              {availableVehicles.length === 0 && !vehiclesError && (
                <p className="text-xs text-[#8b7d6b]">
                  Không có xe nào khả dụng để đặt lịch. Xe có thể đang bảo trì, chờ phê duyệt,
                  hoặc thuộc nhóm chưa hoạt động. Vui lòng chọn nhóm khác hoặc đợi xe sẵn sàng.
                </p>
              )}
            </label>
            <div className="sm:col-span-2">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 text-sm text-black">
                  <span>Start date & time</span>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={form.date}
                      min={toDateInput(new Date())}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-1/2 rounded-2xl border border-slate-800 bg-[#f5ebe0] px-4 py-3"
                    />
                    <select
                      value={startIso}
                      onChange={(e) => handleStartSelect(e.target.value)}
                      className="w-1/2 rounded-2xl border border-slate-800 bg-[#f5ebe0] px-4 py-3"
                    >
                      {slotsLoading && (
                        <option value={startIso}>Loading...</option>
                      )}
                      {!slotsLoading && startOptions.length === 0 && (
                        <option value={startIso}>No slots</option>
                      )}
                      {!slotsLoading &&
                        startOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                    </select>
                  </div>
                  {slotsError && (
                    <p className="text-xs text-[#8b7d6b]">{slotsError}</p>
                  )}
                </div>
                <div className="space-y-2 text-sm text-black">
                  <span>End date & time</span>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={form.endDate}
                      min={form.date}
                      onChange={(e) => updateForm("endDate", e.target.value)}
                      className="w-1/2 rounded-2xl border border-slate-800 bg-[#f5ebe0] px-4 py-3"
                    />
                    <select
                      value={endIso}
                      onChange={(e) => handleEndSelect(e.target.value)}
                      className="w-1/2 rounded-2xl border border-slate-800 bg-[#f5ebe0] px-4 py-3"
                    >
                      {slotsLoading && (
                        <option value={endIso}>Loading...</option>
                      )}
                      {!slotsLoading && endOptions.length === 0 && (
                        <option value={endIso}>No times</option>
                      )}
                      {!slotsLoading &&
                        endOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {conflictMessage && (
            <p className="text-xs text-rose-600">{conflictMessage}</p>
          )}
          {!slotsLoading && slots.length > 0 && !isSelectionAvailable && (
            <p className="text-xs text-[#8b7d6b]">
              The selected time is outside available slots. Pick another
              highlighted slot.
            </p>
          )}

          {/* AI Recommendations Trigger */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => setShowAiRecommendations(true)}
              disabled={!groupId || !userId}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-lg ${
                groupId && userId
                  ? "text-accent-blue hover:text-accent-blue/80 border-accent-blue/30 hover:bg-accent-blue/5"
                  : "text-neutral-400 border-neutral-300 cursor-not-allowed opacity-50"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {!groupId || !userId
                  ? "Vui lòng chọn Group để sử dụng AI suggestions"
                  : "Need help finding a time? Try AI suggestions"}
              </span>
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-black">
              <span>User ID</span>
              <input
                type="text"
                value={userId}
                readOnly
                className="w-full rounded-2xl border border-slate-800 bg-[#f5ebe0] px-4 py-3 font-mono text-xs text-black"
              />
            </label>
            <label className="space-y-2 text-sm text-black">
              <span>Group</span>
              <select
                value={groupId}
                disabled={groupsLoading || joinedGroups.length === 0}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-[#f5ebe0] px-4 py-3 text-sm"
              >
                {groupsLoading && <option value="">Loading groups...</option>}
                {!groupsLoading && joinedGroups.length === 0 && (
                  <option value="">No groups available</option>
                )}
                {joinedGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              {groupsError && (
                <p className="text-xs text-black">Unable to load groups.</p>
              )}
            </label>
          </div>

          {/* <label className="space-y-2 text-sm text-black">
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
          </label> */}

          <label className="space-y-2 text-sm text-black">
            <span>Purpose</span>
            <select
              value={purpose}
              onChange={(e) => {
                setPurpose(e.target.value);
                updateForm("purpose", e.target.value);
              }}
              className="w-full rounded-2xl border border-slate-800 bg-[#f5ebe0] px-4 py-3"
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
              className="w-full rounded-2xl border border-slate-800 bg-[#f5ebe0] px-4 py-3"
            >
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Emergency">Emergency</option>
            </select>
          </label>

          {/* <div className="space-y-4 rounded-3xl border border-slate-800 bg-[#f5ebe0] p-4">
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
                    className="w-full rounded-2xl border border-slate-800 bg-[#f5ebe0] px-4 py-3"
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
          </div> */}

          <label className="space-y-2 text-sm text-black">
            <span>Estimated distance (km)</span>
            <input
              type="number"
              value={form.distance}
              onChange={(e) => updateForm("distance", Number(e.target.value))}
              className="w-full rounded-2xl border border-slate-800 bg-[#f5ebe0] px-4 py-3"
            />
          </label>

          <label className="space-y-2 text-sm text-black">
            <span>Notes</span>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) => updateForm("notes", e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-[#f5ebe0] px-4 py-3"
              placeholder="Add context for other co-owners"
            />
          </label>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              submissionStatus === "submitting" ||
              slotsLoading ||
              !isSelectionAvailable ||
              availableVehicles.length === 0 ||
              !vehicleId
            }
            className="w-full rounded-2xl bg-brand/90 px-6 py-3 text-center text-sm font-semibold text-black transition hover:bg-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submissionStatus === "submitting"
              ? "Creating..."
              : availableVehicles.length === 0
              ? "Không có xe khả dụng"
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
            <div className="rounded-2xl border border-emerald-800 bg-[#f5ebe0] p-4 text-xs text-black">
              <p className="text-black">Payload preview (to API)</p>
              <div className="mt-2 text-[12px]">
                <p>
                  <strong>Start (local):</strong>{" "}
                  {lastPayload.startAt
                    ? new Date(lastPayload.startAt).toLocaleString()
                    : "-"}
                </p>
                <p>
                  <strong>End (local):</strong>{" "}
                  {lastPayload.endAt
                    ? new Date(lastPayload.endAt).toLocaleString()
                    : "-"}
                </p>
              </div>
              <pre className="mt-2 overflow-auto text-[11px] leading-4">
                {JSON.stringify(lastPayload, null, 2)}
              </pre>
            </div>
          )}
        </form>
      </div>

      {/* AI Booking Recommendations Modal */}
      {groupId && userId && (
        <AiBookingRecommendations
          isOpen={showAiRecommendations}
          onClose={() => setShowAiRecommendations(false)}
          vehicleId={vehicleId}
          groupId={groupId}
          userId={userId}
          initialPreferredDate={form.date}
          initialDuration={durationMinutes / 60}
          onSelectSuggestion={handleAiSuggestionSelect}
        />
      )}
    </section>
  );
};

export default CreateBooking;
