import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { aiApi, adminApi } from "@/utils/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/Loading";

const CostOptimizationInsights = () => {
  const params = useParams();
  const groupId = params?.groupId;
  const navigate = useNavigate();
  const [insights, setInsights] = useState(null);
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
      fetchCostOptimization();
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

  const fetchCostOptimization = async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await aiApi.getCostOptimization(groupId);
      setInsights(response.data);
    } catch (err) {
      console.error("Error fetching cost optimization:", err);
      setError("Failed to load cost optimization insights");
      setInsights(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInsights = () => {
    if (selectedGroupId) {
      navigate(`/admin/ai/cost-optimization/${selectedGroupId}`);
    }
  };

  // Show selection form if no groupId is provided
  if (!groupId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-800">
          Cost Optimization Insights
        </h1>
        <Card>
          <h3 className="text-lg font-bold text-neutral-800 mb-4">
            Select Group
          </h3>
          <p className="text-neutral-600 mb-4">
            Please select a group to view its cost optimization insights.
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
                variant="primary"
                onClick={handleViewInsights}
                disabled={!selectedGroupId}
              >
                View Cost Optimization
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  if (loading && !insights) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-accent-terracotta">{error}</p>
        <Button
          variant="primary"
          onClick={fetchCostOptimization}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-12">
        No cost optimization insights available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">
        Cost Optimization Insights
      </h1>

      {/* Savings Opportunities */}
      {insights.savingsOpportunities &&
        insights.savingsOpportunities.length > 0 && (
          <Card>
            <h3 className="text-lg font-bold text-neutral-800 mb-4">
              Savings Opportunities
            </h3>
            <div className="space-y-4">
              {insights.savingsOpportunities.map((opportunity, index) => (
                <div
                  key={index}
                  className="border border-neutral-200 rounded-md p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-neutral-800">
                        {opportunity.title}
                      </h4>
                      <p className="text-sm text-neutral-600 mt-1">
                        {opportunity.description}
                      </p>
                    </div>
                    <Badge variant="success">
                      Save ${opportunity.potentialSaving}/month
                    </Badge>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      // View suggestion details
                    }}
                  >
                    {opportunity.actionLabel || "View Suggestion"}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

      {/* Monthly Cost Forecast */}
      {insights.monthlyForecast && (
        <Card>
          <h3 className="text-lg font-bold text-neutral-800 mb-4">
            Monthly Cost Forecast
          </h3>
          <div className="space-y-4">
            <p className="text-neutral-600">
              Predicted costs for the next 3 months
            </p>
            <div className="h-48 bg-neutral-100 rounded-md flex items-center justify-center">
              <p className="text-neutral-600">
                Chart visualization would go here
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.monthlyForecast.map((forecast, index) => (
                <div
                  key={index}
                  className="border border-neutral-200 rounded-md p-4"
                >
                  <p className="text-sm text-neutral-600 mb-2">
                    {forecast.month}
                  </p>
                  <p className="text-2xl font-bold text-neutral-800">
                    ${forecast.predictedCost?.toFixed(2) || "0.00"}
                  </p>
                  {forecast.suggestedCost && (
                    <p className="text-sm text-accent-green mt-1">
                      With suggestions: ${forecast.suggestedCost.toFixed(2)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Comparison */}
      {insights.comparison && (
        <Card>
          <h3 className="text-lg font-bold text-neutral-800 mb-4">
            Group Comparison
          </h3>
          <div className="space-y-4">
            <p className="text-neutral-600">Your group vs similar groups</p>
            <div className="h-48 bg-neutral-100 rounded-md flex items-center justify-center">
              <p className="text-neutral-600">
                Chart visualization would go here
              </p>
            </div>
            {insights.comparison.savingsPercentage && (
              <div className="border border-neutral-200 rounded-md p-4 bg-accent-green/10">
                <p className="text-sm font-medium text-neutral-800">
                  Your group saves {insights.comparison.savingsPercentage}% more
                  than average
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Gamification */}
      {insights.gamification && (
        <Card>
          <h3 className="text-lg font-bold text-neutral-800 mb-4">
            Savings Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-neutral-200 rounded-md p-4 text-center">
              <p className="text-sm text-neutral-600 mb-2">Savings Streak</p>
              <p className="text-3xl font-bold text-neutral-800">
                {insights.gamification.savingsStreak || 0} months
              </p>
            </div>
            <div className="border border-neutral-200 rounded-md p-4 text-center">
              <p className="text-sm text-neutral-600 mb-2">Total Saved</p>
              <p className="text-3xl font-bold text-accent-green">
                ${insights.gamification.totalSaved?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="border border-neutral-200 rounded-md p-4 text-center">
              <p className="text-sm text-neutral-600 mb-2">Leaderboard Rank</p>
              <p className="text-3xl font-bold text-neutral-800">
                #{insights.gamification.leaderboardRank || "N/A"}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CostOptimizationInsights;
