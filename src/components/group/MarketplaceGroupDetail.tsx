import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  MapPin,
  Users,
  DollarSign,
  Car,
  FileText,
  CheckCircle2,
  User,
  Percent,
} from "lucide-react";
import type { MarketplaceGroupDto } from "@/models/analytics";
import { marketplaceApi } from "@/services/group/marketplace";
import { useGroup } from "@/hooks/useGroups";

interface MarketplaceGroupDetailProps {
  group: MarketplaceGroupDto | null;
  onClose: () => void;
}

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const MarketplaceGroupDetail = ({
  group,
  onClose,
}: MarketplaceGroupDetailProps) => {
  const navigate = useNavigate();
  const { data: groupDetails, loading: loadingDetails } = useGroup(
    group?.groupId
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleApplyToJoin = () => {
    if (group?.groupId) {
      navigate(`/groups/${group.groupId}/apply`);
      onClose();
    }
  };

  if (!group) {
    return null;
  }

  // Ensure availableOwnership is always a number, handle null/undefined/NaN
  const availableOwnershipValue = group.availableOwnershipPercentage ?? 0;
  const availableOwnershipNum = Number(availableOwnershipValue);
  const availableOwnership = Number.isFinite(availableOwnershipNum) && !Number.isNaN(availableOwnershipNum)
    ? availableOwnershipNum 
    : 0;
  const isAvailable = availableOwnership > 0;
  
  // Ensure totalOwnershipPercentage is always a number
  const totalOwnershipValue = group.totalOwnershipPercentage ?? 0;
  const totalOwnershipNum = Number(totalOwnershipValue);
  const totalOwnership = Number.isFinite(totalOwnershipNum) && !Number.isNaN(totalOwnershipNum)
    ? totalOwnershipNum 
    : 0;

  // Mock vehicle images array (in real app, this would come from vehicle data)
  const vehicleImages = group.vehiclePhoto ? [group.vehiclePhoto] : [];

  // Calculate cost breakdown (simplified - in real app would come from backend)
  const costBreakdown = group.monthlyEstimatedCost
    ? {
        baseCost: group.monthlyEstimatedCost * 0.6,
        maintenance: group.monthlyEstimatedCost * 0.2,
        insurance: group.monthlyEstimatedCost * 0.15,
        other: group.monthlyEstimatedCost * 0.05,
      }
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-neutral-100 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-neutral-600 transition hover:bg-white hover:text-neutral-900"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Vehicle Photo Carousel */}
        {vehicleImages.length > 0 ? (
          <div className="relative h-64 w-full overflow-hidden bg-neutral-200">
            <img
              src={vehicleImages[activeImageIndex]}
              alt={`${group.vehicleMake || ""} ${group.vehicleModel || ""}`}
              className="h-full w-full object-cover"
            />
            {isAvailable && (
              <div className="absolute right-6 top-4 rounded-full bg-accent-green/90 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                {availableOwnership.toFixed(0)}% available
              </div>
            )}
            {vehicleImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {vehicleImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === activeImageIndex
                        ? "w-8 bg-white"
                        : "w-2 bg-white/50"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-64 w-full bg-neutral-200">
            <Car className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 text-neutral-400" />
            {isAvailable && (
              <div className="absolute right-6 top-4 rounded-full bg-accent-green/90 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                {availableOwnership.toFixed(0)}% available
              </div>
            )}
          </div>
        )}

        <div className="space-y-6 p-6">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-semibold text-neutral-900">
              {group.groupName}
            </h2>
            {group.vehicleMake && group.vehicleModel && (
              <p className="mt-2 text-lg text-neutral-600">
                {group.vehicleMake} {group.vehicleModel}
                {group.vehicleYear && ` ${group.vehicleYear}`}
              </p>
            )}
            {group.vehiclePlateNumber && (
              <p className="mt-1 text-sm text-neutral-500">
                License Plate: {group.vehiclePlateNumber}
              </p>
            )}
          </div>

          {/* Key Info Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Users className="h-4 w-4" />
                <span>Members</span>
              </div>
              <p className="mt-1 text-2xl font-semibold text-neutral-900">
                {group.currentMembers}/{group.totalMembers}
              </p>
            </div>

            {group.monthlyEstimatedCost !== null &&
              group.monthlyEstimatedCost !== undefined && (
                <div className="rounded-lg border border-neutral-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <DollarSign className="h-4 w-4" />
                    <span>Monthly Cost</span>
                  </div>
                  <p className="mt-1 text-2xl font-semibold text-neutral-900">
                    {currency.format(group.monthlyEstimatedCost)}
                  </p>
                </div>
              )}

            {group.location && (
              <div className="rounded-lg border border-neutral-200 bg-white p-4">
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <MapPin className="h-4 w-4" />
                  <span>Location</span>
                </div>
                <p className="mt-1 text-lg font-semibold text-neutral-900">
                  {group.location}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          {group.description && (
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-600">
                <FileText className="h-4 w-4" />
                <span>About This Group</span>
              </div>
              <p className="mt-2 text-neutral-700">{group.description}</p>
            </div>
          )}

          {/* Vehicle Details */}
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Vehicle Information
            </h3>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {group.vehicleMake && (
                <>
                  <dt className="text-sm text-neutral-500">Make</dt>
                  <dd className="text-sm font-medium text-neutral-900">
                    {group.vehicleMake}
                  </dd>
                </>
              )}
              {group.vehicleModel && (
                <>
                  <dt className="text-sm text-neutral-500">Model</dt>
                  <dd className="text-sm font-medium text-neutral-900">
                    {group.vehicleModel}
                  </dd>
                </>
              )}
              {group.vehicleYear && (
                <>
                  <dt className="text-sm text-neutral-500">Year</dt>
                  <dd className="text-sm font-medium text-neutral-900">
                    {group.vehicleYear}
                  </dd>
                </>
              )}
              {group.vehiclePlateNumber && (
                <>
                  <dt className="text-sm text-neutral-500">Plate Number</dt>
                  <dd className="text-sm font-medium text-neutral-900">
                    {group.vehiclePlateNumber}
                  </dd>
                </>
              )}
            </dl>
          </div>

          {/* Cost Breakdown */}
          {costBreakdown && (
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                Monthly Cost Breakdown
              </h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Base Cost</span>
                  <span className="font-semibold text-neutral-900">
                    {currency.format(costBreakdown.baseCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Maintenance</span>
                  <span className="font-semibold text-neutral-900">
                    {currency.format(costBreakdown.maintenance)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Insurance</span>
                  <span className="font-semibold text-neutral-900">
                    {currency.format(costBreakdown.insurance)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Other</span>
                  <span className="font-semibold text-neutral-900">
                    {currency.format(costBreakdown.other)}
                  </span>
                </div>
                <div className="border-t border-neutral-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900">
                      Total (per member)
                    </span>
                    <span className="text-lg font-bold text-neutral-900">
                      {currency.format(group.monthlyEstimatedCost!)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ownership Breakdown */}
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Ownership
            </h3>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-neutral-600">Available</span>
                <span className="font-semibold text-neutral-900">
                  {availableOwnership.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full bg-accent-blue transition-all"
                  style={{ width: `${availableOwnership}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                {totalOwnership.toFixed(1)}% already owned
              </p>
            </div>
          </div>

          {/* Current Co-owners */}
          {loadingDetails ? (
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <p className="text-sm text-neutral-500">Loading members...</p>
            </div>
          ) : (
            groupDetails &&
            groupDetails.members.length > 0 && (
              <div className="rounded-lg border border-neutral-200 bg-white p-4">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Current Co-owners
                </h3>
                <div className="mt-4 space-y-2">
                  {groupDetails.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-lg bg-neutral-50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-blue/10">
                          <User className="h-5 w-5 text-accent-blue" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">
                            {member.userFirstName} {member.userLastName}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {member.userEmail}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-neutral-900">
                          {(member.sharePercentage * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-neutral-500">
                          {member.roleInGroup}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Group Statistics */}
          {(group.utilizationRate !== undefined ||
            group.participationRate !== undefined) && (
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                Group Statistics
              </h3>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {group.utilizationRate !== undefined && group.utilizationRate !== null && (
                  <div>
                    <dt className="text-sm text-neutral-500">
                      Utilization Rate
                    </dt>
                    <dd className="text-lg font-semibold text-neutral-900">
                      {(group.utilizationRate ?? 0).toFixed(1)}%
                    </dd>
                  </div>
                )}
                {group.participationRate !== undefined && group.participationRate !== null && (
                  <div>
                    <dt className="text-sm text-neutral-500">
                      Participation Rate
                    </dt>
                    <dd className="text-lg font-semibold text-neutral-900">
                      {(group.participationRate ?? 0).toFixed(1)}%
                    </dd>
                  </div>
                )}
                {group.totalBookings !== undefined && (
                  <div>
                    <dt className="text-sm text-neutral-500">Total Bookings</dt>
                    <dd className="text-lg font-semibold text-neutral-900">
                      {group.totalBookings}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Application Process Info */}
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Application Process
            </h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-green" />
                <div>
                  <p className="font-medium text-neutral-900">
                    Submit Application
                  </p>
                  <p className="text-sm text-neutral-600">
                    Fill out the application form with your desired ownership
                    percentage and usage intentions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-green" />
                <div>
                  <p className="font-medium text-neutral-900">Review</p>
                  <p className="text-sm text-neutral-600">
                    Group admin will review your application and may contact you
                    for additional information.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-green" />
                <div>
                  <p className="font-medium text-neutral-900">Approval</p>
                  <p className="text-sm text-neutral-600">
                    Once approved, you'll be added to the group and can start
                    booking the vehicle.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border-2 border-neutral-300 bg-white px-6 py-3 font-semibold text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
            >
              Close
            </button>
            {isAvailable ? (
              <button
                onClick={handleApplyToJoin}
                className="flex-1 rounded-lg bg-accent-blue px-6 py-3 font-semibold text-white transition hover:bg-accent-blue/90"
              >
                Apply to Join
              </button>
            ) : (
              <button
                disabled
                className="flex-1 rounded-lg bg-neutral-300 px-6 py-3 font-semibold text-neutral-500"
              >
                Group Full
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceGroupDetail;
