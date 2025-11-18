import { useMemo, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Alert, Avatar, Button, Snackbar, TextField } from '@mui/material'
import type { UUID } from '@/models/booking'
import { useGroup } from '@/hooks/useGroups'
import { useGroupMessages } from '@/hooks/useGroupMessages'
import { useAppSelector } from '@/store/hooks'

const MessageBubble = ({
  author,
  message,
  isMine,
  timestamp,
}: {
  author: string
  message: string
  isMine: boolean
  timestamp: string
}) => (
  <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-lg rounded-3xl px-4 py-3 text-sm ${
        isMine ? 'bg-neutral-900 text-neutral-50' : 'bg-neutral-100 text-neutral-800'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide">
        {author} · {new Date(timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
      </p>
      <p className="mt-1 whitespace-pre-line">{message}</p>
    </div>
  </div>
)

const MessageCenter = () => {
  const { groupId } = useParams<{ groupId: UUID }>()
  const { data: group, loading } = useGroup(groupId)
  const { data: messages, loading: messageLoading, error, sendMessage, reload } = useGroupMessages(groupId)
  const { user } = useAppSelector((state) => state.auth)
  const [draft, setDraft] = useState({ content: '' })
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  // Get display name from user data
  const displayName = useMemo(() => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user?.email || 'Thành viên'
  }, [user])

  // Log group members data for debugging
  useEffect(() => {
    if (group?.members) {
      console.log('Group members data:', group.members)
      group.members.forEach((member, index) => {
        console.log(`Member ${index}:`, {
          userId: member.userId,
          userFirstName: member.userFirstName,
          userLastName: member.userLastName,
          userEmail: member.userEmail,
        })
      })
    }
  }, [group])

  const conversation = useMemo(() => messages ?? [], [messages])

  const handleSend = async () => {
    if (!draft.content.trim()) return
    try {
      await sendMessage(draft.content.trim(), displayName)
      setDraft((prev) => ({ ...prev, content: '' }))
      setSnackbar({ open: true, message: 'Đã gửi tin nhắn', severity: 'success' })
    } catch (sendError) {
      setSnackbar({
        open: true,
        message: sendError instanceof Error ? sendError.message : 'Không thể gửi tin nhắn',
        severity: 'error',
      })
    }
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold text-neutral-900">Tin nhắn nhóm</h1>
        <p className="text-neutral-600">
          Tin nhắn giữa các thành viên sẽ được đồng bộ thông qua Notification Service. Tất cả nội dung
          tại đây cũng xuất hiện trong app di động và email thông báo.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-neutral-900">Nhóm của bạn</h2>
          {loading ? (
            <p className="text-sm text-neutral-500">Đang tải...</p>
          ) : group ? (
            <ul className="space-y-3 text-sm text-neutral-600">
              {group.members.map((member) => (
                <li key={member.id} className="flex items-center gap-3">
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {member.userFirstName && member.userLastName
                      ? `${member.userFirstName.charAt(0)}${member.userLastName.charAt(0)}`
                      : member.userEmail
                        ? member.userEmail.charAt(0).toUpperCase()
                        : '?'}
                  </Avatar>
                  <div>
                    <p className="font-semibold text-neutral-900">
                      {member.userFirstName && member.userLastName
                        ? `${member.userFirstName} ${member.userLastName}`
                        : member.userEmail || 'Unknown'}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {member.roleInGroup === 'Admin' ? 'Admin' : 'Thành viên'} · Sở hữu{' '}
                      {(Number(member.sharePercentage) * 100).toFixed(0)}%
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500">Không tìm thấy nhóm.</p>
          )}
          <Button variant="outlined" onClick={() => reload()} fullWidth>
            Làm mới hội thoại
          </Button>
        </aside>

        <section className="flex flex-col rounded-3xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
            <div>
              <p className="text-lg font-semibold text-neutral-900">
                {group?.name ?? 'Chọn nhóm'} · Message center
              </p>
              <p className="text-xs text-neutral-500">
                {messageLoading ? 'Đang đồng bộ tin nhắn...' : `${conversation.length} tin nhắn`}
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
            {error && <Alert severity="error">{error.message}</Alert>}
            {conversation.length === 0 && !messageLoading && (
              <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center text-neutral-500">
                Chưa có tin nhắn nào. Hãy gửi lời chào đầu tiên!
              </div>
            )}
            {conversation.map((message) => (
              <MessageBubble
                key={message.id}
                author={message.userName}
                message={message.message}
                timestamp={message.createdAt}
                isMine={message.userName === displayName || message.userName === user?.email}
              />
            ))}
          </div>

          <div className="space-y-3 border-t border-neutral-100 px-6 py-4">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span>Gửi với tên:</span>
              <span className="font-semibold text-neutral-900">{displayName}</span>
            </div>
            <TextField sx={{mb: 2}}
              label="Nội dung tin nhắn"
              value={draft.content}
              onChange={(event) => setDraft((prev) => ({ ...prev, content: event.target.value }))}
              multiline
              minRows={2}
              fullWidth
            />
            <div className="flex items-center justify-end gap-3">
              <Button variant="outlined" onClick={() => setDraft((prev) => ({ ...prev, content: '' }))}>
                Xoá
              </Button>
              <Button variant="contained" onClick={() => handleSend()} disabled={!draft.content.trim()}>
                Gửi
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </section>
  )
}

export default MessageCenter



