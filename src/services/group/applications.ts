import type { UUID } from '@/models/booking'
import type {
  JoinApplicationSubmissionResult,
  JoinGroupApplicationDto,
} from '@/models/application'
import { groupApi } from '@/services/group/groups'
import { notificationApi } from '@/services/notification/notifications'

export const applicationsApi = {
  async submit(groupId: UUID, payload: JoinGroupApplicationDto) {
    const group = await groupApi.getGroup(groupId)
    const adminIds = group.members.filter((member) => member.roleInGroup === 'Admin').map((m) => m.userId)

    if (adminIds.length === 0) {
      throw new Error('Nhóm chưa có admin để xét duyệt.')
    }

    const title = `Yêu cầu tham gia nhóm ${group.name}`
    const bodyLines = [
      `Quyền sở hữu mong muốn: ${(payload.desiredOwnershipPercentage * 100).toFixed(0)}%`,
      `Sử dụng dự kiến: ${payload.intendedUsageHoursPerWeek} giờ/tuần`,
      `Giới thiệu: ${payload.introduction}`,
      `Liên hệ ưu tiên: ${payload.preferredContact}`,
    ]

    const notifications = await notificationApi.createBulk({
      userIds: adminIds,
      groupId,
      title,
      message: bodyLines.join('\n'),
      type: 'GroupApplication',
      priority: 'Normal',
    })

    const result: JoinApplicationSubmissionResult = {
      requestId: notifications[0]?.id ?? crypto.randomUUID(),
      status: 'Submitted',
      notifiedAdmins: adminIds,
    }

    return result
  },
}

export type ApplicationsApi = typeof applicationsApi


