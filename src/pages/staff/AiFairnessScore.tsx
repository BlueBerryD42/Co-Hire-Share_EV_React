import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { aiApi, adminApi } from "@/utils/api";
import type { FairnessAnalysisResponse } from "@/models/ai";
import type { GroupDto } from "@/models/group";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/Loading";

const AiFairnessScore = () => {
  const params = useParams();
  const groupId = params?.groupId;
  const navigate = useNavigate();
  const [fairnessData, setFairnessData] =
    useState<FairnessAnalysisResponse | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groupId || "");
  const [loadingGroups, setLoadingGroups] = useState(false);

  useEffect(() => {
    // Reset state when groupId changes
    if (groupId) {
      setSelectedGroupId(groupId);
      setInitialLoading(true);
      setError(null);
      // Fetch groups first to get member count, then fetch fairness score
      fetchGroups().then(() => {
        fetchFairnessScore();
      });
    } else {
      setInitialLoading(false);
      setLoadingGroups(true);
      fetchGroups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const response = await adminApi.getGroups({ page: 1, pageSize: 100 });
      const groupsData = response.data?.groups || response.data || [];
      setGroups(Array.isArray(groupsData) ? groupsData : []);
      return Promise.resolve();
    } catch (err) {
      console.error("Error fetching groups:", err);
      setGroups([]);
      return Promise.resolve();
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchFairnessScore = async () => {
    if (!groupId) return;
    try {
      setInitialLoading(true);
      setError(null);
      const response = await aiApi.getFairnessScore(groupId);
      setFairnessData(response.data as FairnessAnalysisResponse);
    } catch (err) {
      console.error("Error fetching fairness score:", err);
      setError("Failed to load fairness score");
      setFairnessData(null);
    } finally {
      setInitialLoading(false);
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
        <Card hover={false}>
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
                        {group.name} ({group.members?.length || 0} members)
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
                variant="primary"
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

  // Show loading spinner only on initial load
  if (initialLoading && !fairnessData) {
    return <LoadingSpinner />;
  }

  if (!fairnessData) {
    return null;
  }

  const score = fairnessData.groupFairnessScore || 0;
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-accent-green";
    if (score >= 50) return "text-accent-gold";
    return "text-accent-terracotta";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Fair";
    if (score >= 50) return "Moderate";
    return "Unfair";
  };

  // Transform recommendations to display format
  const displaySuggestions =
    fairnessData.recommendations?.groupRecommendations?.map((rec, index) => ({
      title: `Recommendation ${index + 1}`,
      description: rec,
    })) || [];

  // Get the selected group to get actual member count
  const selectedGroup = groups.find((g) => g.id === groupId);
  const actualMemberCount =
    selectedGroup?.members?.length ||
    selectedGroup?.memberCount ||
    fairnessData.members?.length ||
    0;

  // Create factors display from members data
  const fairnessFactors = [
    {
      name: "Distribution Balance",
      score: 100 - fairnessData.giniCoefficient * 100,
      description: `Gini Coefficient: ${(
        fairnessData.giniCoefficient * 100
      ).toFixed(2)}% (lower is better)`,
    },
    {
      name: "Usage vs Ownership Alignment",
      score: fairnessData.groupFairnessScore,
      description: `Standard deviation: ${fairnessData.standardDeviationFromOwnership.toFixed(
        2
      )}%`,
    },
    {
      name: "Member Participation",
      score: Math.max(
        0,
        100 -
          (fairnessData.alerts?.hasSevereOverUtilizers ? 20 : 0) -
          (fairnessData.alerts?.hasSevereUnderUtilizers ? 20 : 0)
      ),
      description: `${actualMemberCount} members analyzed`,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">AI Fairness Score</h1>

      {error && (
        <Card hover={false}>
          <div className="bg-accent-terracotta/20 border border-accent-terracotta rounded-md p-4">
            <p className="text-accent-terracotta mb-3">{error}</p>
            <Button variant="secondary" size="sm" onClick={fetchFairnessScore}>
              Retry
            </Button>
          </div>
        </Card>
      )}

      {!fairnessData && !initialLoading && !error && (
        <Card hover={false}>
          <div className="text-center py-12">
            <p className="text-neutral-600">No fairness data available</p>
          </div>
        </Card>
      )}

      {fairnessData && (
        <>
          {/* Score Display */}
          <Card hover={false}>
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
                      score >= 80
                        ? "#7a9b76"
                        : score >= 50
                        ? "#d4a574"
                        : "#b87d6f"
                    }
                    strokeWidth="8"
                    strokeDasharray={`${(score / 100) * 552.92} 552.92`}
                  />
                </svg>
              </div>
            </div>
          </Card>

          {/* Breakdown */}
          <Card hover={false}>
            <h3 className="text-lg font-bold text-neutral-800 mb-4">
              Fairness Breakdown
            </h3>
            <div className="space-y-4">
              {fairnessFactors.map((factor, index) => (
                <div
                  key={index}
                  className="border border-neutral-200 rounded-md p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-neutral-800">
                      {factor.name}
                    </h4>
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
                  <p className="text-sm text-neutral-600">
                    {factor.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Member Details */}
          {fairnessData.members && fairnessData.members.length > 0 && (
            <Card hover={false}>
              <h3 className="text-lg font-bold text-neutral-800 mb-4">
                Member Fairness Scores
              </h3>
              <div className="space-y-3">
                {fairnessData.members.map((member) => (
                  <div
                    key={member.userId}
                    className="border border-neutral-200 rounded-md p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-neutral-800">
                        {member.userFirstName} {member.userLastName}
                      </h4>
                      <div className="flex gap-2">
                        <Badge
                          variant={
                            member.fairnessScore >= 80
                              ? "success"
                              : member.fairnessScore >= 50
                              ? "warning"
                              : "error"
                          }
                        >
                          {member.fairnessScore.toFixed(1)}
                        </Badge>
                        {member.isOverUtilizer && (
                          <Badge variant="error">Over-utilizing</Badge>
                        )}
                        {member.isUnderUtilizer && (
                          <Badge variant="warning">Under-utilizing</Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-neutral-600">Ownership: </span>
                        <span className="font-medium">
                          {member.ownershipPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-600">Usage: </span>
                        <span className="font-medium">
                          {member.usagePercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Suggestions */}
          {displaySuggestions.length > 0 && (
            <Card hover={false}>
              <h3 className="text-lg font-bold text-neutral-800 mb-4">
                Suggestions for Improvement
              </h3>
              <div className="space-y-3">
                {displaySuggestions.map((suggestion, index) => (
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
          {fairnessData.trend && fairnessData.trend.length > 0 && (
            <Card hover={false}>
              <h3 className="text-lg font-bold text-neutral-800 mb-4">
                Historical Trend
              </h3>
              <div className="space-y-4">
                <p className="text-neutral-600">Score over time</p>
                {/* Chart would go here */}
                <div className="space-y-2">
                  {fairnessData.trend.slice(-6).map((point, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border border-neutral-200 rounded-md p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-neutral-800">
                          {new Date(point.periodStart).toLocaleDateString()} -{" "}
                          {new Date(point.periodEnd).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          point.groupFairnessScore >= 80
                            ? "success"
                            : point.groupFairnessScore >= 50
                            ? "warning"
                            : "error"
                        }
                      >
                        {point.groupFairnessScore.toFixed(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default AiFairnessScore;
