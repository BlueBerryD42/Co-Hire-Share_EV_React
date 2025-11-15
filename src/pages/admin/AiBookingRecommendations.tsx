import { useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const AiBookingRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    groupId: "",
    preferredDate: "",
    preferredTime: "",
    duration: "",
    priority: "flexibility",
  });

  const handleGetRecommendations = async () => {
    try {
      setLoading(true);
      // Call AI API to get booking recommendations
      // const response = await aiApi.suggestBookingTime(formData)
      // setRecommendations(response.data.recommendations || [])
      const sampleRecommendations = [
        {
          dateTime: new Date().toISOString(),
          duration: 2,
          confidence: 0.82,
          fairUsageImpact: 6,
          reasoning:
            "Optimal time slot based on historic utilization and minimal conflicts.",
        },
        {
          dateTime: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
          duration: 1.5,
          confidence: 0.67,
          fairUsageImpact: -2,
          reasoning:
            "Slight overlap with another booking but still within acceptable limits.",
        },
      ];
      setRecommendations(sampleRecommendations);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">
        AI Booking Recommendations
      </h1>

      <Card>
        <h3 className="text-lg font-bold text-neutral-800 mb-4">
          Request Recommendations
        </h3>
        <div className="space-y-4">
          <Input
            label="Group ID"
            type="text"
            value={formData.groupId}
            onChange={(e) =>
              setFormData({ ...formData, groupId: e.target.value })
            }
            placeholder="Enter group ID"
          />
          <Input
            label="Preferred Date"
            type="date"
            value={formData.preferredDate}
            onChange={(e) =>
              setFormData({ ...formData, preferredDate: e.target.value })
            }
          />
          <Input
            label="Preferred Time"
            type="time"
            value={formData.preferredTime}
            onChange={(e) =>
              setFormData({ ...formData, preferredTime: e.target.value })
            }
          />
          <Input
            label="Duration (hours)"
            type="number"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
            placeholder="Enter duration in hours"
          />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="w-full bg-neutral-50 border-2 border-neutral-200 rounded-md px-4 py-3 text-neutral-700 focus:outline-none focus:border-accent-blue"
            >
              <option value="flexibility">Flexibility</option>
              <option value="prime-time">Prime Time</option>
            </select>
          </div>
          <Button
            variant="accent"
            onClick={handleGetRecommendations}
            disabled={loading}
          >
            Get Recommendations
          </Button>
        </div>
      </Card>

      {recommendations.length > 0 && (
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
                      Duration: {rec.duration} hours
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-600">
                      Fair usage impact:
                    </span>
                    <Badge
                      variant={rec.fairUsageImpact >= 0 ? "success" : "warning"}
                    >
                      {rec.fairUsageImpact >= 0 ? "+" : ""}
                      {rec.fairUsageImpact}%
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-600">{rec.reasoning}</p>
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

      {recommendations.length === 0 && !loading && (
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
