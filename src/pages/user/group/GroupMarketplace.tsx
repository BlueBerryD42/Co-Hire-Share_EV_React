import { useState } from "react";
import {
  Search,
  Filter,
  X,
  MapPin,
  Users,
  DollarSign,
  Car,
} from "lucide-react";
import { useGroupMarketplace } from "@/hooks/useMarketplace";
import MarketplaceGroupDetail from "@/components/group/MarketplaceGroupDetail";
import type { MarketplaceGroupDto } from "@/models/analytics";

// Add style to ensure text is black on marketplace cards
const cardStyle = `
  .marketplace-card,
  .marketplace-card * {
    color: #2d2520 !important;
  }
  .marketplace-card .text-secondary {
    color: #6b5a4d !important;
  }
  .marketplace-card .text-tertiary {
    color: #8f7d70 !important;
  }
`;

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

// Vehicle type options
const vehicleTypes = [
  { value: "", label: "All Types" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "hatchback", label: "Hatchback" },
  { value: "coupe", label: "Coupe" },
  { value: "convertible", label: "Convertible" },
];

const GroupMarketplace = () => {
  const marketplace = useGroupMarketplace({ limit: 50 });
  const [selectedGroup, setSelectedGroup] =
    useState<MarketplaceGroupDto | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleLearnMore = (group: MarketplaceGroupDto) => {
    setSelectedGroup(group);
  };

  const handleCloseDetail = () => {
    setSelectedGroup(null);
  };

  // Loading state
  if (marketplace.loading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 space-y-4">
            <div className="h-10 w-64 animate-pulse rounded-lg bg-neutral-200" />
            <div className="h-6 w-96 animate-pulse rounded-lg bg-neutral-200" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-xl bg-neutral-100"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (marketplace.error) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl bg-neutral-100 p-8 text-center">
            <p className="text-lg font-semibold" style={{ color: '#2d2520' }}>
              Something went wrong
            </p>
            <p className="mt-2" style={{ color: '#6b5a4d' }}>
              {marketplace.error.message || "Unable to load groups"}
            </p>
            <button
              onClick={() => marketplace.reload()}
              className="mt-4 rounded-lg bg-accent-blue px-6 py-2 font-semibold text-white transition hover:bg-accent-blue/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-neutral-900 md:text-4xl" style={{ color: '#2d2520' }}>
            Browse Groups
          </h1>
          <p className="mt-2 text-base md:text-lg" style={{ color: '#6b5a4d' }}>
            Find the perfect co-ownership group for you. Filter by location,
            vehicle type, price, and more.
          </p>
        </header>

        {/* Search and Filters Bar */}
        <div className="mb-8 rounded-xl border border-neutral-200 bg-neutral-100 p-6 shadow-card">
          {/* Search Bar */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium" style={{ color: '#6b5a4d' }}>
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by location, vehicle type, group name..."
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-3 pl-12 pr-4 focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                style={{ color: '#6b5a4d' }}
                value={marketplace.filters.search}
                onChange={(e) =>
                  marketplace.setFilters((prev) => ({
                    ...prev,
                    search: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* Quick Filters Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Location Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="mb-2 block text-sm font-medium" style={{ color: '#6b5a4d' }}>
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="City, district..."
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-10 pr-4 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                  style={{ color: '#6b5a4d' }}
                  value={marketplace.filters.location}
                  onChange={(e) =>
                    marketplace.setFilters((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Vehicle Type Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="mb-2 block text-sm font-medium" style={{ color: '#6b5a4d' }}>
                Vehicle Type
              </label>
              <select
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 px-4 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                style={{ color: '#6b5a4d' }}
                value={marketplace.filters.vehicleType}
                onChange={(e) =>
                  marketplace.setFilters((prev) => ({
                    ...prev,
                    vehicleType: e.target.value,
                  }))
                }
              >
                {vehicleTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="mb-2 block text-sm font-medium" style={{ color: '#6b5a4d' }}>
                Availability
              </label>
              <div className="flex gap-2">
                {(["Any", "Open", "Full"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      marketplace.setFilters((prev) => ({
                        ...prev,
                        availability: option,
                      }))
                    }
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      marketplace.filters.availability === option
                        ? "border-accent-blue bg-accent-blue text-white"
                        : "border-neutral-200 bg-neutral-50 hover:border-neutral-300"
                    }`}
                    style={marketplace.filters.availability === option ? {} : { color: '#6b5a4d' }}
                  >
                    {option === "Any" ? "All" : option}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium transition hover:border-neutral-300"
                style={{ color: '#6b5a4d' }}
              >
                <Filter className="h-4 w-4" />
                More Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{ color: '#2d2520' }}>
                  Advanced Filters
                </h3>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  style={{ color: '#8f7d70' }}
                  className="hover:opacity-70"
                >
                  <X className="h-5 w-5" style={{ color: '#8f7d70' }} />
                </button>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Price Range */}
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: '#6b5a4d' }}>
                    Monthly Cost Range
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                        style={{ color: '#6b5a4d' }}
                        value={marketplace.filters.minPrice || ""}
                        onChange={(e) =>
                          marketplace.setFilters((prev) => ({
                            ...prev,
                            minPrice: Number(e.target.value) || 0,
                          }))
                        }
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                        style={{ color: '#6b5a4d' }}
                        value={
                          marketplace.filters.maxPrice === 10000000
                            ? ""
                            : marketplace.filters.maxPrice || ""
                        }
                        onChange={(e) =>
                          marketplace.setFilters((prev) => ({
                            ...prev,
                            maxPrice: Number(e.target.value) || 10000000,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Members Range */}
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: '#6b5a4d' }}>
                    Number of Members
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        min="0"
                        className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                        style={{ color: '#6b5a4d' }}
                        value={marketplace.filters.minMembers || ""}
                        onChange={(e) =>
                          marketplace.setFilters((prev) => ({
                            ...prev,
                            minMembers: Number(e.target.value) || 0,
                          }))
                        }
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        min="0"
                        className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                        style={{ color: '#6b5a4d' }}
                        value={
                          marketplace.filters.maxMembers === 50
                            ? ""
                            : marketplace.filters.maxMembers || ""
                        }
                        onChange={(e) =>
                          marketplace.setFilters((prev) => ({
                            ...prev,
                            maxMembers: Number(e.target.value) || 50,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: '#6b5a4d' }}>
                    Sort By
                  </label>
                  <select
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                    style={{ color: '#6b5a4d' }}
                    value={marketplace.filters.sortBy}
                    onChange={(e) =>
                      marketplace.setFilters((prev) => ({
                        ...prev,
                        sortBy: e.target.value as typeof prev.sortBy,
                      }))
                    }
                  >
                    <option value="members">Members</option>
                    <option value="utilization">Utilization</option>
                    <option value="price">Price</option>
                    <option value="name">Name</option>
                  </select>
                </div>

                {/* Results Count */}
                <div className="flex items-end">
                  <div className="w-full rounded-lg bg-neutral-100 px-4 py-2 text-center">
                    <p className="text-sm" style={{ color: '#8f7d70' }}>
                      <span className="font-semibold" style={{ color: '#2d2520' }}>
                        {marketplace.filtered.length}
                      </span>{" "}
                      groups found
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Groups Grid */}
        {marketplace.filtered.length === 0 ? (
          <div className="rounded-xl bg-neutral-100 p-12 text-center" style={{ backgroundColor: '#f5ebe0' }}>
            <Car className="mx-auto h-16 w-16" style={{ color: '#d6ccc2' }} />
            <h3 className="mt-4 text-xl font-semibold" style={{ color: '#2d2520' }}>
              No groups found
            </h3>
            <p className="mt-2" style={{ color: '#6b5a4d' }}>
              Try adjusting your filters to see more results.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {marketplace.filtered.map((group) => (
              <GroupCard
                key={group.groupId}
                group={group}
                onLearnMore={handleLearnMore}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedGroup && (
        <MarketplaceGroupDetail
          group={selectedGroup}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

// Group Card Component
interface GroupCardProps {
  group: MarketplaceGroupDto;
  onLearnMore: (group: MarketplaceGroupDto) => void;
}

const GroupCard = ({ group, onLearnMore }: GroupCardProps) => {
  // Ensure availableOwnership is always a number, handle null/undefined/NaN
  const availableOwnershipValue = group.availableOwnershipPercentage ?? 0;
  const availableOwnershipNum = Number(availableOwnershipValue);
  const availableOwnership = Number.isFinite(availableOwnershipNum) && !Number.isNaN(availableOwnershipNum)
    ? availableOwnershipNum 
    : 0;
  const isAvailable = availableOwnership > 0;

  return (
    <>
      <style>{cardStyle}</style>
      <article 
        className="marketplace-card group relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover" 
        style={{ color: '#2d2520' }}>
      {/* Vehicle Photo */}
      {group.vehiclePhoto ? (
        <div className="relative h-48 w-full overflow-hidden bg-neutral-200">
          <img
            src={group.vehiclePhoto}
            alt={`${group.vehicleMake || ""} ${group.vehicleModel || ""}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {isAvailable && (
            <div className="absolute right-6 top-4 rounded-full bg-accent-green/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {(availableOwnership || 0).toFixed(0)}% available
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-48 w-full bg-neutral-200">
          <Car className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-neutral-400" />
          {isAvailable && (
            <div className="absolute right-6 top-4 rounded-full bg-accent-green/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {(availableOwnership || 0).toFixed(0)}% available
            </div>
          )}
        </div>
      )}

      <div className="p-6" style={{ color: '#2d2520' }}>
        {/* Vehicle Info */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold" style={{ color: '#2d2520', fontWeight: 600 }}>
            {group.groupName}
          </h3>
          {group.vehicleMake && group.vehicleModel && (
            <p className="mt-1 text-base" style={{ color: '#6b5a4d' }}>
              {group.vehicleMake} {group.vehicleModel}
              {group.vehicleYear && ` ${group.vehicleYear}`}
            </p>
          )}
          {group.vehiclePlateNumber && (
            <p className="mt-1 text-sm" style={{ color: '#8f7d70' }}>
              Plate: {group.vehiclePlateNumber}
            </p>
          )}
        </div>

        {/* Location */}
        {group.location && (
          <div className="mb-4 flex items-center gap-2 text-sm" style={{ color: '#8f7d70' }}>
            <MapPin className="h-4 w-4" style={{ color: '#8f7d70' }} />
            <span style={{ color: '#8f7d70' }}>{group.location}</span>
          </div>
        )}

        {/* Ownership Progress Bar */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span style={{ color: '#8f7d70' }}>Available Ownership</span>
            <span className="font-semibold" style={{ color: '#2d2520', fontWeight: 600 }}>
              {(availableOwnership || 0).toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full bg-accent-blue transition-all duration-300"
              style={{ width: `${availableOwnership}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-neutral-50 p-3">
            <div className="flex items-center gap-2 text-xs" style={{ color: '#8f7d70' }}>
              <Users className="h-4 w-4" style={{ color: '#8f7d70' }} />
              <span style={{ color: '#8f7d70' }}>Members</span>
            </div>
            <p className="mt-1 text-lg font-semibold" style={{ color: '#2d2520', fontWeight: 600 }}>
              {group.currentMembers ?? 0}/{group.totalMembers ?? 0}
            </p>
          </div>

          {group.monthlyEstimatedCost !== null &&
            group.monthlyEstimatedCost !== undefined && (
              <div className="rounded-lg bg-neutral-50 p-3">
                <div className="flex items-center gap-2 text-xs" style={{ color: '#8f7d70' }}>
                  <DollarSign className="h-4 w-4" style={{ color: '#8f7d70' }} />
                  <span style={{ color: '#8f7d70' }}>Monthly Cost</span>
                </div>
                <p className="mt-1 text-lg font-semibold" style={{ color: '#2d2520', fontWeight: 600 }}>
                  {currency.format(group.monthlyEstimatedCost)}
                </p>
              </div>
            )}
        </div>

        {/* Learn More Button */}
        <button
          onClick={() => onLearnMore(group)}
          className="w-full rounded-lg bg-accent-blue px-4 py-3 font-semibold transition hover:bg-accent-blue/90"
          style={{ color: '#ffffff', backgroundColor: '#7a9aaf' }}
        >
          Learn More
        </button>
      </div>
    </article>
    </>
  );
};

export default GroupMarketplace;
