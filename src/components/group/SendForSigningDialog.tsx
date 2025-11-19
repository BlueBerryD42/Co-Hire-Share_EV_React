import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  ListItemButton,
} from '@mui/material'
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Person as PersonIcon,
} from '@mui/icons-material'
import { documentApi } from '@/services/group/documents'
import { groupApi } from '@/services/group/groups'
import { SigningMode, type SendForSigningRequest } from '@/models/document'
import type { UUID } from '@/models/booking'
import type { GroupDto } from '@/models/group'

interface SendForSigningDialogProps {
  open: boolean
  onClose: () => void
  documentId: UUID
  groupId: UUID
  onSuccess?: () => void
}

export default function SendForSigningDialog({
  open,
  onClose,
  documentId,
  groupId,
  onSuccess,
}: SendForSigningDialogProps) {
  const [groupData, setGroupData] = useState<GroupDto | null>(null)
  const [selectedSigners, setSelectedSigners] = useState<UUID[]>([])
  const [signingMode, setSigningMode] = useState<SigningMode>(SigningMode.Parallel)
  const [dueDate, setDueDate] = useState('')
  const [message, setMessage] = useState('')
  const [tokenExpirationDays, setTokenExpirationDays] = useState(7)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && groupId) {
      fetchGroupMembers()
    }
  }, [open, groupId])

  const fetchGroupMembers = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await groupApi.getGroup(groupId)
      setGroupData(data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load group members')
      console.error('Error fetching group members:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSigner = (userId: UUID) => {
    setSelectedSigners((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleRemoveSigner = (userId: UUID) => {
    setSelectedSigners((prev) => prev.filter((id) => id !== userId))
  }

  const handleSendForSigning = async () => {
    if (selectedSigners.length === 0) {
      setError('Please select at least one signer')
      return
    }

    setSending(true)
    setError(null)

    try {
      const request: SendForSigningRequest = {
        signerIds: selectedSigners,
        signingMode,
        dueDate: dueDate || undefined,
        message: message || undefined,
        tokenExpirationDays,
      }

      await documentApi.sendForSigning(documentId, request)

      // Reset form
      setSelectedSigners([])
      setSigningMode(SigningMode.Parallel)
      setDueDate('')
      setMessage('')
      setTokenExpirationDays(7)

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send document for signing')
      console.error('Error sending document for signing:', err)
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    if (!sending) {
      setSelectedSigners([])
      setSigningMode(SigningMode.Parallel)
      setDueDate('')
      setMessage('')
      setTokenExpirationDays(7)
      setError(null)
      onClose()
    }
  }

  const getSelectedSignersDetails = () => {
    if (!groupData) return []
    return selectedSigners
      .map((id) => groupData.members.find((m) => m.userId === id))
      .filter((m) => m !== undefined)
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          Send for Signing
        </Typography>
        <IconButton onClick={handleClose} disabled={sending}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Select Signers */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Select Signers
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose group members who need to sign this document
              </Typography>

              <List sx={{ maxHeight: 300, overflow: 'auto', bgcolor: '#f5f5f5', borderRadius: 1 }}>
  {groupData?.members.map((member) => (
            <ListItem
              key={member.userId}
              sx={{
                bgcolor: selectedSigners.includes(member.userId) ? '#f5ebe0' : 'transparent',
              }}
            >
              <ListItemButton
                onClick={() => handleToggleSigner(member.userId)}
                sx={{
                  bgcolor: selectedSigners.includes(member.userId) ? '#f5ebe0' : 'transparent',
                  '&:hover': {
                    bgcolor: '#f5ebe0',
                  },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedSigners.includes(member.userId)}
                      sx={{ color: '#7a9b76', '&.Mui-checked': { color: '#7a9b76' } }}
                    />
                  }
                  label=""
                  sx={{ mr: 1 }}
                />

                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#7a9b76' }}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={`${member.userFirstName} ${member.userLastName}`}
                  secondary={member.userEmail}
                />

                <Chip label={member.roleInGroup} size="small" />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

              {/* Selected Signers Summary */}
              {selectedSigners.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Selected Signers ({selectedSigners.length}):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {getSelectedSignersDetails().map((member) => (
                      <Chip
                        key={member.userId}
                        label={`${member.userFirstName} ${member.userLastName}`}
                        onDelete={() => handleRemoveSigner(member.userId)}
                        deleteIcon={<DeleteIcon />}
                        sx={{ bgcolor: '#7a9b76', color: 'white' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            {/* Signing Mode */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Signing Mode</InputLabel>
              <Select
                value={signingMode}
                onChange={(e) => setSigningMode(e.target.value as SigningMode)}
                label="Signing Mode"
                disabled={sending}
              >
                <MenuItem value={SigningMode.Parallel}>
                  <Box>
                    <Typography variant="body1">Parallel</Typography>
                    <Typography variant="caption" color="text.secondary">
                      All signers can sign at the same time
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value={SigningMode.Sequential}>
                  <Box>
                    <Typography variant="body1">Sequential</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Signers must sign in order
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {/* Due Date */}
            <TextField
              fullWidth
              type="date"
              label="Due Date (Optional)"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 3 }}
              disabled={sending}
            />

            {/* Token Expiration */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Signing Link Expiration</InputLabel>
              <Select
                value={tokenExpirationDays}
                onChange={(e) => setTokenExpirationDays(e.target.value as number)}
                label="Signing Link Expiration"
                disabled={sending}
              >
                <MenuItem value={1}>1 day</MenuItem>
                <MenuItem value={3}>3 days</MenuItem>
                <MenuItem value={7}>7 days</MenuItem>
                <MenuItem value={14}>14 days</MenuItem>
                <MenuItem value={30}>30 days</MenuItem>
              </Select>
            </FormControl>

            {/* Message */}
            <TextField
              fullWidth
              label="Message to Signers (Optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              multiline
              rows={3}
              placeholder="Add a message that will be included in the signing invitation..."
              disabled={sending}
            />

            {/* Info Alert */}
            <Alert severity="info" sx={{ mt: 3 }}>
              Signers will receive an email notification with a secure link to sign the document.
            </Alert>

            {/* Error Message */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={sending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSendForSigning}
          disabled={selectedSigners.length === 0 || sending || loading}
          startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
          sx={{
            bgcolor: '#7a9b76',
            '&:hover': { bgcolor: '#6a8b66' },
          }}
        >
          {sending ? 'Sending...' : 'Send for Signing'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
