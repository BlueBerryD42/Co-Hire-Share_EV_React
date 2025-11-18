import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, FilterAlt, TrendingUp, EmojiEvents } from '@mui/icons-material'
import type { UUID } from '@/models/booking'
import { useGroupMarketplace } from '@/hooks/useMarketplace'
import { marketplaceApi } from '@/services/group/marketplace'

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const AvailabilityBadge = ({ members, active }: { members: number; active: number }) => {
  const available = active < members
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        available ? 'bg-accent-green/10 text-accent-green' : 'bg-neutral-200 text-neutral-600'
      }`}
    >
      {available ? `${members - active} slot mở` : 'Đã đủ thành viên'}
    </span>
  )
}

const GroupMarketplace = () => {
  const marketplace = useGroupMarketplace({ limit: 20 })
  const [selectedGroupId, setSelectedGroupId] = useState<UUID | null>(null)
  const [insights, setInsights] = useState<string | null>(null)
  const selectedGroup = useMemo(
    () => marketplace.filtered.find((group) => group.groupId === selectedGroupId) ?? null,
    [marketplace.filtered, selectedGroupId],
  )

  const handleInspectGroup = async (groupId: UUID) => {
    setSelectedGroupId(groupId)
    try {
      const usage = await marketplaceApi.getUsageVsOwnership(groupId)
      const topMember = usage.members.sort((a, b) => b.fairnessScore - a.fairnessScore)[0]
      setInsights(
        `Điểm công bằng trung bình: ${Math.round(usage.groupMetrics.overallFairnessScore)} · Thành viên tích cực nhất: ${topMember?.memberName ?? '—'}`,
      )
    } catch (error) {
      console.error(error)
      setInsights('Không thể tải dữ liệu chi tiết.')
    }
  }

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold text-neutral-900">Tìm nhóm đồng sở hữu phù hợp</h1>
        <p className="max-w-3xl text-neutral-600">
          Lọc theo số lượng thành viên, hiệu suất sử dụng và tiềm năng tiết kiệm. Dữ liệu được lấy
          trực tiếp từ Analytics microservice nên luôn cập nhật theo thời gian thực.
        </p>
      </header>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6">
        <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
          <label className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Tìm kiếm
            </span>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-neutral-200 px-3 py-2">
              <Search fontSize="small" className="text-neutral-400" />
              <input
                type="text"
                placeholder="Tên nhóm, xe, thành phố..."
                className="w-full bg-transparent text-sm outline-none"
                value={marketplace.filters.search}
                onChange={(event) =>
                  marketplace.setFilters((prev) => ({ ...prev, search: event.target.value }))
                }
              />
            </div>
          </label>
          <label className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Thành viên (tối đa)
            </span>
            <input
              type="range"
              min={2}
              max={50}
              value={marketplace.filters.maxMembers}
              onChange={(event) =>
                marketplace.setFilters((prev) => ({
                  ...prev,
                  maxMembers: Number(event.target.value),
                }))
              }
              className="mt-4 accent-neutral-900"
            />
            <span className="text-sm text-neutral-600">
              Tối đa {marketplace.filters.maxMembers} thành viên
            </span>
          </label>
          <label className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Sắp xếp theo
            </span>
            <select
              className="mt-2 rounded-2xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700"
              value={marketplace.filters.sortBy}
              onChange={(event) =>
                marketplace.setFilters((prev) => ({
                  ...prev,
                  sortBy: event.target.value as typeof prev.sortBy,
                }))
              }
            >
              <option value="members">Số thành viên</option>
              <option value="utilization">Hiệu suất sử dụng</option>
              <option value="profit">Lợi nhuận</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          {(['Any', 'Open', 'Full'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() =>
                marketplace.setFilters((prev) => ({
                  ...prev,
                  availability: option,
                }))
              }
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 transition ${
                marketplace.filters.availability === option
                  ? 'border-neutral-900 bg-neutral-900 text-neutral-50'
                  : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              <FilterAlt fontSize="inherit" />
              {option === 'Any' ? 'Tất cả' : option === 'Open' ? 'Đang mở' : 'Đã đủ'}
            </button>
          ))}
          <span className="text-xs text-neutral-500">
            {marketplace.filtered.length} kết quả phù hợp
          </span>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {marketplace.filtered.map((group) => (
          <article
            key={group.groupId}
            className={`rounded-3xl border ${
              selectedGroupId === group.groupId ? 'border-accent-blue' : 'border-neutral-200'
            } bg-white p-6 transition hover:-translate-y-1 hover:border-accent-blue hover:shadow-lg`}
          >
            <header className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-neutral-900">{group.groupName}</p>
                <p className="text-sm text-neutral-500">
                  {group.totalVehicles} xe · {group.totalBookings} lượt đặt
                </p>
              </div>
              <AvailabilityBadge members={group.totalMembers} active={group.activeMembers} />
            </header>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-neutral-600">
              <div>
                <dt>Hiệu suất</dt>
                <dd className="text-2xl font-semibold text-neutral-900">
                  {group.utilizationRate}%
                </dd>
              </div>
              <div>
                <dt>Lợi nhuận kỳ gần nhất</dt>
                <dd className="text-2xl font-semibold text-neutral-900">
                  {currency.format(group.netProfit)}
                </dd>
              </div>
              <div>
                <dt>Thành viên</dt>
                <dd className="text-2xl font-semibold text-neutral-900">
                  {group.activeMembers}/{group.totalMembers}
                </dd>
              </div>
              <div>
                <dt>Tỷ lệ tham gia</dt>
                <dd className="text-2xl font-semibold text-neutral-900">
                  {group.participationRate}%
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-accent-blue"
                onClick={() => handleInspectGroup(group.groupId)}
              >
                Phân tích nhóm
              </button>
              <Link
                to={`/groups/${group.groupId}`}
                className="rounded-2xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-neutral-50 hover:bg-neutral-800"
              >
                Xem chi tiết
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-neutral-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-neutral-500">Insights nâng cao</p>
            <h2 className="text-2xl font-semibold text-neutral-900">
              {selectedGroup?.groupName ?? 'Chọn một nhóm để xem AI insights'}
            </h2>
          </div>
          <EmojiEvents className="text-accent-gold" />
        </div>
        <div className="mt-4 rounded-2xl border border-dashed border-neutral-200 bg-white p-4 text-neutral-600">
          {selectedGroup ? (
            <>
              <p className="text-sm">{insights ?? 'Đang tải dữ liệu fairness...'}</p>
              <p className="mt-2 text-xs text-neutral-500">
                Dữ liệu fairness được đồng bộ từ Analytics/AI service (Usage vs Ownership endpoint).
              </p>
            </>
          ) : (
            <div className="flex items-center gap-3 text-sm text-neutral-500">
              <TrendingUp fontSize="small" />
              Chọn “Phân tích nhóm” để xem gợi ý tự động về công bằng sử dụng và khuyến nghị hành động.
            </div>
          )}
        </div>
      </section>
    </section>
  )
}

export default GroupMarketplace

