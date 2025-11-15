import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { aiApi, adminApi } from "@/utils/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/Loading";

const AiFairnessScore = () => {
  const params = useParams();
  const groupId = params?.groupId;
  const navigate = useNavigate();
  const [fairnessData, setFairnessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(groupId || "");
  const [loadingGroups, setLoadingGroups] = useState(false);

  useEffect(() => {
    // Reset state when groupId changes
    if (groupId) {
      setSelectedGroupId(groupId);
      setLoading(true);
      setError(null);
      fetchFairnessScore();
    } else {
      setLoading(false);
      setLoadingGroups(true);
      fetchGroups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const response = await adminApi.getGroups({ page: 1, pageSize: 100 });
      setGroups(response.data?.groups || response.data || []);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchFairnessScore = async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await aiApi.getFairnessScore(groupId);
      setFairnessData(response.data);
    } catch (err) {
      console.error("Error fetching fairness score:", err);
      setError("Failed to load fairness score");
      setFairnessData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewScore = () => {
    if (selectedGroupId) {
      navigate(`/admin/ai/fairness-score/${selectedGroupId}`);
    }
  };

  // Show selection form if no groupId is provided
  if (!groupId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-800">
          AI Fairness Score
        </h1>
        <Card>
          <h3 className="text-lg font-bold text-neutral-800 mb-4">
            Select Group
          </h3>
          <p className="text-neutral-600 mb-4">
            Please select a group to view its fairness score.
          </p>
          {loadingGroups ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Group
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full bg-neutral-50 border-2 border-neutral-200 rounded-md px-4 py-3 text-neutral-700 focus:outline-none focus:border-accent-blue"
                >
                  <option value="">Select a group...</option>
                  {groups.length > 0 ? (
                    groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name} ({group.memberCount || 0} members)
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No groups available
                    </option>
                  )}
                </select>
              </div>
              {groups.length === 0 && !loadingGroups && (
                <p className="text-sm text-neutral-600">
                  No groups found. Please create a group first.
                </p>
              )}
              <Button
                variant="accent"
                onClick={handleViewScore}
                disabled={!selectedGroupId}
              >
                View Fairness Score
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  if (loading && !fairnessData) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-accent-terracotta">{error}</p>
        <Button variant="accent" onClick={fetchFairnessScore} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!fairnessData) {
    return <div className="text-center py-12">No fairness data available</div>;
  }

  const score = fairnessData.score || 0;
  const getScoreColor = (score) => {
    if (score >= 80) return "text-accent-green";
    if (score >= 50) return "text-accent-gold";
    return "text-accent-terracotta";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Fair";
    if (score >= 50) return "Moderate";
    return "Unfair";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">AI Fairness Score</h1>

      {/* Score Display */}
      <Card>
        <div className="text-center py-8">
          <div className="relative inline-block">
            <div className="w-48 h-48 rounded-full border-8 border-neutral-200 flex items-center justify-center">
              <div className="text-center">
                <p className={`text-5xl font-bold ${getScoreColor(score)}`}>
                  {score}
                </p>
                <p className="text-lg text-neutral-600 mt-2">
                  {getScoreLabel(score)}
                </p>
              </div>
            </div>
            {/* Circular progress indicator */}
            <svg className="absolute top-0 left-0 w-48 h-48 -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke={
                  score >= 80 ? "#7a9b76" : score >= 50 ? "#d4a574" : "#b87d6f"
                }
                strokeWidth="8"
                strokeDasharray={`${(score / 100) * 552.92} 552.92`}
              />
            </svg>
          </div>
        </div>
      </Card>

      {/* Breakdown */}
      <Card>
        <h3 className="text-lg font-bold text-neutral-800 mb-4">
          Fairness Breakdown
        </h3>
        <div className="space-y-4">
          {fairnessData.factors?.map((factor, index) => (
            <div
              key={index}
              className="border border-neutral-200 rounded-md p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-neutral-800">{factor.name}</h4>
                <Badge
                  variant={
                    factor.score >= 80
                      ? "success"
                      : factor.score >= 50
                      ? "warning"
                      : "error"
                  }
                >
                  {factor.score}/100
                </Badge>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full ${
                    factor.score >= 80
                      ? "bg-accent-green"
                      : factor.score >= 50
                      ? "bg-accent-gold"
                      : "bg-accent-terracotta"
                  }`}
                  style={{ width: `${factor.score}%` }}
                />
              </div>
              <p className="text-sm text-neutral-600">{factor.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Suggestions */}
      {fairnessData.suggestions && fairnessData.suggestions.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-neutral-800 mb-4">
            Suggestions for Improvement
          </h3>
          <div className="space-y-3">
            {fairnessData.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="border border-neutral-200 rounded-md p-4 bg-neutral-50"
              >
                <p className="text-sm font-medium text-neutral-800">
                  {suggestion.title}
                </p>
                <p className="text-sm text-neutral-600 mt-1">
                  {suggestion.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Historical Trend */}
      {fairnessData.historicalTrend && (
        <Card>
          <h3 className="text-lg font-bold text-neutral-800 mb-4">
            Historical Trend
          </h3>
          <div className="space-y-4">
            <p className="text-neutral-600">Score over the last 6 months</p>
            {/* Chart would go here */}
            <div className="h-48 bg-neutral-100 rounded-md flex items-center justify-center">
              <p className="text-neutral-600">
                Chart visualization would go here
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AiFairnessScore;
