import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarMonth,
  DirectionsCarFilledOutlined,
  EventAvailable,
  SavingsOutlined,
  HowToVote,
} from '@mui/icons-material'
import type { GroupStatus } from '@/models/group'
import type { UUID } from '@/models/booking'
import { useGroups } from '@/hooks/useGroups'
import { useFundBalance } from '@/hooks/useFund'
import { useProposals } from '@/hooks/useProposals'
import { EmptyState } from '@/components/shared'

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const statusMap: Record<GroupStatus, { label: string; className: string }> = {
  Active: { label: 'Đang hoạt động', className: 'bg-accent-green/20 text-accent-green' },
  Inactive: { label: 'Tạm nghỉ', className: 'bg-neutral-200 text-neutral-600' },
  Dissolved: { label: 'Giải thể', className: 'bg-accent-terracotta/20 text-accent-terracotta' },
}

const OwnershipRing = ({ percentage }: { percentage: number }) => {
  const clamped = Math.max(0, Math.min(1, percentage))
  return (
    <div className="relative h-16 w-16">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(var(--accent-blue) ${clamped * 360}deg, var(--neutral-200) 0deg)`,
        }}
      />
      <div className="absolute inset-1 flex items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-800">
        {Math.round(clamped * 100)}%
      </div>
    </div>
  )
}

const quickActions = [
  {
    label: 'Shared fund',
    description: 'View balance & request withdrawal',
    icon: SavingsOutlined,
    to: (groupId: UUID) => `/groups/${groupId}/fund`,
  },
  {
    label: 'Proposals',
    description: 'Vote on decisions & track status',
    icon: HowToVote,
    to: (groupId: UUID) => `/groups/${groupId}/proposals`,
  },
  {
    label: 'Create proposal',
    description: 'Start a new rule or budget change',
    icon: EventAvailable,
    to: (groupId: UUID) => `/groups/${groupId}/proposals/create`,
  },
  {
    label: 'Booking calendar',
    description: 'Jump to shared vehicle scheduling',
    icon: CalendarMonth,
    to: (_groupId: UUID) => '/booking/calendar',
  },
]

const GroupOverview = () => {
  const { data: groups, loading, error, reload } = useGroups()
  const [selectedGroupId, setSelectedGroupId] = useState<UUID | null>(null)

  useEffect(() => {
    if (!selectedGroupId && groups && groups.length > 0) {
      setSelectedGroupId(groups[0].id)
    }
  }, [groups, selectedGroupId])

  const selectedGroup = useMemo(() => {
    if (!groups?.length) return undefined
    return groups.find((g) => g.id === selectedGroupId) ?? groups[0]
  }, [groups, selectedGroupId])

  const activeFilter = useMemo(() => ({ status: 'Active' }), [])
  const { data: fundBalance, loading: fundLoading } = useFundBalance(selectedGroup?.id)
  const { data: activeProposals } = useProposals(selectedGroup?.id, activeFilter)

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="animate-pulse rounded-3xl border border-neutral-200 bg-neutral-100 p-10 text-neutral-500">
          Đang tải thông tin nhóm...
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-auto max-w-4xl space-y-4 p-6 text-center">
        <p className="text-lg font-semibold text-accent-terracotta">
          Không thể tải dữ liệu nhóm
        </p>
        <p className="text-neutral-600">{error.message}</p>
        <button
          type="button"
          onClick={() => reload()}
          className="btn-primary inline-flex items-center justify-center"
        >
          Thử lại
        </button>
      </section>
    )
  }

  if (!groups?.length || !selectedGroup) {
    return (
      <section className="mx-auto max-w-4xl space-y-6 p-6">
        <EmptyState
          type="groupMembers"
          headline="Chưa có nhóm nào"
          description="Khi bạn tham gia một nhóm đồng sở hữu, toàn bộ dữ liệu sẽ xuất hiện ở đây."
        />
      </section>
    )
  }

  const quickStats = [
    {
      label: 'Thành viên',
      value: selectedGroup.members.length.toString(),
      helper: 'Người đồng sở hữu',
    },
    {
      label: 'Xe được chia sẻ',
      value: selectedGroup.vehicles.length.toString(),
      helper: selectedGroup.vehicles.map((v) => v.model).slice(0, 2).join(', ') || 'Chưa có xe',
    },
    {
      label: 'Quỹ khả dụng',
      value: fundLoading
        ? 'Đang tải...'
        : fundBalance
          ? currency.format(fundBalance.availableBalance)
          : 'Chưa khởi tạo',
      helper: 'Cập nhật theo thời gian thực',
    },
    {
      label: 'Đề xuất đang mở',
      value: activeProposals ? activeProposals.length.toString() : '0',
      helper: 'Cần bạn bỏ phiếu',
    },
  ]

  const recentActivity = selectedGroup.members.slice(0, 4).map((member) => ({
    id: member.id,
    title: `${member.userFirstName} ${member.userLastName}`,
    body:
      member.roleInGroup === 'Admin'
        ? 'vừa cập nhật quy tắc nhóm'
        : 'đã xác nhận lịch chia sẻ',
    date: new Date(member.joinedAt).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'short',
    }),
  }))

  return (
    <section className="mx-auto max-w-6xl space-y-8 p-6">
      <header className="space-y-4 rounded-3xl border border-neutral-200 bg-neutral-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-neutral-500">Screen 24 · My Group</p>
            <h1 className="text-4xl font-semibold text-neutral-900">Không gian nhóm của bạn</h1>
            <p className="max-w-2xl text-neutral-600">
              Toàn bộ thông tin chia sẻ xe, thành viên và nguồn quỹ được gom về một nơi duy nhất để
              bạn nắm bắt nhanh chóng.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600">
            {groups.length} nhóm ·{' '}
            <span className="font-semibold text-neutral-900">chọn để xem chi tiết</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {groups.map((group) => {
            const status = statusMap[group.status]
            const isActive = group.id === selectedGroup.id
            return (
              <button
                type="button"
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                  isActive
                    ? 'border-accent-blue bg-white text-neutral-900 shadow-sm'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300'
                }`}
              >
                <span className="text-base font-semibold">{group.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                >
                  {status.label}
                </span>
              </button>
            )
          })}
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <div key={stat.label} className="card space-y-2">
            <p className="text-xs uppercase tracking-wide text-neutral-500">{stat.label}</p>
            <p className="text-2xl font-semibold text-neutral-900">{stat.value}</p>
            <p className="text-sm text-neutral-600">{stat.helper}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900">Thành viên nhóm</h2>
              <p className="text-sm text-neutral-600">Tỷ lệ sở hữu và vai trò rõ ràng</p>
            </div>
            {selectedGroup.members.length > 0 ? (
              <Link
                to={`/groups/${selectedGroup.id}/members/${selectedGroup.members[0].id}`}
                className="text-sm font-semibold text-accent-blue"
              >
                Xem chi tiết
              </Link>
            ) : (
              <span className="text-sm text-neutral-400">Chưa có thành viên</span>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {selectedGroup.members.map((member) => (
              <div key={member.id} className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
                <OwnershipRing percentage={Number(member.sharePercentage)} />
                <div>
                  <p className="text-lg font-semibold text-neutral-900">
                    {member.userFirstName} {member.userLastName}
                  </p>
                  <p className="text-sm text-neutral-500">{member.userEmail}</p>
                  <span className="mt-1 inline-flex rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-semibold text-neutral-700">
                    {member.roleInGroup === 'Admin' ? 'Admin nhóm' : 'Thành viên'}
                  </span>
                </div>
              </div>
            ))}
            {selectedGroup.members.length === 0 && (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center text-neutral-600">
                Nhóm chưa có thành viên nào.
              </div>
            )}
          </div>
        </div>
        <div className="card space-y-4">
          <h2 className="text-2xl font-semibold text-neutral-900">Hoạt động gần đây</h2>
          <ul className="space-y-3">
            {recentActivity.map((item) => (
              <li key={item.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
                <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                <p className="text-sm text-neutral-600">{item.body}</p>
                <p className="text-xs text-neutral-500">{item.date}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {quickActions.map((action) => {
          if (!selectedGroup.id) return null
          const Icon = action.icon
          return (
            <Link
              key={action.label}
              to={action.to(selectedGroup.id)}
              className="group flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-1 hover:border-accent-blue hover:shadow-lg"
            >
              <span className="rounded-2xl bg-neutral-100 p-3 text-accent-blue">
                <Icon fontSize="small" />
              </span>
              <div>
                <p className="text-lg font-semibold text-neutral-900">{action.label}</p>
                <p className="text-sm text-neutral-600">{action.description}</p>
              </div>
            </Link>
          )
        })}
      </section>

      <section className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900">Xe trong nhóm</h2>
            <p className="text-sm text-neutral-600">Theo dõi trạng thái & biển số</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700">
            <DirectionsCarFilledOutlined fontSize="small" />
            {selectedGroup.vehicles.length} xe
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {selectedGroup.vehicles.map((vehicle) => (
            <div key={vehicle.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
              <p className="text-lg font-semibold text-neutral-900">
                {vehicle.model} · {vehicle.year}
              </p>
              <p className="text-sm text-neutral-600">Biển số: {vehicle.plateNumber}</p>
              <p className="text-sm text-neutral-600">Trạng thái: {vehicle.status}</p>
            </div>
          ))}
          {selectedGroup.vehicles.length === 0 && (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center text-neutral-600">
              Nhóm chưa liên kết xe nào.
            </div>
          )}
        </div>
      </section>
    </section>
  )
}

export default GroupOverview

