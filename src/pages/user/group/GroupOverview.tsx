import { useMemo, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CalendarMonth,
  DirectionsCarFilledOutlined,
  EventAvailable,
  SavingsOutlined,
  HowToVote,
  Description,
  Assignment,
  HowToReg,
} from '@mui/icons-material'
import { Alert, Button, Snackbar, Tooltip } from '@mui/material'
import { AlertCircle, RefreshCw } from 'lucide-react'
import type { GroupStatus } from '@/models/group'
import type { UUID } from '@/models/booking'
import { useGroups, useGroup } from '@/hooks/useGroups'
import { useFundBalance } from '@/hooks/useFund'
import { useProposals } from '@/hooks/useProposals'
import { EmptyState } from '@/components/shared'
import StatusBadge from '@/components/shared/StatusBadge'
import { documentApi } from '@/services/group/documents'
import { groupApi } from '@/services/group/groups'
import { DocumentType, SignatureStatus, type DocumentListItemResponse } from '@/models/document'

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const statusMap: Record<GroupStatus, { label: string; className: string }> = {
  Active: {
    label: "Đang hoạt động",
    className: "bg-accent-green/20 text-accent-green",
  },
  Inactive: { label: "Tạm nghỉ", className: "bg-neutral-200 text-neutral-600" },
  Dissolved: {
    label: "Giải thể",
    className: "bg-accent-terracotta/20 text-accent-terracotta",
  },
  PendingApproval: {
    label: "Chờ phê duyệt",
    className: "bg-accent-gold/20 text-accent-gold",
  },
  Rejected: {
    label: "Bị từ chối",
    className: "bg-accent-terracotta/20 text-accent-terracotta",
  },
};

const OwnershipRing = ({ percentage }: { percentage: number }) => {
  const clamped = Math.max(0, Math.min(1, percentage));
  return (
    <div className="relative h-16 w-16">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(var(--accent-blue) ${
            clamped * 360
          }deg, var(--neutral-200) 0deg)`,
        }}
      />
      <div className="absolute inset-1 flex items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-800">
        {Math.round(clamped * 100)}%
      </div>
    </div>
  );
};

type QuickAction = {
  label: string;
  description: string;
  icon: React.ComponentType;
  to: ((groupId: UUID) => string) | (() => string) | null;
  disabled?: (group: any) => boolean;
};

const quickActions: QuickAction[] = [
  {
    label: "Shared fund",
    description: "View balance & request withdrawal",
    icon: SavingsOutlined,
    to: (groupId: UUID) => `/groups/${groupId}/fund`,
    disabled: (group) => group.status === 'PendingApproval' || group.status === 'Rejected',
  },
  {
    label: "Proposals",
    description: "Vote on decisions & track status",
    icon: HowToVote,
    to: (groupId: UUID) => `/groups/${groupId}/proposals`,
    disabled: (group) => group.status === 'PendingApproval' || group.status === 'Rejected',
  },
  {
    label: "Create proposal",
    description: "Start a new rule or budget change",
    icon: EventAvailable,
    to: (groupId: UUID) => `/groups/${groupId}/proposals/create`,
    disabled: (group) => group.status === 'PendingApproval' || group.status === 'Rejected',
  },
  {
    label: "E-Contract",
    description: "View, manage & sign documents",
    icon: Description,
    to: (groupId: UUID) => `/groups/${groupId}/documents`,
    disabled: (group) => group.status === 'PendingApproval' || group.status === 'Rejected',
  },
  {
    label: "Booking calendar",
    description: "Jump to shared vehicle scheduling",
    icon: CalendarMonth,
    to: () => "/booking/calendar",
    disabled: (group) => group.status === 'PendingApproval' || group.status === 'Rejected',
  },
];

const GroupOverview = () => {
  const { groupId } = useParams<{ groupId: UUID }>()
  // Fetch the specific group directly to ensure fresh data
  const { data: selectedGroupData, loading: groupLoading, error: groupError, reload: reloadGroup } = useGroup(groupId);
  // Also fetch all groups for navigation/context
  const { data: groups, reload: reloadGroups } = useGroups();
  const [pendingDocuments, setPendingDocuments] = useState<DocumentListItemResponse[]>([])
  const [recentContracts, setRecentContracts] = useState<DocumentListItemResponse[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [resubmitting, setResubmitting] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  // Use the directly fetched group data, or fallback to finding it in the groups list
  // All hooks must be called unconditionally, so useMemo is called at top level
  const fallbackGroup = useMemo(() => {
    if (!groups?.length || !groupId) return undefined;
    return groups.find((g) => g.id === groupId);
  }, [groups, groupId]);
  
  const selectedGroup = selectedGroupData || fallbackGroup
  const loading = groupLoading
  const error = groupError

  const isPendingOrRejected = selectedGroup?.status === 'PendingApproval' || selectedGroup?.status === 'Rejected'

  const handleResubmit = async () => {
    if (!selectedGroup?.id) return
    
    try {
      setResubmitting(true)
      await groupApi.resubmitGroup(selectedGroup.id)
      setSnackbar({
        open: true,
        message: 'Đã gửi lại yêu cầu phê duyệt thành công',
        severity: 'success',
      })
      // Refresh group data
      await reloadGroup()
      await reloadGroups()
    } catch (error: any) {
      console.error('Error resubmitting group:', error)
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể gửi lại yêu cầu',
        severity: 'error',
      })
    } finally {
      setResubmitting(false)
    }
  }

  const activeFilter = useMemo(() => ({ status: "Active" }), []);
  const { data: fundBalance, loading: fundLoading } = useFundBalance(
    selectedGroup?.id
  );
  const { data: activeProposals } = useProposals(
    selectedGroup?.id,
    activeFilter
  );

  // Reload group when groupId changes
  useEffect(() => {
    if (groupId) {
      reloadGroup()
    }
  }, [groupId, reloadGroup])

  // Fetch pending signatures and recent contracts
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!selectedGroup?.id) return

      setLoadingDocuments(true)
      try {
        // Get pending signatures (documents waiting for user's signature)
        const pendingResponse = await documentApi.getGroupDocuments(selectedGroup.id as UUID, {
          page: 1,
          pageSize: 5,
          signatureStatus: SignatureStatus.SentForSigning,
        })
        setPendingDocuments(pendingResponse?.items || [])

        // Get recent contracts (Ownership Agreements)
        const contractsResponse = await documentApi.getGroupDocuments(selectedGroup.id as UUID, {
          page: 1,
          pageSize: 3,
          documentType: DocumentType.OwnershipAgreement,
          sortBy: 'CreatedAt',
          sortDescending: true,
        })
        setRecentContracts(contractsResponse?.items || [])
      } catch (err) {
        console.error(`Error fetching documents for group ${selectedGroup.id}:`, err)
        setPendingDocuments([])
        setRecentContracts([])
      } finally {
        setLoadingDocuments(false)
      }
    }

    fetchDocuments()
  }, [selectedGroup?.id])

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="animate-pulse rounded-3xl border border-neutral-200 bg-neutral-100 p-10 text-neutral-500">
          Đang tải thông tin nhóm...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4 text-center">
        <p className="text-lg font-semibold text-accent-terracotta">
          Không thể tải dữ liệu nhóm
        </p>
        <p className="text-neutral-600">{error.message}</p>
        <button
          type="button"
          onClick={() => reloadGroup()}
          className="btn-primary inline-flex items-center justify-center"
        >
          Thử lại
        </button>
      </section>
    );
  }

  if (!groups?.length || !selectedGroup) {
    return (
      <section className="space-y-6">
        <EmptyState
          type="groupMembers"
          headline="Chưa có nhóm nào"
          description="Khi bạn tham gia một nhóm đồng sở hữu, toàn bộ dữ liệu sẽ xuất hiện ở đây."
        />
      </section>
    );
  }

  const quickStats = [
    {
      label: "Thành viên",
      value: selectedGroup.members.length.toString(),
      helper: "Người đồng sở hữu",
    },
    {
      label: "Xe được chia sẻ",
      value: selectedGroup.vehicles.length.toString(),
      helper:
        selectedGroup.vehicles
          .map((v) => v.model)
          .slice(0, 2)
          .join(", ") || "Chưa có xe",
    },
    {
      label: "Quỹ khả dụng",
      value: fundLoading
        ? "Đang tải..."
        : fundBalance
        ? currency.format(fundBalance.availableBalance)
        : "Chưa khởi tạo",
      helper: "Cập nhật theo thời gian thực",
    },
    {
      label: "Đề xuất đang mở",
      value: activeProposals ? activeProposals.length.toString() : "0",
      helper: "Cần bạn bỏ phiếu",
    },
  ];

  const recentActivity = selectedGroup.members.slice(0, 4).map((member) => ({
    id: member.id,
    title: `${member.userFirstName} ${member.userLastName}`,
    body:
      member.roleInGroup === "Admin"
        ? "vừa cập nhật quy tắc nhóm"
        : "đã xác nhận lịch chia sẻ",
    date: new Date(member.joinedAt).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
    }),
  }));

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-semibold text-neutral-900">
                {selectedGroup?.name || 'Tổng quan nhóm'}
              </h1>
              {selectedGroup && <StatusBadge status={selectedGroup.status} size="medium" />}
            </div>
            <p className="max-w-2xl text-neutral-600">
              {selectedGroup?.description || 'Quản lý thành viên, quỹ chung, và đề xuất của nhóm.'}
            </p>
          </div>
          {selectedGroup?.status === 'Rejected' && (
            <Button
              variant="outlined"
              startIcon={<RefreshCw />}
              onClick={handleResubmit}
              disabled={resubmitting}
              sx={{ borderColor: '#7a9b76', color: '#7a9b76' }}
            >
              {resubmitting ? 'Đang gửi...' : 'Gửi lại phê duyệt'}
            </Button>
          )}
        </div>

        {/* Rejection Reason Alert */}
        {selectedGroup?.status === 'Rejected' && selectedGroup.rejectionReason && (
          <Alert 
            severity="error" 
            icon={<AlertCircle />}
            action={
              <Button
                size="small"
                onClick={handleResubmit}
                disabled={resubmitting}
                startIcon={<RefreshCw />}
              >
                Gửi lại
              </Button>
            }
          >
            <div>
              <strong>Nhóm đã bị từ chối:</strong>
              <p className="mt-1">{selectedGroup.rejectionReason}</p>
              {selectedGroup.reviewedAt && (
                <p className="text-xs mt-1 opacity-75">
                  Ngày xem xét: {new Date(selectedGroup.reviewedAt).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>
          </Alert>
        )}

        {/* Pending Approval Alert */}
        {selectedGroup?.status === 'PendingApproval' && (
          <Alert severity="warning">
            Nhóm của bạn đang chờ được phê duyệt bởi nhân viên. Bạn sẽ nhận được thông báo khi có kết quả.
            {selectedGroup.submittedAt && (
              <p className="text-xs mt-1 opacity-75">
                Đã gửi: {new Date(selectedGroup.submittedAt).toLocaleDateString('vi-VN')}
              </p>
            )}
          </Alert>
        )}
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <div key={stat.label} className="card space-y-2">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              {stat.label}
            </p>
            <p className="text-2xl font-semibold text-neutral-900">
              {stat.value}
            </p>
            <p className="text-sm text-neutral-600">{stat.helper}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900">
                Thành viên nhóm
              </h2>
              <p className="text-sm text-neutral-600">
                Tỷ lệ sở hữu và vai trò rõ ràng
              </p>
            </div>
            {selectedGroup.members.length > 0 ? (
              <Link
                to={`/groups/${selectedGroup.id}/members/${selectedGroup.members[0].id}`}
                className="text-sm font-semibold text-accent-blue"
              >
                Xem chi tiết
              </Link>
            ) : (
              <span className="text-sm text-neutral-400">
                Chưa có thành viên
              </span>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {selectedGroup.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4"
              >
                <OwnershipRing percentage={Number(member.sharePercentage)} />
                <div>
                  <p className="text-lg font-semibold text-neutral-900">
                    {member.userFirstName} {member.userLastName}
                  </p>
                  <p className="text-sm text-neutral-500">{member.userEmail}</p>
                  <span className="mt-1 inline-flex rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-semibold text-neutral-700">
                    {member.roleInGroup === "Admin"
                      ? "Admin nhóm"
                      : "Thành viên"}
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
          <h2 className="text-2xl font-semibold text-neutral-900">
            Hoạt động gần đây
          </h2>
          <ul className="space-y-3">
            {recentActivity.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4"
              >
                <p className="text-sm font-semibold text-neutral-900">
                  {item.title}
                </p>
                <p className="text-sm text-neutral-600">{item.body}</p>
                <p className="text-xs text-neutral-500">{item.date}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {quickActions.map((action) => {
          if (!selectedGroup.id) return null;
          const Icon = action.icon;
          
          // Handle regular link actions
          if (!action.to) return null;
          
          const linkTo = typeof action.to === 'function' 
            ? (action.to as (groupId: UUID) => string).length > 0 
              ? (action.to as (groupId: UUID) => string)(selectedGroup.id) 
              : (action.to as () => string)()
            : action.to;
          
          const isDisabled = action.disabled ? action.disabled(selectedGroup) : false;
          
          const actionContent = (
            <div className={`group flex items-center gap-4 rounded-2xl border p-5 transition ${
              isDisabled 
                ? 'border-neutral-200 bg-neutral-50 cursor-not-allowed opacity-60' 
                : 'border-neutral-200 bg-white hover:-translate-y-1 hover:border-accent-blue hover:shadow-lg'
            }`}>
              <span className={`rounded-2xl p-3 ${
                isDisabled ? 'bg-neutral-200 text-neutral-400' : 'bg-neutral-100 text-accent-blue'
              }`}>
                <Icon />
              </span>
              <div>
                <p className={`text-lg font-semibold ${
                  isDisabled ? 'text-neutral-400' : 'text-neutral-900'
                }`}>
                  {action.label}
                </p>
                <p className={`text-sm ${
                  isDisabled ? 'text-neutral-400' : 'text-neutral-600'
                }`}>
                  {isDisabled ? 'Không khả dụng khi nhóm đang chờ phê duyệt hoặc bị từ chối' : action.description}
                </p>
              </div>
            </div>
          );

          if (isDisabled) {
            return (
              <Tooltip key={action.label} title="Nhóm đang chờ phê duyệt hoặc bị từ chối">
                <div>{actionContent}</div>
              </Tooltip>
            );
          }

          return (
            <Link
              key={action.label}
              to={linkTo}
            >
              {actionContent}
            </Link>
          );
        })}
      </section>

      {/* E-Contract & Signature Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900">E-Contract & Chữ ký số</h2>
            <p className="text-sm text-neutral-600">
              Quản lý hợp đồng điện tử, theo dõi trạng thái chữ ký và tài liệu nhóm
            </p>
          </div>
          {selectedGroup?.id && !isPendingOrRejected && (
            <Link
              to={`/groups/${selectedGroup.id}/documents`}
              className="text-sm font-semibold text-accent-blue"
            >
              Xem tất cả →
            </Link>
          )}
          {isPendingOrRejected && (
            <span className="text-sm text-neutral-400 cursor-not-allowed">
              Xem tất cả →
            </span>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Pending Signatures Card */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-2xl bg-accent-gold/10 p-2 text-accent-gold">
                <HowToReg fontSize="small" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Chờ ký</h3>
                <p className="text-sm text-neutral-600">
                  {loadingDocuments
                    ? 'Đang tải...'
                    : pendingDocuments.length > 0
                      ? `${pendingDocuments.length} tài liệu đang chờ bạn ký`
                      : 'Không có tài liệu nào chờ ký'}
                </p>
              </div>
            </div>

            {loadingDocuments ? (
              <div className="text-center py-4 text-neutral-500">Đang tải...</div>
            ) : pendingDocuments.length > 0 ? (
              <div className="space-y-2">
                {pendingDocuments.slice(0, 3).map((doc) => (
                  isPendingOrRejected ? (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-3 cursor-not-allowed opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{doc.fileName.split('.').pop()?.toLowerCase() === 'pdf' ? '📄' : '📝'}</span>
                        <div>
                          <p className="text-sm font-medium text-neutral-400 line-clamp-1">
                            {doc.fileName}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-400">
                        Ký ngay
                      </span>
                    </div>
                  ) : (
                    <Link
                      key={doc.id}
                      to={`/groups/${selectedGroup?.id}/documents/${doc.id}`}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-3 transition hover:border-accent-gold hover:bg-accent-gold/5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{doc.fileName.split('.').pop()?.toLowerCase() === 'pdf' ? '📄' : '📝'}</span>
                        <div>
                          <p className="text-sm font-medium text-neutral-900 line-clamp-1">
                            {doc.fileName}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-accent-gold/20 px-2 py-1 text-xs font-semibold text-accent-gold">
                        Ký ngay
                      </span>
                    </Link>
                  )
                ))}
                {pendingDocuments.length > 3 && !isPendingOrRejected && (
                  <Link
                    to={`/groups/${selectedGroup?.id}/documents?status=pending`}
                    className="block text-center text-sm font-semibold text-accent-blue"
                  >
                    Xem thêm {pendingDocuments.length - 3} tài liệu →
                  </Link>
                )}
                {pendingDocuments.length > 3 && isPendingOrRejected && (
                  <div className="block text-center text-sm text-neutral-400 cursor-not-allowed">
                    Xem thêm {pendingDocuments.length - 3} tài liệu →
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center text-neutral-500">
                Tất cả tài liệu đã được ký
              </div>
            )}
          </div>

          {/* Recent Contracts Card */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-2xl bg-accent-blue/10 p-2 text-accent-blue">
                <Description fontSize="small" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Hợp đồng gần đây</h3>
                <p className="text-sm text-neutral-600">
                  {loadingDocuments
                    ? 'Đang tải...'
                    : recentContracts.length > 0
                      ? `${recentContracts.length} hợp đồng sở hữu`
                      : 'Chưa có hợp đồng nào'}
                </p>
              </div>
            </div>

            {loadingDocuments ? (
              <div className="text-center py-4 text-neutral-500">Đang tải...</div>
            ) : recentContracts.length > 0 ? (
              <div className="space-y-2">
                {recentContracts.map((doc) => (
                  isPendingOrRejected ? (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-3 cursor-not-allowed opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📄</span>
                        <div>
                          <p className="text-sm font-medium text-neutral-400 line-clamp-1">
                            {doc.fileName}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {doc.signatureStatus === SignatureStatus.FullySigned
                              ? 'Đã ký hoàn tất'
                              : doc.signatureStatus === SignatureStatus.PartiallySigned
                                ? 'Đang ký'
                                : 'Nháp'}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-400">
                        {doc.signatureStatus === SignatureStatus.FullySigned
                          ? 'Hoàn tất'
                          : doc.signatureStatus === SignatureStatus.PartiallySigned
                            ? 'Đang ký'
                            : 'Nháp'}
                      </span>
                    </div>
                  ) : (
                    <Link
                      key={doc.id}
                      to={`/groups/${selectedGroup?.id}/documents/${doc.id}`}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-3 transition hover:border-accent-blue hover:bg-accent-blue/5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📄</span>
                        <div>
                          <p className="text-sm font-medium text-neutral-900 line-clamp-1">
                            {doc.fileName}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {doc.signatureStatus === SignatureStatus.FullySigned
                              ? 'Đã ký hoàn tất'
                              : doc.signatureStatus === SignatureStatus.PartiallySigned
                                ? 'Đang ký'
                                : 'Nháp'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          doc.signatureStatus === SignatureStatus.FullySigned
                            ? 'bg-accent-green/20 text-accent-green'
                            : doc.signatureStatus === SignatureStatus.PartiallySigned
                              ? 'bg-accent-gold/20 text-accent-gold'
                              : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {doc.signatureStatus === SignatureStatus.FullySigned
                          ? 'Hoàn tất'
                          : doc.signatureStatus === SignatureStatus.PartiallySigned
                            ? 'Đang ký'
                            : 'Nháp'}
                      </span>
                    </Link>
                  )
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center text-neutral-500">
                Chưa có hợp đồng nào được tạo
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        {selectedGroup?.id && (
          <div className="grid gap-4 md:grid-cols-3">
            {isPendingOrRejected ? (
              <>
                <Tooltip title="Nhóm đang chờ phê duyệt hoặc bị từ chối">
                  <div className="group flex items-center gap-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-4 cursor-not-allowed opacity-60">
                    <span className="rounded-2xl bg-neutral-200 p-2 text-neutral-400">
                      <Description fontSize="small" />
                    </span>
                    <div>
                      <p className="font-semibold text-neutral-400">Xem tất cả tài liệu</p>
                      <p className="text-sm text-neutral-400">Không khả dụng khi nhóm đang chờ phê duyệt</p>
                    </div>
                  </div>
                </Tooltip>

                <Tooltip title="Nhóm đang chờ phê duyệt hoặc bị từ chối">
                  <div className="group flex items-center gap-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-4 cursor-not-allowed opacity-60">
                    <span className="rounded-2xl bg-neutral-200 p-2 text-neutral-400">
                      <Assignment fontSize="small" />
                    </span>
                    <div>
                      <p className="font-semibold text-neutral-400">Chữ ký đang chờ</p>
                      <p className="text-sm text-neutral-400">Không khả dụng khi nhóm đang chờ phê duyệt</p>
                    </div>
                  </div>
                </Tooltip>

                <Tooltip title="Nhóm đang chờ phê duyệt hoặc bị từ chối">
                  <div className="group flex items-center gap-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-4 cursor-not-allowed opacity-60">
                    <span className="rounded-2xl bg-neutral-200 p-2 text-neutral-400">
                      <HowToReg fontSize="small" />
                    </span>
                    <div>
                      <p className="font-semibold text-neutral-400">Hợp đồng sở hữu</p>
                      <p className="text-sm text-neutral-400">Không khả dụng khi nhóm đang chờ phê duyệt</p>
                    </div>
                  </div>
                </Tooltip>
              </>
            ) : (
              <>
                <Link
                  to={`/groups/${selectedGroup.id}/documents`}
                  className="group flex items-center gap-4 rounded-3xl border border-neutral-200 bg-white p-4 transition hover:-translate-y-1 hover:border-accent-blue hover:shadow-lg"
                >
                  <span className="rounded-2xl bg-accent-blue/10 p-2 text-accent-blue">
                    <Description fontSize="small" />
                  </span>
                  <div>
                    <p className="font-semibold text-neutral-900">Xem tất cả tài liệu</p>
                    <p className="text-sm text-neutral-600">Quản lý và xem tài liệu nhóm</p>
                  </div>
                </Link>

                <Link
                  to={`/groups/${selectedGroup.id}/documents?status=pending`}
                  className="group flex items-center gap-4 rounded-3xl border border-neutral-200 bg-white p-4 transition hover:-translate-y-1 hover:border-accent-gold hover:shadow-lg"
                >
                  <span className="rounded-2xl bg-accent-gold/10 p-2 text-accent-gold">
                    <Assignment fontSize="small" />
                  </span>
                  <div>
                    <p className="font-semibold text-neutral-900">Chữ ký đang chờ</p>
                    <p className="text-sm text-neutral-600">Xem tài liệu cần ký</p>
                  </div>
                </Link>

                <Link
                  to={`/groups/${selectedGroup.id}/documents?type=contract`}
                  className="group flex items-center gap-4 rounded-3xl border border-neutral-200 bg-white p-4 transition hover:-translate-y-1 hover:border-accent-green hover:shadow-lg"
                >
                  <span className="rounded-2xl bg-accent-green/10 p-2 text-accent-green">
                    <HowToReg fontSize="small" />
                  </span>
                  <div>
                    <p className="font-semibold text-neutral-900">Hợp đồng sở hữu</p>
                    <p className="text-sm text-neutral-600">Xem hợp đồng điện tử</p>
                  </div>
                </Link>
              </>
            )}
          </div>
        )}
      </section>

      <section className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900">
              Xe trong nhóm
            </h2>
            <p className="text-sm text-neutral-600">
              Theo dõi trạng thái & biển số
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700">
            <DirectionsCarFilledOutlined fontSize="small" />
            {selectedGroup.vehicles.length} xe
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {selectedGroup.vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <p className="text-lg font-semibold text-neutral-900">
                {vehicle.model} · {vehicle.year}
              </p>
              <p className="text-sm text-neutral-600">
                Biển số: {vehicle.plateNumber}
              </p>
              <p className="text-sm text-neutral-600">
                Trạng thái: {vehicle.status}
              </p>
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
  );
};

export default GroupOverview;
