import { Link } from 'react-router-dom'
import { Insights, Map, Message, PeopleAlt, PlaylistAdd } from '@mui/icons-material'
import { useGroups } from '@/hooks/useGroups'
import { useGroupMarketplace } from '@/hooks/useMarketplace'
import StatusBadge from '@/components/shared/StatusBadge'

const GroupHub = () => {
  const { data: groups, loading } = useGroups()
  const marketplace = useGroupMarketplace({ limit: 6 })

  // Filter groups by status
  const activeGroups = groups?.filter(g => g.status === 'Active') || []
  const pendingGroups = groups?.filter(g => g.status === 'PendingApproval') || []
  const rejectedGroups = groups?.filter(g => g.status === 'Rejected') || []

  const quickStats = [
    {
      label: 'Nhóm của tôi',
      value: groups?.length ?? 0,
      helper: 'Tổng số nhóm đang tham gia',
      icon: PeopleAlt,
    },
    {
      label: 'Đang hoạt động',
      value: activeGroups.length,
      helper: 'Nhóm đã được phê duyệt',
      icon: PeopleAlt,
    },
    {
      label: 'Chờ phê duyệt',
      value: pendingGroups.length,
      helper: 'Đang chờ nhân viên xem xét',
      icon: Map,
    },
    {
      label: 'Bị từ chối',
      value: rejectedGroups.length,
      helper: 'Cần gửi lại',
      icon: Insights,
    },
  ]

  const actionCards = [
    {
      title: 'Khám phá Marketplace',
      description: 'So sánh nhóm theo chi phí, hiệu suất và quy mô',
      to: '/groups/marketplace',
      accent: 'bg-accent-blue/10 text-accent-blue',
    },
    {
      title: 'Tạo nhóm mới',
      description: 'Thiết lập cấu trúc sở hữu, quy tắc và lời mời',
      to: '/groups/create',
      accent: 'bg-accent-green/10 text-accent-green',
    },
    {
      title: 'Ứng tuyển tham gia',
      description: 'Điền hồ sơ tham gia nhóm đang mở',
      to: groups && groups.length > 0 ? `/groups/${groups[0].id}/apply` : '/groups/marketplace',
      accent: 'bg-accent-gold/10 text-accent-gold',
    },
    {
      title: 'Trung tâm tin nhắn',
      description: 'Trao đổi nhanh với đồng sở hữu & admin',
      to: groups && groups.length > 0 ? `/groups/${groups[0].id}/messages` : '/groups/marketplace',
      accent: 'bg-accent-terracotta/10 text-accent-terracotta',
    },
  ]

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold text-neutral-900">Quản lý nhóm</h1>
        <p className="max-w-3xl text-neutral-600">
          Quản lý nhóm đồng sở hữu, khám phá marketplace, và tương tác với các thành viên. 
          Tất cả công cụ bạn cần để điều phối và phát triển nhóm của mình.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card flex items-center gap-4">
              <span className="rounded-2xl bg-neutral-100 p-3 text-accent-blue">
                <Icon fontSize="small" />
              </span>
              <div>
                <p className="text-sm uppercase tracking-wide text-neutral-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-neutral-900">
                  {loading && stat.label === 'Nhóm của tôi' ? '...' : stat.value}
                </p>
                <p className="text-sm text-neutral-600">{stat.helper}</p>
              </div>
            </div>
          )
        })}
      </section>

      {/* User's Groups List */}
      {groups && groups.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900">Nhóm của tôi</h2>
              <p className="text-sm text-neutral-600">
                Quản lý các nhóm bạn đang tham gia
              </p>
            </div>
          </div>
          
          {/* Active Groups */}
          {activeGroups.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-neutral-700">Đang hoạt động</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {activeGroups.map((group) => (
                  <Link
                    key={group.id}
                    to={`/groups/${group.id}`}
                    className="group rounded-3xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-1 hover:border-accent-blue hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-neutral-900 mb-2">{group.name}</h4>
                        <p className="text-sm text-neutral-600 line-clamp-2">{group.description}</p>
                      </div>
                      <StatusBadge status={group.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <span>{group.members?.length || 0} thành viên</span>
                      <span>{group.vehicles?.length || 0} xe</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Pending Groups */}
          {pendingGroups.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-neutral-700">Chờ phê duyệt</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {pendingGroups.map((group) => (
                  <Link
                    key={group.id}
                    to={`/groups/${group.id}`}
                    className="group rounded-3xl border border-warning bg-warning/5 p-6 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-neutral-900 mb-2">{group.name}</h4>
                        <p className="text-sm text-neutral-600 line-clamp-2">{group.description}</p>
                        {group.submittedAt && (
                          <p className="text-xs text-neutral-500 mt-2">
                            Đã gửi: {new Date(group.submittedAt).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={group.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <span>{group.members?.length || 0} thành viên</span>
                      <span>{group.vehicles?.length || 0} xe</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Rejected Groups */}
          {rejectedGroups.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-neutral-700">Bị từ chối</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {rejectedGroups.map((group) => (
                  <Link
                    key={group.id}
                    to={`/groups/${group.id}`}
                    className="group rounded-3xl border border-error bg-error/5 p-6 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-neutral-900 mb-2">{group.name}</h4>
                        <p className="text-sm text-neutral-600 line-clamp-2">{group.description}</p>
                        {group.rejectionReason && (
                          <p className="text-xs text-error mt-2 line-clamp-2">
                            Lý do: {group.rejectionReason}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={group.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <span>{group.members?.length || 0} thành viên</span>
                      <span>{group.vehicles?.length || 0} xe</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {groups.length === 0 && !loading && (
            <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 p-10 text-center text-neutral-500">
              Bạn chưa tham gia nhóm nào. Hãy tạo nhóm mới hoặc tham gia từ marketplace.
            </div>
          )}
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        {actionCards.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className="group flex items-start gap-4 rounded-3xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-1 hover:border-accent-blue hover:shadow-lg"
          >
            <span className={`rounded-2xl px-3 py-2 text-xs font-semibold ${card.accent}`}>
              <PlaylistAdd fontSize="small" />
            </span>
            <div>
              <p className="text-xl font-semibold text-neutral-900">{card.title}</p>
              <p className="text-sm text-neutral-600">{card.description}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900">Nhóm nổi bật</h2>
            <p className="text-sm text-neutral-600">
              Dữ liệu được tổng hợp từ Analytics service · cập nhật theo thời gian thực
            </p>
          </div>
          <Link to="/groups/marketplace" className="text-sm font-semibold text-accent-blue">
            Xem tất cả →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {marketplace.filtered.slice(0, 4).map((group) => (
            <div key={group.groupId} className="rounded-3xl border border-neutral-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-neutral-900">{group.groupName}</p>
                  <p className="text-sm text-neutral-500">
                    {group.currentMembers ?? 0}/{group.totalMembers ?? 0} thành viên
                  </p>
                </div>
                {group.availableOwnershipPercentage > 0 && (
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                    {group.availableOwnershipPercentage.toFixed(0)}% có sẵn
                  </span>
                )}
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-neutral-600">
                {group.utilizationRate !== null && group.utilizationRate !== undefined && (
                  <div>
                    <dt>Hiệu suất</dt>
                    <dd className="text-xl font-semibold text-neutral-900">
                      {group.utilizationRate.toFixed(1)}%
                    </dd>
                  </div>
                )}
                {group.monthlyEstimatedCost !== null && group.monthlyEstimatedCost !== undefined && (
                  <div>
                    <dt>Chi phí/tháng</dt>
                    <dd className="text-xl font-semibold text-neutral-900">
                      {group.monthlyEstimatedCost.toLocaleString('vi-VN')}₫
                    </dd>
                  </div>
                )}
                {group.totalVehicles !== null && group.totalVehicles !== undefined && (
                  <div>
                    <dt>Số xe</dt>
                    <dd className="text-xl font-semibold text-neutral-900">{group.totalVehicles}</dd>
                  </div>
                )}
                {group.participationRate !== null && group.participationRate !== undefined && (
                  <div>
                    <dt>Tỷ lệ tham gia</dt>
                    <dd className="text-xl font-semibold text-neutral-900">
                      {group.participationRate.toFixed(1)}%
                    </dd>
                  </div>
                )}
              </dl>
              <Link
                to={`/groups/marketplace?highlight=${group.groupId}`}
                className="mt-4 inline-flex items-center text-sm font-semibold text-accent-blue"
              >
                Chi tiết nhóm →
              </Link>
            </div>
          ))}
          {marketplace.filtered.length === 0 && (
            <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 p-10 text-center text-neutral-500">
              Chưa có dữ liệu marketplace. Hãy thử tải lại hoặc kiểm tra kết nối.
            </div>
          )}
        </div>
      </section>
    </section>
  )
}

export default GroupHub

