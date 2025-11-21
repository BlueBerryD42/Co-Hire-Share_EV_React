import { ReactNode } from 'react'
import {
  DirectionsCar,
  CalendarToday,
  Receipt,
  NotificationsNone,
  Search,
  Folder,
  HowToVote,
  People,
} from '@mui/icons-material'

export type EmptyStateType =
  | 'vehicles'
  | 'bookings'
  | 'expenses'
  | 'notifications'
  | 'search'
  | 'documents'
  | 'proposals'
  | 'groupMembers'

interface EmptyStateProps {
  type?: EmptyStateType
  headline?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  illustration?: ReactNode
}

const defaultConfigs: Record<EmptyStateType, { headline: string; description: string; icon: ReactNode }> = {
  vehicles: {
    headline: 'Chưa có xe nào',
    description: 'Tham gia nhóm hoặc tạo nhóm mới để bắt đầu',
    icon: <DirectionsCar sx={{ fontSize: 64, color: '#d6ccc2' }} />,
  },
  bookings: {
    headline: 'Chưa có đặt chỗ nào',
    description: 'Đặt chuyến đi đầu tiên của bạn để bắt đầu',
    icon: <CalendarToday sx={{ fontSize: 64, color: '#d6ccc2' }} />,
  },
  expenses: {
    headline: 'Chưa có chi phí nào',
    description: 'Chi phí sẽ xuất hiện ở đây',
    icon: <Receipt sx={{ fontSize: 64, color: '#d6ccc2' }} />,
  },
  notifications: {
    headline: 'Bạn đã cập nhật đầy đủ!',
    description: 'Thông báo mới sẽ xuất hiện ở đây',
    icon: <NotificationsNone sx={{ fontSize: 64, color: '#d6ccc2' }} />,
  },
  search: {
    headline: 'Không tìm thấy kết quả',
    description: 'Thử dùng từ khóa hoặc bộ lọc khác',
    icon: <Search sx={{ fontSize: 64, color: '#d6ccc2' }} />,
  },
  documents: {
    headline: 'Chưa có tài liệu nào',
    description: 'Hợp đồng và biên lai sẽ xuất hiện ở đây',
    icon: <Folder sx={{ fontSize: 64, color: '#d6ccc2' }} />,
  },
  proposals: {
    headline: 'Chưa có đề xuất nào',
    description: 'Tạo đề xuất mới để các thành viên cùng bỏ phiếu',
    icon: <HowToVote sx={{ fontSize: 64, color: '#d6ccc2' }} />,
  },
  groupMembers: {
    headline: 'Chỉ có bạn lúc này',
    description: 'Mời các đồng sở hữu tham gia nhóm của bạn',
    icon: <People sx={{ fontSize: 64, color: '#d6ccc2' }} />,
  },
}

const EmptyState = ({
  type = 'proposals',
  headline,
  description,
  actionLabel,
  onAction,
  illustration,
}: EmptyStateProps) => {
  const config = defaultConfigs[type]
  const displayHeadline = headline ?? config.headline
  const displayDescription = description ?? config.description
  const displayIllustration = illustration ?? config.icon

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-neutral-200 bg-neutral-100 p-12 text-center">
      <div className="mb-6 flex items-center justify-center">{displayIllustration}</div>
      <h3 className="mb-3 text-2xl font-semibold text-neutral-700">{displayHeadline}</h3>
      <p className="mb-6 max-w-md text-base text-neutral-600">{displayDescription}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-xl bg-accent-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-opacity-90"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState



