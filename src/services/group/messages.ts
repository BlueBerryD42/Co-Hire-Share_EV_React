import type { UUID } from '@/models/booking'
import type { GroupMessageDto } from '@/models/message'
import { groupApi } from '@/services/group/groups'
import { notificationApi } from '@/services/notification/notifications'

const mapNotificationToMessage = (notification: any): GroupMessageDto => ({
  id: notification.id,
  groupId: notification.groupId,
  userId: notification.userId,
  userName: notification.title ?? 'Thành viên',
  message: notification.message,
  type: (notification.type as GroupMessageDto['type']) ?? 'Chat',
  priority: notification.priority,
  createdAt: notification.createdAt,
  readAt: notification.readAt ?? null,
})

export const messagesApi = {
  async getGroupMessages(groupId: UUID) {
    const notifications = await notificationApi.getMine({
      groupId,
      type: 'Chat',
      limit: 100,
    })
    return notifications.map(mapNotificationToMessage)
  },

  async sendMessage(groupId: UUID, message: string, senderName = 'Bạn') {
    const group = await groupApi.getGroup(groupId)
    const userIds = group.members.map((member) => member.userId)

    if (userIds.length === 0) {
      throw new Error('Nhóm chưa có thành viên để nhận tin nhắn.')
    }

    await notificationApi.createBulk({
      userIds,
      groupId,
      title: senderName,
      message,
      type: 'Chat',
      priority: 'Normal',
    })
  },
}

export type MessagesApi = typeof messagesApi


