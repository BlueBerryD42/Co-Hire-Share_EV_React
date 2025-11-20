import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Divider,
} from '@mui/material'
import {
  History as HistoryIcon,
  Download as DownloadIcon,
  CheckCircle as CurrentIcon,
  Description as DocumentIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { documentApi } from '@/services/group/documents'
import type { UUID } from '@/models/booking'
import type { DocumentVersionListResponse } from '@/models/document'
import { formatFileSize } from '@/models/document'

interface DocumentVersionHistoryProps {
  documentId: UUID
  open: boolean
  onClose: () => void
  onVersionSelected?: (versionId: UUID) => void
  allowDelete?: boolean
}

export default function DocumentVersionHistory({
  documentId,
  open,
  onClose,
  onVersionSelected,
  allowDelete = false,
}: DocumentVersionHistoryProps) {
  const [versionData, setVersionData] = useState<DocumentVersionListResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<UUID | null>(null)
  const [deleting, setDeleting] = useState<UUID | null>(null)

  useEffect(() => {
    if (open && documentId) {
      fetchVersions()
    }
  }, [open, documentId])

  const fetchVersions = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await documentApi.getVersionHistory(documentId)
      setVersionData(data)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load version history')
      console.error('Error fetching versions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadVersion = async (versionId: UUID, fileName: string) => {
    setDownloading(versionId)
    try {
      const blob = await documentApi.downloadVersion(versionId)
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement('a')
      link.href = url
      link.download = fileName
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('Error downloading version:', err)
      setError('Failed to download version. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  const handleDeleteVersion = async (versionId: UUID) => {
    // Check if this is a virtual version (version 0 with empty GUID)
    if (versionId === '00000000-0000-0000-0000-000000000000') {
      setError('Cannot delete the original version (version 0). This is a virtual version preserved for history.')
      return
    }

    if (!window.confirm('Are you sure you want to delete this version?')) {
      return
    }

    setDeleting(versionId)
    setError(null) // Clear any previous errors

    try {
      // Delete the version
      await documentApi.deleteVersion(versionId)

      // Immediately remove from local state for instant UI update
      if (versionData) {
        setVersionData({
          ...versionData,
          versions: versionData.versions.filter(v => v.id !== versionId),
          totalVersions: versionData.totalVersions - 1
        })
      }

      // Then fetch the updated list from server to ensure consistency
      await fetchVersions()
    } catch (err: any) {
      console.error('Error deleting version:', err)
      setError(err.response?.data?.error || 'Failed to delete version. Cannot delete current version.')
      // Refresh the list to restore the correct state if deletion failed
      await fetchVersions()
    } finally {
      setDeleting(null)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon sx={{ color: '#7a9b76' }} />
          <Typography variant="h6" component="span">
            Version History
          </Typography>
        </Box>
        {versionData && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {versionData.documentName} - {versionData.totalVersions} version{versionData.totalVersions !== 1 ? 's' : ''}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress sx={{ color: '#7a9b76' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        ) : !versionData || versionData.versions.length === 0 ? (
          <Alert severity="info">No version history available</Alert>
        ) : (
          <List>
            {versionData.versions.map((version, index) => (
              <React.Fragment key={version.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    bgcolor: version.isCurrent ? '#f0f8f0' : 'transparent',
                    '&:hover': { bgcolor: version.isCurrent ? '#e8f5e8' : '#f5f5f5' },
                    cursor: onVersionSelected ? 'pointer' : 'default',
                  }}
                  onClick={() => onVersionSelected && !version.isCurrent && onVersionSelected(version.id)}
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadVersion(version.id, version.fileName)
                        }}
                        disabled={downloading === version.id}
                        title="Download this version"
                        sx={{ mr: allowDelete ? 1 : 0 }}
                      >
                        {downloading === version.id ? (
                          <CircularProgress size={24} sx={{ color: '#7a9b76' }} />
                        ) : (
                          <DownloadIcon />
                        )}
                      </IconButton>
                      {allowDelete && !version.isCurrent && version.id !== '00000000-0000-0000-0000-000000000000' && (
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteVersion(version.id)
                          }}
                          disabled={deleting === version.id}
                          title="Delete this version"
                          color="error"
                        >
                          {deleting === version.id ? (
                            <CircularProgress size={24} color="error" />
                          ) : (
                            <DeleteIcon />
                          )}
                        </IconButton>
                      )}
                    </Box>
                  }
                >
                  <ListItemIcon>
                    {version.isCurrent ? (
                      <CurrentIcon sx={{ color: '#7a9b76', fontSize: 32 }} />
                    ) : (
                      <DocumentIcon sx={{ color: '#999', fontSize: 32 }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: version.isCurrent ? 600 : 400 }}>
                          Version {version.versionNumber}
                        </Typography>
                        {version.isCurrent && (
                          <Chip
                            label="Current"
                            size="small"
                            sx={{
                              bgcolor: '#7a9b76',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {version.fileName} • {formatFileSize(version.fileSize)}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Uploaded by {version.uploaderName} on {new Date(version.uploadedAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                        {version.changeDescription && (
                          <Typography variant="caption" display="block" color="text.primary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                            "{version.changeDescription}"
                          </Typography>
                        )}
                      </Box>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#7a9b76' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
