import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Close,
  LocationOn,
  People,
  AttachMoney,
  Description,
} from "@mui/icons-material";
import type { MarketplaceGroupDto } from "@/models/analytics";
import type { UUID } from "@/models/booking";
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
  const { data: groupDetails } = useGroup(group?.groupId);

  const handleApplyToJoin = () => {
    if (group?.groupId) {
      navigate(`/home/groups/${group.groupId}/apply`);
      onClose();
    }
  };

  if (!group) {
    return null;
  }

  const availableOwnership = group.availableOwnershipPercentage;
  const isAvailable = availableOwnership > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-neutral-100 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-neutral-600 transition hover:bg-white hover:text-neutral-900"
          aria-label="Close"
        >
          <Close />
        </button>

        {/* Vehicle Photo */}
        {group.vehiclePhoto && (
          <div className="relative h-64 w-full overflow-hidden rounded-t-2xl bg-neutral-200">
            <img
              src={group.vehiclePhoto}
              alt={`${group.vehicleMake} ${group.vehicleModel}`}
              className="h-full w-full object-cover"
            />
            {isAvailable && (
              <div className="absolute right-4 top-4 rounded-full bg-accent-green/90 px-3 py-1 text-sm font-semibold text-white">
                {availableOwnership.toFixed(1)}% available
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
          </div>

          {/* Key Info Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-white p-4">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <People fontSize="small" />
                <span>Members</span>
              </div>
              <p className="mt-1 text-2xl font-semibold text-neutral-900">
                {group.currentMembers}/{group.totalMembers}
              </p>
            </div>

            {group.monthlyEstimatedCost !== null &&
              group.monthlyEstimatedCost !== undefined && (
                <div className="rounded-xl bg-white p-4">
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <AttachMoney fontSize="small" />
                    <span>Monthly Cost</span>
                  </div>
                  <p className="mt-1 text-2xl font-semibold text-neutral-900">
                    {currency.format(group.monthlyEstimatedCost)}
                  </p>
                </div>
              )}

            {group.location && (
              <div className="rounded-xl bg-white p-4">
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <LocationOn fontSize="small" />
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
            <div className="rounded-xl bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-600">
                <Description fontSize="small" />
                <span>About</span>
              </div>
              <p className="mt-2 text-neutral-700">{group.description}</p>
            </div>
          )}

          {/* Vehicle Details */}
          <div className="rounded-xl bg-white p-4">
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

          {/* Ownership Breakdown */}
          <div className="rounded-xl bg-white p-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Ownership
            </h3>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Available</span>
                <span className="font-semibold text-neutral-900">
                  {availableOwnership.toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full bg-accent-blue transition-all"
                  style={{ width: `${availableOwnership}%` }}
                />
              </div>
            </div>
          </div>

          {/* Group Stats */}
          {group.utilizationRate !== undefined && (
            <div className="rounded-xl bg-white p-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                Group Statistics
              </h3>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-neutral-500">Utilization Rate</dt>
                  <dd className="text-lg font-semibold text-neutral-900">
                    {group.utilizationRate.toFixed(1)}%
                  </dd>
                </div>
                {group.participationRate !== undefined && (
                  <div>
                    <dt className="text-sm text-neutral-500">
                      Participation Rate
                    </dt>
                    <dd className="text-lg font-semibold text-neutral-900">
                      {group.participationRate.toFixed(1)}%
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

          {/* Co-owners (if available) */}
          {groupDetails && groupDetails.members.length > 0 && (
            <div className="rounded-xl bg-white p-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                Current Co-owners
              </h3>
              <div className="mt-4 space-y-2">
                {groupDetails.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg bg-neutral-50 p-3"
                  >
                    <div>
                      <p className="font-medium text-neutral-900">
                        {member.userFirstName} {member.userLastName}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {member.userEmail}
                      </p>
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
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border-2 border-neutral-300 bg-white px-6 py-3 font-semibold text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
            >
              Close
            </button>
            {isAvailable ? (
              <button
                onClick={handleApplyToJoin}
                className="flex-1 rounded-xl bg-accent-blue px-6 py-3 font-semibold text-white transition hover:bg-accent-blue/90"
              >
                Apply to Join
              </button>
            ) : (
              <button
                disabled
                className="flex-1 rounded-xl bg-neutral-300 px-6 py-3 font-semibold text-neutral-500"
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
