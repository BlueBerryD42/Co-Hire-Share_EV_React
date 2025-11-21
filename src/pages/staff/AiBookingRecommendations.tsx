import { useState } from "react";
import { aiApi } from "@/utils/api";
import type {
  SuggestBookingRequest,
  SuggestBookingResponse,
  BookingSuggestionItem,
  BookingRecommendationDisplay,
} from "@/models/ai";
import type { UUID, ISODate } from "@/models/booking";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/Loading";

interface BookingRecommendationFormData {
  groupId: string;
  preferredDate: string;
  preferredTime: string;
  duration: string;
  priority: "flexibility" | "prime-time";
}

const AiBookingRecommendations = () => {
  const [recommendations, setRecommendations] = useState<
    BookingRecommendationDisplay[]
  >([]);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookingRecommendationFormData>({
    groupId: "",
    preferredDate: "",
    preferredTime: "",
    duration: "",
    priority: "flexibility",
  });

  const transformSuggestionsToDisplay = (
    response: SuggestBookingResponse
  ): BookingRecommendationDisplay[] => {
    return response.suggestions.map((suggestion: BookingSuggestionItem) => {
      const startDate = new Date(suggestion.start);
      const endDate = new Date(suggestion.end);
      const durationHours =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

      // Combine all reasons into a single reasoning string
      const reasoning =
        suggestion.reasons.length > 0
          ? suggestion.reasons.join(". ")
          : "Recommended time slot based on availability and fairness metrics.";

      return {
        dateTime: suggestion.start,
        duration: durationHours,
        confidence: suggestion.confidence,
        reasoning,
      };
    });
  };

  const handleGetRecommendations = async () => {
    if (!formData.groupId) {
      setError("Please enter a group ID");
      return;
    }

    if (!formData.preferredDate || !formData.duration) {
      setError("Please enter preferred date and duration");
      return;
    }

    try {
      setInitialLoading(true);
      setError(null);

      // Combine date and time into ISO string
      let preferredDateTime: ISODate | undefined;
      if (formData.preferredDate) {
        const dateTime = formData.preferredTime
          ? `${formData.preferredDate}T${formData.preferredTime}:00`
          : `${formData.preferredDate}T12:00:00`;
        preferredDateTime = new Date(dateTime).toISOString();
      }

      // Convert duration from hours to minutes
      const durationMinutes = parseFloat(formData.duration) * 60;

      const request: SuggestBookingRequest = {
        userId: "", // Will be set by backend from token
        groupId: formData.groupId as UUID,
        preferredDate: preferredDateTime,
        durationMinutes: durationMinutes,
      };

      const response = await aiApi.suggestBookingTime(request as any);
      const bookingResponse = response.data as SuggestBookingResponse;

      // Transform API response to display format
      const displayRecommendations =
        transformSuggestionsToDisplay(bookingResponse);
      setRecommendations(displayRecommendations);
    } catch (err: unknown) {
      console.error("Error fetching recommendations:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch booking recommendations"
      );
      setRecommendations([]);
    } finally {
      setInitialLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">
        AI Booking Recommendations
      </h1>

      {error && (
        <Card>
          <div className="p-4 bg-accent-terracotta/10 border border-accent-terracotta rounded-md">
            <p className="text-sm text-accent-terracotta">{error}</p>
          </div>
        </Card>
      )}

      <Card>
        <h3 className="text-lg font-bold text-neutral-800 mb-4">
          Request Recommendations
        </h3>
        <div className="space-y-4">
          <Input
            label="Group ID"
            type="text"
            value={formData.groupId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, groupId: e.target.value })
            }
            placeholder="Enter group ID"
            error=""
          />
          <Input
            label="Preferred Date"
            type="date"
            value={formData.preferredDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, preferredDate: e.target.value })
            }
            placeholder=""
            error=""
          />
          <Input
            label="Preferred Time"
            type="time"
            value={formData.preferredTime}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, preferredTime: e.target.value })
            }
            placeholder=""
            error=""
          />
          <Input
            label="Duration (hours)"
            type="number"
            value={formData.duration}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, duration: e.target.value })
            }
            placeholder="Enter duration in hours"
            error=""
          />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as "flexibility" | "prime-time",
                })
              }
              className="w-full bg-neutral-50 border-2 border-neutral-200 rounded-md px-4 py-3 text-neutral-700 focus:outline-none focus:border-accent-blue"
            >
              <option value="flexibility">Flexibility</option>
              <option value="prime-time">Prime Time</option>
            </select>
          </div>
          <Button
            variant="primary"
            onClick={handleGetRecommendations}
            disabled={initialLoading}
          >
            {initialLoading ? "Loading..." : "Get Recommendations"}
          </Button>
        </div>
      </Card>

      {initialLoading && (
        <Card>
          <div className="text-center py-12">
            <LoadingSpinner />
          </div>
        </Card>
      )}

      {!initialLoading && recommendations.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-neutral-800 mb-4">
            Recommended Time Slots
          </h3>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="border border-neutral-200 rounded-md p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-neutral-800">
                      {new Date(rec.dateTime).toLocaleString()}
                    </h4>
                    <p className="text-sm text-neutral-600">
                      Duration: {rec.duration.toFixed(1)} hours
                    </p>
                    <p className="text-xs text-neutral-500">
                      {new Date(rec.dateTime).toLocaleDateString()} at{" "}
                      {new Date(rec.dateTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Badge
                    variant={
                      rec.confidence >= 0.8
                        ? "success"
                        : rec.confidence >= 0.6
                        ? "warning"
                        : "default"
                    }
                  >
                    {Math.round(rec.confidence * 100)}% confidence
                  </Badge>
                </div>
                <div className="space-y-2">
                  {rec.fairUsageImpact !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-600">
                        Fair usage impact:
                      </span>
                      <Badge
                        variant={
                          rec.fairUsageImpact >= 0 ? "success" : "warning"
                        }
                      >
                        {rec.fairUsageImpact >= 0 ? "+" : ""}
                        {rec.fairUsageImpact}%
                      </Badge>
                    </div>
                  )}
                  {rec.reasoning && (
                    <p className="text-sm text-neutral-600">{rec.reasoning}</p>
                  )}
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => {
                      // Book this time slot
                    }}
                  >
                    Book This Time
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {recommendations.length === 0 && !initialLoading && (
        <Card>
          <div className="text-center py-12">
            <p className="text-neutral-600">
              No recommendations available. Fill in the form above to get
              recommendations.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AiBookingRecommendations;
