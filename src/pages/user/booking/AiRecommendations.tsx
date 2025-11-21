import { useEffect, useState } from "react";
import { bookingApi } from "@/services/booking/api";
import { parseServerIso } from "@/utils/bookingHelpers";
import type { BookingSuggestionResponse } from "@/models/booking";

type StaticSuggestion = {
  label: string;
  slot: string;
  duration: string;
  confidence: string;
  impact: string;
  reasoning: string;
  weather: string;
};

const fallbackSuggestions: StaticSuggestion[] = [];
const AiRecommendations = () => {
  const [form, setForm] = useState({
    vehicleId: "00000000-0000-0000-0000-000000000001",
    preferredDate: new Date().toISOString().split("T")[0],
    durationHours: 2,
  });
  const [remoteSuggestions, setRemoteSuggestions] =
    useState<BookingSuggestionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    if (!form.vehicleId) {
      setStatusMessage("Select a vehicle first.");
      return;
    }
    setLoading(true);
    setStatusMessage("Fetching suggestions from API…");
    try {
      const response = await bookingApi.getSuggestions({
        vehicleId: form.vehicleId,
        preferredDate: new Date(form.preferredDate).toISOString(),
        durationHours: form.durationHours,
      });
      setRemoteSuggestions(response);
      setStatusMessage(`Received ${response.suggestions.length} suggestions`);
    } catch (error) {
      setStatusMessage("Unable to fetch suggestions. Showing static data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const transformedRemoteSuggestions: StaticSuggestion[] | null =
    remoteSuggestions
      ? remoteSuggestions.suggestions.map((suggestion, index) => ({
          label: `Suggestion ${index + 1}`,
          slot: `${parseServerIso(
            suggestion.startAt
          ).toLocaleString()} - ${parseServerIso(
            suggestion.endAt
          ).toLocaleTimeString()}`,
          duration: `${Math.round(
            (new Date(suggestion.endAt).getTime() -
              new Date(suggestion.startAt).getTime()) /
              (1000 * 60)
          )} min`,
          confidence: suggestion.confidence ?? "High",
          impact: suggestion.isOptimal ? "Balances fairness" : "Neutral impact",
          reasoning: "Generated from availability window.",
          weather: "",
        }))
      : null;

  const suggestionsToRender =
    transformedRemoteSuggestions ?? fallbackSuggestions;

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-8 bg-[#f5ebe0] p-8 text-black">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-black">Screen 60</p>
        <h1 className="text-4xl font-semibold text-black">
          AI booking recommendations
        </h1>
        <p className="text-black">
          Sheet style drawer with inputs on the left and cards on the right.
        </p>
      </header>

      <div className="grid gap-6 rounded-3xl border border-slate-800 bg-[#f5ebe0] p-6 lg:grid-cols-[1.1fr,1fr]">
        <form className="space-y-4">
          <p className="text-sm font-semibold text-black">Input preferences</p>
          <label className="space-y-2 text-sm text-black">
            <span>Vehicle</span>
            <select
              className="w-full rounded-2xl border border-slate-800 bg-[#f5ebe0] px-4 py-3"
              value={form.vehicleId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, vehicleId: event.target.value }))
              }
            >
              <option value="00000000-0000-0000-0000-000000000001">
                Tesla Model 3
              </option>
              <option value="00000000-0000-0000-0000-000000000002">
                Kia EV6
              </option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-black">
            <span>Preferred date</span>
            <input
              type="date"
              value={form.preferredDate}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  preferredDate: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-800 bg-[#f5ebe0] px-4 py-3"
            />
          </label>
          <label className="space-y-2 text-sm text-black">
            <span>Time of day</span>
            <select className="w-full rounded-2xl border border-slate-800 bg-[#f5ebe0] px-4 py-3">
              <option>Morning (05:00 - 11:00)</option>
              <option>Afternoon</option>
              <option>Evening</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-black">
            <span>Duration</span>
            <select
              className="w-full rounded-2xl border border-slate-800 bg-[#f5ebe0] px-4 py-3"
              value={form.durationHours}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  durationHours: Number(event.target.value),
                }))
              }
            >
              {[2, 3, 4, 8].map((hour) => (
                <option key={hour} value={hour}>
                  {hour}h
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-black">
            <span>Priority</span>
            <select className="w-full rounded-2xl border border-slate-800 bg-[#f5ebe0] px-4 py-3">
              <option>Fairness</option>
              <option>Prime time</option>
              <option>Charging ready</option>
            </select>
          </label>
          <button
            type="button"
            className="w-full rounded-2xl border border-brand/50 bg-brand/10 px-6 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
            onClick={fetchSuggestions}
            disabled={loading}
          >
            {loading ? "Loading…" : "Regenerate suggestions"}
          </button>
          {statusMessage && (
            <p className="text-xs text-black">{statusMessage}</p>
          )}
        </form>

        <div className="space-y-4">
          {suggestionsToRender.length === 0 && (
            <p className="text-sm text-black">No suggestions available.</p>
          )}
          {suggestionsToRender.map((suggestion) => (
            <div
              key={suggestion.slot}
              className="rounded-2xl border border-slate-800 bg-[#f5ebe0] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-black">
                  {suggestion.label}
                </span>
                <span className="text-xs text-black">
                  Confidence {suggestion.confidence}
                </span>
              </div>
              <p className="mt-2 text-lg font-semibold text-black">
                {suggestion.slot}
              </p>
              <p className="text-sm text-black">
                {suggestion.duration} - {suggestion.weather}
              </p>
              <p className="mt-2 text-xs font-semibold text-black">
                {suggestion.impact}
              </p>
              <p className="mt-2 text-sm text-black">{suggestion.reasoning}</p>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand/90 px-4 py-1 text-xs font-semibold text-black"
              >
                Book this slot
              </button>
            </div>
          ))}
          <button
            type="button"
            className="w-full rounded-2xl border border-slate-700 px-4 py-3 text-sm text-black"
          >
            Show more options
          </button>
        </div>
      </div>
    </section>
  );
};

export default AiRecommendations;
