import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material'
import { CheckCircle, Cancel, Refresh } from '@mui/icons-material'
import { groupApi } from '@/services/group/groups'
import type { PendingGroupDto, RejectGroupDto } from '@/models/group'
import { useIsStaffOrAdmin } from '@/hooks/useRole'
import Unauthorized from '@/components/auth/Unauthorized'
import LoadingSpinner from '@/components/ui/Loading'

const PendingGroups = () => {
  const isStaffOrAdmin = useIsStaffOrAdmin()
  const [pendingGroups, setPendingGroups] = useState<PendingGroupDto[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState<PendingGroupDto | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (isStaffOrAdmin) {
      fetchPendingGroups()
    }
  }, [isStaffOrAdmin])

  const fetchPendingGroups = async () => {
    try {
      setLoading(true)
      const groups = await groupApi.getPendingGroups()
      setPendingGroups(groups)
    } catch (error) {
      console.error('Error fetching pending groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (groupId: string) => {
    try {
      setProcessing(groupId)
      await groupApi.approveGroup(groupId)
      await fetchPendingGroups()
      setSelectedGroup(null)
    } catch (error) {
      console.error('Error approving group:', error)
      alert('Không thể phê duyệt nhóm. Vui lòng thử lại.')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async () => {
    if (!selectedGroup || !rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối')
      return
    }

    try {
      setProcessing(selectedGroup.id)
      const payload: RejectGroupDto = { reason: rejectReason }
      await groupApi.rejectGroup(selectedGroup.id, payload)
      setRejectDialogOpen(false)
      setRejectReason('')
      setSelectedGroup(null)
      await fetchPendingGroups()
    } catch (error) {
      console.error('Error rejecting group:', error)
      alert('Không thể từ chối nhóm. Vui lòng thử lại.')
    } finally {
      setProcessing(null)
    }
  }

  if (!isStaffOrAdmin) {
    return <Unauthorized />
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Nhóm chờ phê duyệt</h1>
            <p className="text-neutral-600 mt-1">
              Xem xét và phê duyệt các nhóm đồng sở hữu mới
            </p>
          </div>
          <Button variant="outlined" onClick={fetchPendingGroups} startIcon={<Refresh />}>
            Làm mới
          </Button>
        </div>

        {pendingGroups.length === 0 ? (
          <Alert severity="info">Không có nhóm nào đang chờ phê duyệt.</Alert>
        ) : (
          <div className="grid gap-4">
            {pendingGroups.map((group) => (
              <Card key={group.id} className="shadow-sm">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Typography variant="h6">{group.name}</Typography>
                        <Chip
                          label="Chờ phê duyệt"
                          color="warning"
                          size="small"
                        />
                        {group.submittedAt && (
                          <Typography variant="caption" color="textSecondary">
                            Gửi lúc: {new Date(group.submittedAt).toLocaleString('vi-VN')}
                          </Typography>
                        )}
                      </div>
                      {group.description && (
                        <Typography variant="body2" color="textSecondary" className="mb-3">
                          {group.description}
                        </Typography>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <Typography variant="caption" color="textSecondary">
                            Số thành viên
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {group.members.length}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="caption" color="textSecondary">
                            Tổng tỷ lệ sở hữu
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {group.members.reduce((sum, m) => sum + m.sharePercentage * 100, 0).toFixed(1)}%
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="caption" color="textSecondary">
                            Có GroupAdmin
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {group.members.some((m) => m.roleInGroup === 'Admin') ? 'Có' : 'Không'}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="caption" color="textSecondary">
                            Người tạo
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {group.members.find((m) => m.userId === group.createdBy)?.userEmail || 'N/A'}
                          </Typography>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Typography variant="subtitle2" className="mb-2">
                          Thành viên:
                        </Typography>
                        <div className="flex flex-wrap gap-2">
                          {group.members.map((member) => (
                            <Chip
                              key={member.id}
                              label={`${member.userFirstName} ${member.userLastName} (${(member.sharePercentage * 100).toFixed(1)}%)`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleApprove(group.id)}
                        disabled={processing === group.id}
                      >
                        Phê duyệt
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => {
                          setSelectedGroup(group)
                          setRejectDialogOpen(true)
                        }}
                        disabled={processing === group.id}
                      >
                        Từ chối
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Từ chối nhóm</DialogTitle>
          <DialogContent>
            <TextField
              label="Lý do từ chối"
              multiline
              rows={4}
              fullWidth
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối nhóm này..."
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectDialogOpen(false)}>Hủy</Button>
            <Button
              onClick={handleReject}
              variant="contained"
              color="error"
              disabled={!rejectReason.trim() || !!processing}
            >
              Xác nhận từ chối
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  )
}

export default PendingGroups

