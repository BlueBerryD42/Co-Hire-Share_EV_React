import React, { useEffect, useState } from 'react'
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
import vehicleService from '@/services/vehicleService'
import type { PendingVehicleDto, RejectVehicleDto } from '@/models/vehicle'
import { useIsStaffOrAdmin } from '@/hooks/useRole'
import Unauthorized from '@/components/auth/Unauthorized'
import LoadingSpinner from '@/components/ui/Loading'

const PendingVehicles = () => {
  const isStaffOrAdmin = useIsStaffOrAdmin()
  const [pendingVehicles, setPendingVehicles] = useState<PendingVehicleDto[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVehicle, setSelectedVehicle] = useState<PendingVehicleDto | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (isStaffOrAdmin) {
      fetchPendingVehicles()
    }
  }, [isStaffOrAdmin])

  const fetchPendingVehicles = async () => {
    try {
      setLoading(true)
      const vehicles = await vehicleService.getPendingVehicles()
      setPendingVehicles(vehicles)
    } catch (error) {
      console.error('Error fetching pending vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (vehicleId: string) => {
    try {
      setProcessing(vehicleId)
      await vehicleService.approveVehicle(vehicleId)
      await fetchPendingVehicles()
      setSelectedVehicle(null)
    } catch (error) {
      console.error('Error approving vehicle:', error)
      alert('Không thể phê duyệt xe. Vui lòng thử lại.')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async () => {
    if (!selectedVehicle || !rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối')
      return
    }

    try {
      setProcessing(selectedVehicle.id)
      const payload: RejectVehicleDto = { reason: rejectReason }
      await vehicleService.rejectVehicle(selectedVehicle.id, payload)
      setRejectDialogOpen(false)
      setRejectReason('')
      setSelectedVehicle(null)
      await fetchPendingVehicles()
    } catch (error) {
      console.error('Error rejecting vehicle:', error)
      alert('Không thể từ chối xe. Vui lòng thử lại.')
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
            <h1 className="text-3xl font-bold text-neutral-900">Xe chờ phê duyệt</h1>
            <p className="text-neutral-600 mt-1">
              Xem xét và phê duyệt các xe mới được thêm vào hệ thống
            </p>
          </div>
          <Button variant="outlined" onClick={fetchPendingVehicles} startIcon={<Refresh />}>
            Làm mới
          </Button>
        </div>

        {pendingVehicles.length === 0 ? (
          <Alert severity="info">Không có xe nào đang chờ phê duyệt.</Alert>
        ) : (
          <div className="grid gap-4">
            {pendingVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="shadow-sm">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Typography variant="h6">
                          {vehicle.model} ({vehicle.year})
                        </Typography>
                        <Chip label="Chờ phê duyệt" color="warning" size="small" />
                        {vehicle.submittedAt && (
                          <Typography variant="caption" color="textSecondary">
                            Gửi lúc: {new Date(vehicle.submittedAt).toLocaleString('vi-VN')}
                          </Typography>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <Typography variant="caption" color="textSecondary">
                            VIN
                          </Typography>
                          <Typography variant="body2" fontWeight="medium" className="font-mono">
                            {vehicle.vin}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="caption" color="textSecondary">
                            Biển số
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {vehicle.plateNumber}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="caption" color="textSecondary">
                            Màu sắc
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {vehicle.color || 'N/A'}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="caption" color="textSecondary">
                            Số km
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {vehicle.odometer.toLocaleString('vi-VN')} km
                          </Typography>
                        </div>
                      </div>
                      {vehicle.groupId && (
                        <div className="mt-4">
                          <Typography variant="caption" color="textSecondary">
                            Nhóm: {vehicle.groupName || vehicle.groupId}
                          </Typography>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleApprove(vehicle.id)}
                        disabled={processing === vehicle.id}
                      >
                        Phê duyệt
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => {
                          setSelectedVehicle(vehicle)
                          setRejectDialogOpen(true)
                        }}
                        disabled={processing === vehicle.id}
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
          <DialogTitle>Từ chối xe</DialogTitle>
          <DialogContent>
            <TextField
              label="Lý do từ chối"
              multiline
              rows={4}
              fullWidth
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối xe này..."
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

export default PendingVehicles

