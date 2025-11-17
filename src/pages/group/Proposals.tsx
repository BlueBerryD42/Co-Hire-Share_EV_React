import { useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Alert, Button, Chip } from '@mui/material'
import type { UUID } from '@/models/booking'
import type { ProposalListDto, ProposalStatus } from '@/models/proposal'
import { useGroup } from '@/hooks/useGroups'
import { useProposals } from '@/hooks/useProposals'
import { EmptyState } from '@/components/shared'

type TabKey = 'active' | 'past' | 'mine'

const tabs: { key: TabKey; label: string; helper: string }[] = [
  { key: 'active', label: 'Đang bỏ phiếu', helper: 'Cần hành động' },
  { key: 'past', label: 'Đã kết thúc', helper: 'Thông tin lưu trữ' },
  { key: 'mine', label: 'Tôi tạo', helper: 'Theo dõi đề xuất của bạn' },
]

const statusStyles: Record<ProposalStatus, { label: string; classes: string }> = {
  Active: { label: 'Đang bỏ phiếu', classes: 'bg-accent-gold/20 text-accent-gold' },
  Passed: { label: 'Thông qua', classes: 'bg-accent-green/20 text-accent-green' },
  Rejected: { label: 'Bị từ chối', classes: 'bg-accent-terracotta/20 text-accent-terracotta' },
  Expired: { label: 'Hết hạn', classes: 'bg-neutral-200 text-neutral-600' },
  Cancelled: { label: 'Huỷ', classes: 'bg-neutral-200 text-neutral-600' },
}

const getFilteredProposals = (items: ProposalListDto[] | null | undefined, tab: TabKey) => {
  if (!items) return []
  switch (tab) {
    case 'active':
      return items.filter((proposal) => proposal.status === 'Active')
    case 'past':
      return items.filter((proposal) => proposal.status !== 'Active')
    case 'mine':
      // Chưa có dữ liệu xác thực người dùng, tạm thời trả toàn bộ danh sách.
      return items
    default:
      return items
  }
}

const Proposals = () => {
  const navigate = useNavigate()
  const { groupId } = useParams<{ groupId: UUID }>()
  const { data: group } = useGroup(groupId)
  const { data: proposals, loading, error, reload } = useProposals(groupId)
  const [activeTab, setActiveTab] = useState<TabKey>('active')

  const filtered = useMemo(() => getFilteredProposals(proposals, activeTab), [proposals, activeTab])

  return (
    <section className="mx-auto max-w-6xl space-y-8 p-6">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-wide text-neutral-500">Screen 27 · Proposals</p>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold text-neutral-900">
              Đề xuất & bỏ phiếu · {group?.name ?? 'Đang tải'}
            </h1>
            <p className="text-neutral-600">
              Đảm bảo mọi quyết định về chi phí, bảo trì và quy tắc đều minh bạch. Theo dõi tiến độ
              và tỷ lệ đồng thuận ngay tại đây.
            </p>
          </div>
          <Link
            to={`/groups/${groupId}/proposals/create`}
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-neutral-50 hover:bg-neutral-800"
          >
            + Tạo đề xuất mới
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-2xl border px-4 py-2 text-left transition ${
                isActive
                  ? 'border-accent-blue bg-white text-neutral-900 shadow-sm'
                  : 'border-neutral-200 bg-neutral-100 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              <p className="text-sm font-semibold">{tab.label}</p>
              <p className="text-xs">{tab.helper}</p>
            </button>
          )
        })}
      </div>

      {error && (
        <Alert severity="error" action={<Button onClick={() => reload()}>Thử lại</Button>}>
          Không thể tải danh sách đề xuất.
        </Alert>
      )}

      {loading && (
        <div className="rounded-3xl border border-neutral-200 bg-neutral-100 p-10 text-center text-neutral-500">
          Đang tải danh sách đề xuất...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState
          type="proposals"
          actionLabel="Tạo đề xuất mới"
          onAction={() => navigate(`/groups/${groupId}/proposals/create`)}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((proposal) => {
          const status = statusStyles[proposal.status]
          const progress = Math.min(100, Math.max(0, proposal.votingProgress))
          return (
            <Link
              key={proposal.id}
              to={`/groups/${groupId}/proposals/${proposal.id}`}
              className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-1 hover:border-accent-blue hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-500">
                  Kết thúc {new Date(proposal.votingEndDate).toLocaleDateString('vi-VN')}
                </p>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.classes}`}>
                  {status.label}
                </span>
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900">{proposal.title}</h3>
              <p className="text-sm text-neutral-600 line-clamp-3">{proposal.description}</p>
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Bỏ phiếu</span>
                  <span>{progress}%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-neutral-200">
                  <div
                    className="h-full rounded-full bg-accent-blue transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                <Chip size="small" label={`Loại: ${proposal.type}`} />
                <Chip size="small" label={`Tổng phiếu: ${proposal.totalVotes}`} />
                <Chip size="small" label={`Yes: ${proposal.yesVotes}`} />
                <Chip size="small" label={`No: ${proposal.noVotes}`} />
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default Proposals
