import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { aiApi, adminApi } from "@/utils/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/Loading";

const PredictiveMaintenance = () => {
  const params = useParams();
  const vehicleId = params?.vehicleId;
  const navigate = useNavigate();
  const [maintenanceData, setMaintenanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicleId || "");
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  useEffect(() => {
    // Reset state when vehicleId changes
    if (vehicleId) {
      setSelectedVehicleId(vehicleId);
      setLoading(true);
      setError(null);
      fetchPredictiveMaintenance();
    } else {
      setLoading(false);
      setLoadingVehicles(true);
      fetchVehicles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const response = await adminApi.getVehicles({ page: 1, pageSize: 100 });
      setVehicles(response.data?.vehicles || response.data || []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const fetchPredictiveMaintenance = async () => {
    if (!vehicleId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await aiApi.getPredictiveMaintenance(vehicleId);
      setMaintenanceData(response.data);
    } catch (err) {
      console.error("Error fetching predictive maintenance:", err);
      setError("Failed to load predictive maintenance data");
      setMaintenanceData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMaintenance = () => {
    if (selectedVehicleId) {
      navigate(`/admin/ai/predictive-maintenance/${selectedVehicleId}`);
    }
  };

  // Show selection form if no vehicleId is provided
  if (!vehicleId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-800">
          Predictive Maintenance
        </h1>
        <Card>
          <h3 className="text-lg font-bold text-neutral-800 mb-4">
            Select Vehicle
          </h3>
          <p className="text-neutral-600 mb-4">
            Please select a vehicle to view its predictive maintenance data.
          </p>
          {loadingVehicles ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Vehicle
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full bg-neutral-50 border-2 border-neutral-200 rounded-md px-4 py-3 text-neutral-700 focus:outline-none focus:border-accent-blue"
                >
                  <option value="">Select a vehicle...</option>
                  {vehicles.length > 0 ? (
                    vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No vehicles available
                    </option>
                  )}
                </select>
              </div>
              {vehicles.length === 0 && !loadingVehicles && (
                <p className="text-sm text-neutral-600">
                  No vehicles found. Please add a vehicle first.
                </p>
              )}
              <Button
                variant="accent"
                onClick={handleViewMaintenance}
                disabled={!selectedVehicleId}
              >
                View Predictive Maintenance
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  if (loading && !maintenanceData) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-accent-terracotta">{error}</p>
        <Button
          variant="accent"
          onClick={fetchPredictiveMaintenance}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!maintenanceData) {
    return (
      <div className="text-center py-12">
        No predictive maintenance data available
      </div>
    );
  }

  const healthScore = maintenanceData.healthScore || 0;
  const getHealthColor = (score) => {
    if (score >= 80) return "text-accent-green";
    if (score >= 60) return "text-accent-gold";
    if (score >= 40) return "text-orange-600";
    return "text-accent-terracotta";
  };

  const getHealthLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">
        Predictive Maintenance
      </h1>

      {/* Health Score */}
      <Card>
        <div className="text-center py-8">
          <div className="relative inline-block">
            <div className="w-48 h-48 rounded-full border-8 border-neutral-200 flex items-center justify-center">
              <div className="text-center">
                <p
                  className={`text-5xl font-bold ${getHealthColor(
                    healthScore
                  )}`}
                >
                  {healthScore}
                </p>
                <p className="text-lg text-neutral-600 mt-2">
                  {getHealthLabel(healthScore)}
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
                  healthScore >= 80
                    ? "#7a9b76"
                    : healthScore >= 60
                    ? "#d4a574"
                    : healthScore >= 40
                    ? "#f59e0b"
                    : "#b87d6f"
                }
                strokeWidth="8"
                strokeDasharray={`${(healthScore / 100) * 552.92} 552.92`}
              />
            </svg>
          </div>
        </div>
      </Card>

      {/* Predicted Issues */}
      {maintenanceData.predictedIssues &&
        maintenanceData.predictedIssues.length > 0 && (
          <Card>
            <h3 className="text-lg font-bold text-neutral-800 mb-4">
              Predicted Issues
            </h3>
            <div className="space-y-4">
              {maintenanceData.predictedIssues.map((issue, index) => (
                <div
                  key={index}
                  className={`border rounded-md p-4 ${
                    issue.severity === "High" || issue.severity === "Critical"
                      ? "border-accent-terracotta bg-red-50"
                      : issue.severity === "Medium"
                      ? "border-accent-gold bg-yellow-50"
                      : "border-neutral-200 bg-neutral-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-neutral-800">
                        {issue.type}
                      </h4>
                      <p className="text-sm text-neutral-600">{issue.name}</p>
                    </div>
                    <Badge
                      variant={
                        issue.severity === "High" ||
                        issue.severity === "Critical"
                          ? "error"
                          : issue.severity === "Medium"
                          ? "warning"
                          : "default"
                      }
                    >
                      {issue.severity}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">
                        Likelihood:
                      </span>
                      <span className="text-sm font-medium text-neutral-800">
                        {Math.round(issue.likelihood * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-accent-blue h-2 rounded-full"
                        style={{ width: `${issue.likelihood * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">
                        Estimated Timeline:
                      </span>
                      <span className="text-sm font-medium text-neutral-800">
                        {issue.timeline}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">
                        Estimated Cost:
                      </span>
                      <span className="text-sm font-medium text-neutral-800">
                        ${issue.costRange?.min || 0} - $
                        {issue.costRange?.max || 0}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mt-2">
                      {issue.recommendation}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => {
                          // Schedule maintenance
                        }}
                      >
                        Schedule Now
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          // Remind me later
                        }}
                      >
                        Remind Me
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

      {/* Maintenance Schedule Optimizer */}
      {maintenanceData.suggestedBundles &&
        maintenanceData.suggestedBundles.length > 0 && (
          <Card>
            <h3 className="text-lg font-bold text-neutral-800 mb-4">
              Maintenance Schedule Optimizer
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              Combine these services to save money
            </p>
            <div className="space-y-4">
              {maintenanceData.suggestedBundles.map((bundle, index) => (
                <div
                  key={index}
                  className="border border-neutral-200 rounded-md p-4 bg-neutral-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-neutral-800">
                        {bundle.title}
                      </h4>
                      <p className="text-sm text-neutral-600">
                        {bundle.services.join(", ")}
                      </p>
                    </div>
                    <Badge variant="success">
                      Save ${bundle.potentialSavings}
                    </Badge>
                  </div>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => {
                      // Schedule bundle
                    }}
                  >
                    Schedule Bundle
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
    </div>
  );
};

export default PredictiveMaintenance;
