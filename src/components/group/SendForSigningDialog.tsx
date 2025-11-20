import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  CircularProgress,
  ListItemButton,
} from '@mui/material'
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { documentApi } from '@/services/group/documents'
import { groupApi } from '@/services/group/groups'
import { SigningMode, type SendForSigningRequest } from '@/models/document'
import type { UUID } from '@/models/booking'

interface SendForSigningDialogProps {
  open: boolean
  onClose: () => void
  documentId: UUID
  groupId: UUID
  onSuccess?: () => void
}

interface GroupMember {
  id: UUID
  userId: UUID
  name: string
  email: string
}

export default function SendForSigningDialog({
  open,
  onClose,
  documentId,
  groupId,
  onSuccess,
}: SendForSigningDialogProps) {
  const [selectedSigners, setSelectedSigners] = useState<UUID[]>([])
  const [signingMode, setSigningMode] = useState<SigningMode>(SigningMode.Parallel)
  const [dueDate, setDueDate] = useState('')
  const [message, setMessage] = useState('')
  const [tokenExpirationDays, setTokenExpirationDays] = useState(7)
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && groupId) {
      fetchGroupMembers()
    }
  }, [open, groupId])

  const fetchGroupMembers = async () => {
    setLoadingMembers(true)
    setError(null)

    try {
      const group = await groupApi.getGroup(groupId)
      const members = group.members.map((member: any) => ({
        id: member.id,
        userId: member.userId,
        name: `${member.userFirstName} ${member.userLastName}`.trim() || 'Unknown Member',
        email: member.userEmail || '',
      }))
      setGroupMembers(members)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load group members'
      setError(errorMessage)
      console.error('Error fetching group members:', err)
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleToggleSigner = (signerId: UUID) => {
    setSelectedSigners((prev) =>
      prev.includes(signerId)
        ? prev.filter((id) => id !== signerId)
        : [...prev, signerId]
    )
  }

  const handleSend = async () => {
    if (selectedSigners.length === 0) {
      setError('Please select at least one signer')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const request: SendForSigningRequest = {
        signerIds: selectedSigners,
        signingMode,
        tokenExpirationDays,
      }

      if (dueDate) {
        request.dueDate = new Date(dueDate).toISOString()
      }

      if (message) {
        request.message = message
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
      setError(err.response?.data?.error || err.message || 'Failed to send document for signing')
      console.error('Error sending for signing:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setSelectedSigners([])
      setSigningMode(SigningMode.Parallel)
      setDueDate('')
      setMessage('')
      setTokenExpirationDays(7)
      setError(null)
      onClose()
    }
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="span" fontWeight={600}>
          Send Document for Signing
        </Typography>
        <IconButton onClick={handleClose} disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Signing Mode */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Signing Mode
          </Typography>
          <RadioGroup
            value={signingMode}
            onChange={(e) => setSigningMode(e.target.value as SigningMode)}
          >
            <FormControlLabel
              value={SigningMode.Parallel}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">Parallel Signing</Typography>
                  <Typography variant="caption" color="text.secondary">
                    All signers can sign at the same time
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value={SigningMode.Sequential}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">Sequential Signing</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Signers must sign in order (as listed below)
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </Box>

        {/* Select Signers */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Select Signers {signingMode === SigningMode.Sequential && '(order matters)'}
          </Typography>
          {loadingMembers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress sx={{ color: '#7a9b76' }} />
            </Box>
          ) : groupMembers.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#f5ebe0', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                No group members found
              </Typography>
            </Box>
          ) : (
            <List sx={{ bgcolor: '#f5ebe0', borderRadius: 1, maxHeight: 300, overflow: 'auto' }}>
              {groupMembers.map((member, index) => (
                <ListItem
  key={member.userId}
  sx={{
    borderBottom:
      index < groupMembers.length - 1
        ? '1px solid rgba(0,0,0,0.1)'
        : 'none',
  }}
  disablePadding
>
          <ListItemButton onClick={() => handleToggleSigner(member.userId)}>
            <Checkbox
              edge="start"
              checked={selectedSigners.includes(member.userId)}
              sx={{
                color: '#7a9b76',
                '&.Mui-checked': { color: '#7a9b76' },
              }}
            />

            <ListItemAvatar>
              <Avatar sx={{ bgcolor: '#7a9b76' }}>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>

            <ListItemText primary={member.name} secondary={member.email} />

            {selectedSigners.includes(member.userId) &&
              signingMode === SigningMode.Sequential && (
                <Chip
                  label={`Order: ${
                    selectedSigners.indexOf(member.userId) + 1
                  }`}
                  size="small"
                  sx={{ bgcolor: '#7a9b76', color: 'white' }}
                />
              )}
          </ListItemButton>
        </ListItem>
              ))}
            </List>
          )}
          {selectedSigners.length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              {selectedSigners.length} signer(s) selected
            </Typography>
          )}
        </Box>

        {/* Due Date */}
        <TextField
          fullWidth
          label="Due Date (Optional)"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            min: getMinDate(),
          }}
          sx={{ mb: 3 }}
          disabled={loading}
        />

        {/* Token Expiration */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Signing Link Expiration</InputLabel>
          <Select
            value={tokenExpirationDays}
            onChange={(e) => setTokenExpirationDays(e.target.value as number)}
            label="Signing Link Expiration"
            disabled={loading}
          >
            <MenuItem value={1}>1 day</MenuItem>
            <MenuItem value={3}>3 days</MenuItem>
            <MenuItem value={7}>7 days (recommended)</MenuItem>
            <MenuItem value={14}>14 days</MenuItem>
            <MenuItem value={30}>30 days</MenuItem>
            <MenuItem value={90}>90 days</MenuItem>
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
          placeholder="Add a message to include in the signing notification..."
          disabled={loading}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={selectedSigners.length === 0 || loading}
          sx={{
            bgcolor: '#7a9b76',
            '&:hover': { bgcolor: '#6a8b66' },
          }}
        >
          {loading ? 'Sending...' : 'Send for Signing'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
