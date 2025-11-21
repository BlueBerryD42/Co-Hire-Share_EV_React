import { useState, useMemo } from "react";
import { aiApi } from "@/utils/api";
import type {
  SuggestBookingRequest,
  SuggestBookingResponse,
  BookingSuggestionItem,
} from "@/models/ai";
import type { UUID, ISODate } from "@/models/booking";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { LoadingSpinner, Skeleton } from "@/components/ui/Loading";
import { Sparkles, Star, Calendar, Clock } from "lucide-react";

interface AiBookingRecommendationsProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId?: string;
  groupId?: string;
  userId?: string;
  initialPreferredDate?: string;
  initialDuration?: number;
  onSelectSuggestion?: (suggestion: BookingSuggestionItem) => void;
}

const AiBookingRecommendations = ({
  isOpen,
  onClose,
  groupId,
  userId,
  initialPreferredDate,
  initialDuration = 4,
  onSelectSuggestion,
}: AiBookingRecommendationsProps) => {
  const [suggestions, setSuggestions] = useState<BookingSuggestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    preferredDate: initialPreferredDate || "",
    preferredTime: "",
    duration: initialDuration.toString(),
    priority: "flexibility" as "flexibility" | "prime-time",
  });

  const timeOptions = useMemo(() => {
    const options: { label: string; value: string }[] = [];
    const now = new Date();
    const todayDateString = now.toISOString().slice(0, 10);
    const minAllowedTime = new Date(now.getTime() + 30 * 60 * 1000); // Current time + 30 minutes

    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const timeValue = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        
        // If preferredDate is today, apply the 30-min future rule
        if (formData.preferredDate === todayDateString) {
          const checkDate = new Date();
          checkDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate()); // Ensure same date as 'now' for comparison
          checkDate.setHours(h, m, 0, 0);
          if (checkDate.getTime() < minAllowedTime.getTime()) {
            continue; // Skip times that are in the past or within 30 mins
          }
        }
        options.push({ label: timeValue, value: timeValue });
      }
    }
    return options;
  }, [formData.preferredDate]);

  // Note: We intentionally don't auto-fetch on open to let user set preferences first
  // User can click "Get AI Suggestions" button when ready

  const handleGetSuggestions = async () => {
    if (!groupId || !userId) {
      setError("Group ID and User ID are required");
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestions([]);

    // Combine date and time into ISO string
    let preferredDateTime: ISODate | undefined;
    if (formData.preferredDate) {
      // Only perform validation if a time is actually selected
      if (formData.preferredTime) {
        const selectedDateTime = `${formData.preferredDate}T${formData.preferredTime}:00`;
        const parsedDateTime = new Date(selectedDateTime);
        const minAllowedTime = new Date(Date.now() + 30 * 60 * 1000);
        const minutes = parsedDateTime.getMinutes();

        if (minutes !== 0 && minutes !== 30) {
          setError(
            "Vui lòng chọn thời gian theo khoảng 30 phút (ví dụ: 12:00, 12:30)."
          );
          setLoading(false);
          return;
        }

        if (parsedDateTime.getTime() < minAllowedTime.getTime()) {
          setError(
            "Thời gian ưu tiên phải sau thời gian hiện tại ít nhất 30 phút. Vui lòng chọn thời gian khác."
          );
          setLoading(false);
          return;
        }
      }

      const finalDateTime = formData.preferredTime
        ? `${formData.preferredDate}T${formData.preferredTime}:00`
        : `${formData.preferredDate}T12:00:00`;
      preferredDateTime = new Date(finalDateTime).toISOString();
    }

    try {
      // Convert duration from hours to minutes
      const durationMinutes = parseFloat(formData.duration) * 60;

      const request: SuggestBookingRequest = {
        userId: userId as UUID,
        groupId: groupId as UUID,
        preferredDate: preferredDateTime,
        durationMinutes: durationMinutes,
      };

      const response = await aiApi.suggestBookingTime(
        request as unknown as Record<string, unknown>
      );

      // Handle response structure - check if data is nested
      let bookingResponse: SuggestBookingResponse;
      if (response.data && "data" in response.data) {
        bookingResponse = response.data.data as SuggestBookingResponse;
      } else if (response.data && "suggestions" in response.data) {
        bookingResponse = response.data as SuggestBookingResponse;
      } else {
        bookingResponse = response.data as SuggestBookingResponse;
      }

      if (bookingResponse?.suggestions) {
        setSuggestions(bookingResponse.suggestions);
      } else {
        setError("No suggestions available. Try adjusting your preferences.");
      }
    } catch (err: unknown) {
      console.error("Error fetching AI recommendations:", err);

      // Better error handling for 404 and other HTTP errors
      let errorMessage =
        "Failed to fetch booking recommendations. Please try again.";

      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (axiosError.response?.status === 404) {
          // Check if it's a data issue or endpoint issue
          const errorData = axiosError.response.data;
          if (
            errorData &&
            typeof errorData === "object" &&
            "message" in errorData
          ) {
            const message = (errorData as { message?: string }).message || "";
            if (
              message.includes("insufficient data") ||
              message.includes("not found")
            ) {
              errorMessage = "ANALYTICS_DATA_NOT_READY";
            } else {
              errorMessage =
                "AI service endpoint not found. Please check if the Analytics service is running.";
            }
          } else {
            errorMessage =
              "Analytics data is still being processed. With 3 bookings, the system needs a few minutes to analyze patterns. Please wait 1-2 minutes and try again, or use the manual booking option.";
          }
        } else if (axiosError.response?.status === 401) {
          errorMessage = "Authentication required. Please log in again.";
        } else if (axiosError.response?.status === 403) {
          errorMessage =
            "You don't have permission to access AI recommendations.";
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.response?.status) {
          errorMessage = `Request failed with status code ${axiosError.response.status}`;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: BookingSuggestionItem) => {
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
      onClose();
    }
  };

  const getConfidenceStars = (confidence: number) => {
    const stars = Math.round(confidence * 5);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < stars
            ? "fill-accent-gold text-accent-gold"
            : "fill-neutral-300 text-neutral-300"
        }`}
      />
    ));
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      full: date.toLocaleString("vi-VN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    return hours;
  };

  const extractFairUsageImpact = (
    reasons: string[],
    index: number
  ): number | null => {
    // Try to extract from reasons (e.g., "+2%", "-1%")
    for (const reason of reasons) {
      const match = reason.match(/([+-]?\d+)%/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    // Estimate based on position and confidence
    // Higher confidence + earlier position = positive impact
    if (index === 0) {
      return 2; // Best match likely improves fairness
    } else if (index < 3) {
      return 1; // Good matches have slight positive impact
    }

    return null; // No significant impact
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm">
      <div className="bg-neutral-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-neutral-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-blue/10 rounded-lg">
              <Sparkles className="w-6 h-6 text-accent-blue" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-neutral-800">
                AI Booking Recommendations
              </h2>
              <p className="text-sm text-neutral-600">
                Need help finding a time? Try AI suggestions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6 text-neutral-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Input Form */}
          <Card className="bg-neutral-100" hover={false}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Your Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Preferred Date"
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, preferredDate: e.target.value })
                  }
                  placeholder="Select date"
                  error=""
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Preferred Time
                  </label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) =>
                      setFormData({ ...formData, preferredTime: e.target.value })
                    }
                    className="w-full bg-neutral-50 border-2 border-neutral-200 rounded-md px-4 py-3 text-neutral-700 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20"
                  >
                    <option value="">Select time</option>
                    {timeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Duration (hours)"
                  type="number"
                  value={formData.duration}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="4"
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
                        priority: e.target.value as
                          | "flexibility"
                          | "prime-time",
                      })
                    }
                    className="w-full bg-neutral-50 border-2 border-neutral-200 rounded-md px-4 py-3 text-neutral-700 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20"
                  >
                    <option value="flexibility">
                      Flexibility (More options)
                    </option>
                    <option value="prime-time">Prime Time (Peak hours)</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleGetSuggestions}
                disabled={
                  loading || !formData.preferredDate || !formData.duration
                }
                className="w-full bg-neutral-900 text-neutral-50 hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed font-semibold rounded-md px-6 py-3 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900"
              >
                {loading ? "Getting Suggestions..." : "Get AI Suggestions"}
              </button>
            </div>
          </Card>

          {/* Error State */}
          {error && (
            <Card
              className="bg-accent-terracotta/10 border-accent-terracotta"
              hover={false}
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-accent-terracotta/20 rounded-lg flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-accent-terracotta"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 space-y-2">
                    {error === "ANALYTICS_DATA_NOT_READY" ? (
                      <>
                        <p className="text-sm font-semibold text-accent-terracotta">
                          Analytics data chưa được tạo
                        </p>
                        <p className="text-sm text-neutral-700">
                          Hệ thống cần xử lý dữ liệu từ các bookings của bạn
                          trước khi có thể đưa ra gợi ý AI.
                        </p>
                        <div className="space-y-2 mt-3">
                          <div className="flex items-start gap-2 text-sm text-neutral-700">
                            <span className="text-accent-terracotta">⏱️</span>
                            <span>
                              <strong>Đợi 5-10 phút:</strong> Analytics service
                              tự động xử lý mỗi giờ hoặc khi có booking mới
                            </span>
                          </div>
                          <div className="flex items-start gap-2 text-sm text-neutral-700">
                            <span className="text-accent-terracotta">🔄</span>
                            <span>
                              <strong>Thử lại:</strong> Nhấn nút "Get AI
                              Suggestions" lại sau vài phút
                            </span>
                          </div>
                          <div className="flex items-start gap-2 text-sm text-neutral-700">
                            <span className="text-accent-terracotta">📞</span>
                            <span>
                              <strong>Liên hệ Admin:</strong> Nếu vẫn không hoạt
                              động sau 10 phút, có thể cần trigger analytics
                              processing thủ công
                            </span>
                          </div>
                          <div className="flex items-start gap-2 text-sm text-neutral-700">
                            <span className="text-accent-terracotta">✋</span>
                            <span>
                              <strong>Sử dụng đặt xe thủ công:</strong> Bạn vẫn
                              có thể đặt xe bình thường mà không cần AI
                              suggestions
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-accent-terracotta whitespace-pre-line">
                        {error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <Card className="bg-neutral-100" hover={false}>
              <div className="space-y-4">
                <LoadingSpinner />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Suggestions List */}
          {!loading && suggestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-800">
                  Top {suggestions.length} Recommended Time Slots
                </h3>
                <Badge variant="success" size="sm">
                  {suggestions.length} suggestions
                </Badge>
              </div>

              {suggestions.map((suggestion, index) => {
                const duration = calculateDuration(
                  suggestion.start,
                  suggestion.end
                );
                const formatted = formatDateTime(suggestion.start);
                const isBestMatch = index === 0 && suggestion.confidence >= 0.8;

                // Extract fair usage impact from reasons or calculate estimate
                const fairUsageImpact = extractFairUsageImpact(
                  suggestion.reasons,
                  index
                );

                return (
                  <Card
                    key={index}
                    className={`bg-neutral-100 transition-all duration-300 ${
                      isBestMatch ? "ring-2 ring-accent-blue" : ""
                    }`}
                    hover={true}
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-5 h-5 text-neutral-600" />
                              <span className="text-base font-semibold text-neutral-800">
                                {formatted.date}
                              </span>
                            </div>
                            {isBestMatch && (
                              <Badge variant="success" size="sm">
                                Best Match
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Clock className="w-4 h-4" />
                            <span>
                              {formatted.time} -{" "}
                              {new Date(suggestion.end).toLocaleTimeString(
                                "vi-VN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                            <span className="mx-2">•</span>
                            <span>{duration.toFixed(1)} hours</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            {getConfidenceStars(suggestion.confidence)}
                          </div>
                          <p className="text-xs text-neutral-600">
                            {Math.round(suggestion.confidence * 100)}%
                            confidence
                          </p>
                        </div>
                      </div>

                      {/* Fair Usage Impact */}
                      {fairUsageImpact !== null && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-600">
                            Fair usage impact:
                          </span>
                          <Badge
                            variant={
                              fairUsageImpact >= 0 ? "success" : "warning"
                            }
                            size="sm"
                          >
                            {fairUsageImpact >= 0 ? "+" : ""}
                            {fairUsageImpact}%
                          </Badge>
                        </div>
                      )}

                      {/* Reasoning */}
                      {suggestion.reasons && suggestion.reasons.length > 0 && (
                        <div className="bg-neutral-50 rounded-lg p-3 space-y-1">
                          <p className="text-xs font-medium text-neutral-700 mb-1">
                            Why this time?
                          </p>
                          <ul className="space-y-1">
                            {suggestion.reasons.map((reason, reasonIndex) => (
                              <li
                                key={reasonIndex}
                                className="text-xs text-neutral-600 flex items-start gap-2"
                              >
                                <span className="text-accent-blue mt-0.5">
                                  •
                                </span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="flex-1"
                        >
                          Book This Time
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    // Try different date - clear date and let user pick new one
                    setFormData((prev) => ({ ...prev, preferredDate: "" }));
                    setSuggestions([]);
                  }}
                  className="flex-1"
                >
                  Try Different Date
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleGetSuggestions}
                  disabled={loading}
                  className="flex-1"
                >
                  Show More Times
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && suggestions.length === 0 && !error && (
            <Card className="bg-neutral-100" hover={false}>
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                  No recommendations yet
                </h3>
                <p className="text-sm text-neutral-600 mb-6">
                  Fill in your preferences above and click "Get AI Suggestions"
                  to see recommended time slots.
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-100 flex items-center justify-between">
          <p className="text-xs text-neutral-600">
            Powered by Gemini AI • Suggestions based on availability and
            fairness
          </p>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AiBookingRecommendations;
