import { Link } from 'react-router-dom'
import { Insights, Map, Message, PeopleAlt, PlaylistAdd } from '@mui/icons-material'
import { useGroups } from '@/hooks/useGroups'
import { useGroupMarketplace } from '@/hooks/useMarketplace'

const GroupHub = () => {
  const { data: groups, loading } = useGroups()
  const marketplace = useGroupMarketplace({ limit: 6 })

  const quickStats = [
    {
      label: 'Nhóm của tôi',
      value: groups?.length ?? 0,
      helper: 'Tổng số nhóm đang tham gia',
      icon: PeopleAlt,
    },
    {
      label: 'Nhóm đang mở',
      value: marketplace.filtered.filter((group) => group.activeMembers < group.totalMembers).length,
      helper: 'Sẵn sàng nhận thành viên mới',
      icon: Map,
    },
    {
      label: 'Hiệu suất trung bình',
      value:
        marketplace.filtered.length > 0
          ? `${Math.round(
              marketplace.filtered.reduce((sum, g) => sum + g.utilizationRate, 0) /
                marketplace.filtered.length,
            )}%`
          : '—',
      helper: 'Theo báo cáo analytics',
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

      <section className="grid gap-4 md:grid-cols-3">
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
                    {group.activeMembers}/{group.totalMembers} thành viên
                  </p>
                </div>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                  {group.period}
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-neutral-600">
                <div>
                  <dt>Hiệu suất</dt>
                  <dd className="text-xl font-semibold text-neutral-900">
                    {group.utilizationRate}%
                  </dd>
                </div>
                <div>
                  <dt>Lợi nhuận</dt>
                  <dd className="text-xl font-semibold text-neutral-900">
                    {group.netProfit.toLocaleString('vi-VN')}₫
                  </dd>
                </div>
                <div>
                  <dt>Số xe</dt>
                  <dd className="text-xl font-semibold text-neutral-900">{group.totalVehicles}</dd>
                </div>
                <div>
                  <dt>Tỷ lệ tham gia</dt>
                  <dd className="text-xl font-semibold text-neutral-900">
                    {group.participationRate}%
                  </dd>
                </div>
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

