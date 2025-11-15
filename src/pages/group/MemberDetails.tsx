import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmailOutlined, PhoneIphone, ShieldOutlined, WarningAmber } from '@mui/icons-material'
import type { UUID } from '@/models/booking'
import { useGroup } from '@/hooks/useGroups'

type TabKey = 'overview' | 'bookings' | 'payments' | 'activity'

const tabs: { key: TabKey; label: string; helper: string }[] = [
  { key: 'overview', label: 'Tổng quan', helper: 'Thông tin liên hệ & sở hữu' },
  { key: 'bookings', label: 'Lịch sử sử dụng', helper: 'Giờ đã đặt, lịch sắp tới' },
  { key: 'payments', label: 'Đóng góp quỹ', helper: 'Trạng thái thanh toán' },
  { key: 'activity', label: 'Hoạt động', helper: 'Các sự kiện gần đây' },
]

const MemberDetails = () => {
  const { groupId, memberId } = useParams<{ groupId: UUID; memberId: UUID }>()
  const { data: group, loading, error, reload } = useGroup(groupId)
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  const member = useMemo(() => {
    if (!group) return undefined
    return group.members.find((m) => m.id === memberId || m.userId === memberId)
  }, [group, memberId])

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl space-y-4 p-6">
        <div className="animate-pulse rounded-3xl border border-neutral-200 bg-neutral-100 p-10 text-neutral-500">
          Đang tải chi tiết thành viên...
        </div>
      </section>
    )
  }

  if (error || !group || !member) {
    return (
      <section className="mx-auto max-w-4xl space-y-4 p-6 text-center">
        <p className="text-lg font-semibold text-accent-terracotta">Không tìm thấy thành viên</p>
        <p className="text-neutral-600">
          {error?.message ?? 'Thông tin thành viên không khả dụng hoặc đã bị xóa.'}
        </p>
        <button type="button" onClick={() => reload()} className="btn-primary">
          Thử lại
        </button>
      </section>
    )
  }

  const ownershipPercent = Math.round(Number(member.sharePercentage) * 100)
  const fairnessScore = Math.max(60, Math.min(95, ownershipPercent + 10))

  const bookingHighlights = [
    { label: 'Giờ đã sử dụng tháng này', value: '18h', helper: 'Giới hạn đề xuất 24h' },
    { label: 'Lần dùng gần nhất', value: '4 Thg 12 · VinFast VF8', helper: 'Kết thúc lúc 21:00' },
    { label: 'Lịch sắp tới', value: '10 Thg 12 · 09:00-12:00', helper: 'Đang chờ phê duyệt' },
  ]

  const paymentHighlights = [
    { label: 'Đóng góp quỹ', value: `${ownershipPercent}%`, helper: 'Theo tỷ lệ sở hữu' },
    { label: 'Tình trạng thanh toán', value: 'Đúng hạn', helper: '3 kỳ liên tiếp' },
    { label: 'Chi phí chưa thanh toán', value: '0đ', helper: 'Tất cả đã hoàn tất' },
  ]

  const activityFeed = [
    { title: 'Tạo đề xuất sửa chữa nội thất', date: '02 Thg 12', status: 'Đang bỏ phiếu' },
    { title: 'Kết thúc lịch dùng VinFast VF8', date: '30 Thg 11', status: 'Hoàn tất' },
    { title: 'Nạp quỹ chung 2.000.000đ', date: '28 Thg 11', status: 'Ghi nhận' },
  ]

  return (
    <section className="mx-auto max-w-6xl space-y-8 p-6">
      <header className="space-y-6 rounded-3xl border border-neutral-200 bg-neutral-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-neutral-500">
              Screen 25 · Member details
            </p>
            <h1 className="text-4xl font-semibold text-neutral-900">
              {member.userFirstName} {member.userLastName}
            </h1>
            <p className="text-neutral-600">
              Theo dõi mức độ đóng góp, lịch sử sử dụng xe và quyền hạn của thành viên trong nhóm{' '}
              <span className="font-semibold">{group.name}</span>.
            </p>
          </div>
          <Link to={`/groups/${group.id}`} className="text-sm font-semibold text-accent-blue">
            ← Quay về nhóm
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200 text-xl font-semibold text-neutral-800">
            {member.userFirstName.charAt(0)}
            {member.userLastName.charAt(0)}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700">
                {member.roleInGroup === 'Admin' ? 'Admin' : 'Thành viên'}
              </span>
              <span className="rounded-full bg-neutral-50 px-3 py-1 text-xs text-neutral-500">
                Tham gia ngày {new Date(member.joinedAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
              <span className="inline-flex items-center gap-2">
                <EmailOutlined fontSize="small" />
                {member.userEmail}
              </span>
              <span className="inline-flex items-center gap-2">
                <PhoneIphone fontSize="small" />
                (đang cập nhật)
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-500">Tỷ lệ sở hữu</p>
            <p className="text-4xl font-semibold text-neutral-900">{ownershipPercent}%</p>
            <p className="text-xs text-neutral-500">của tổng tài sản nhóm</p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-neutral-500">Điểm công bằng (AI)</p>
          <p className="text-3xl font-semibold text-neutral-900">{fairnessScore}/100</p>
          <p className="text-sm text-neutral-600">
            Đạt chuẩn sử dụng công bằng so với tỉ lệ sở hữu.
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-neutral-500">Vi phạm gần đây</p>
          <p className="text-3xl font-semibold text-neutral-900">0</p>
          <p className="text-sm text-neutral-600">Không có cảnh báo nào trong 90 ngày.</p>
        </div>
        <div className="card flex items-center gap-3">
          <ShieldOutlined className="text-accent-blue" />
          <div>
            <p className="text-lg font-semibold text-neutral-900">Quyền hạn</p>
            <p className="text-sm text-neutral-600">
              {member.roleInGroup === 'Admin'
                ? 'Quản lý đề xuất, duyệt lịch, điều chỉnh quỹ'
                : 'Đặt lịch, tham gia bỏ phiếu & chia sẻ chi phí'}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab
            return (
              <button
                type="button"
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-neutral-900 text-neutral-50 shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <p>{tab.label}</p>
                <p className="text-xs font-normal">{tab.helper}</p>
              </button>
            )
          })}
        </div>
      </section>

      {activeTab === 'overview' && (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="card space-y-2">
            <p className="text-sm text-neutral-500">Liên hệ</p>
            <p className="text-lg font-semibold text-neutral-900">{member.userEmail}</p>
            <p className="text-sm text-neutral-600">
              Đang chờ thành viên cập nhật số điện thoại và địa chỉ.
            </p>
          </div>
          <div className="card space-y-2">
            <p className="text-sm text-neutral-500">Trách nhiệm</p>
            <p className="text-lg font-semibold text-neutral-900">
              {member.roleInGroup === 'Admin'
                ? 'Phê duyệt lịch & đề xuất'
                : 'Tuân thủ lịch dùng và chia sẻ chi phí'}
            </p>
            <p className="text-sm text-neutral-600">
              Quyền hạn được đồng bộ với cổng quản trị của nhóm.
            </p>
          </div>
        </section>
      )}

      {activeTab === 'bookings' && (
        <section className="card space-y-4">
          <h2 className="text-2xl font-semibold text-neutral-900">Lịch sử sử dụng</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {bookingHighlights.map((item) => (
              <div key={item.label} className="rounded-2xl border border-neutral-200 bg-white p-4">
                <p className="text-sm text-neutral-500">{item.label}</p>
                <p className="text-2xl font-semibold text-neutral-900">{item.value}</p>
                <p className="text-xs text-neutral-500">{item.helper}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
            Thống kê chi tiết sẽ được đồng bộ từ dịch vụ Booking sau khi kết nối tài khoản thực tế.
          </div>
        </section>
      )}

      {activeTab === 'payments' && (
        <section className="card space-y-4">
          <h2 className="text-2xl font-semibold text-neutral-900">Đóng góp quỹ & thanh toán</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {paymentHighlights.map((item) => (
              <div key={item.label} className="rounded-2xl border border-neutral-200 bg-white p-4">
                <p className="text-sm text-neutral-500">{item.label}</p>
                <p className="text-2xl font-semibold text-neutral-900">{item.value}</p>
                <p className="text-xs text-neutral-500">{item.helper}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
            <WarningAmber className="text-accent-gold" fontSize="small" />
            Để xem chính xác phần đóng góp, hãy hoàn tất kết nối với dịch vụ Financial/Payment.
          </div>
        </section>
      )}

      {activeTab === 'activity' && (
        <section className="card space-y-4">
          <h2 className="text-2xl font-semibold text-neutral-900">Hoạt động gần đây</h2>
          <ul className="space-y-3">
            {activityFeed.map((item) => (
              <li key={item.title} className="rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-neutral-900">{item.title}</p>
                  <span className="text-sm text-neutral-500">{item.date}</span>
                </div>
                <p className="text-sm text-neutral-600">{item.status}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  )
}

export default MemberDetails

