import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Stack,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  NatureOutlined as SignatureIcon,
  Download as DownloadIcon,
} from '@mui/icons-material'
import SignatureCanvas from 'react-signature-canvas'
import { documentApi } from '@/services/group/documents'
import { type SignDocumentRequest, type DocumentDetailResponse } from '@/models/document'
import type { UUID } from '@/models/booking'

export default function SignDocument() {
  const { groupId, documentId } = useParams<{ groupId: string; documentId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sigPadRef = useRef<SignatureCanvas>(null)

  const [document, setDocument] = useState<DocumentDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState(false)

  const signingToken = searchParams.get('token')

  useEffect(() => {
    if (documentId && signingToken) {
      // Token will be validated when signing - no separate verify endpoint
      setTokenValid(true)
      fetchDocumentDetails()
      loadPreview()
    } else if (!signingToken) {
      setError('No signing token provided')
      setLoading(false)
    }
  }, [documentId, signingToken])

  const fetchDocumentDetails = async () => {
    if (!documentId) return

    try {
      const data = await documentApi.getDocumentById(documentId as UUID)
      setDocument(data)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load document'
      setError(errorMessage)
      console.error('Error fetching document:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadPreview = async () => {
    if (!documentId) return

    try {
      const blob = await documentApi.previewDocument(documentId as UUID)
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      setPreviewError(false)
    } catch (err: any) {
      // Preview might not be available for all file types or backend might have issues - this is not critical
      console.log('Preview not available:', err.response?.status === 500 ? 'Backend error generating preview' : err.message)
      setPreviewError(true)
      // Don't set error as preview is optional for signing
    }
  }

  const handleDownloadDocument = async () => {
    if (!documentId || !document) return

    try {
      const blob = await documentApi.downloadDocument(documentId as UUID)
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement('a')
      link.href = url
      link.download = document.fileName
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('Error downloading document:', err)
      setError('Failed to download document. Please try again.')
    }
  }

  const handleClearSignature = () => {
    sigPadRef.current?.clear()
  }

  const handleSign = async () => {
    if (!documentId || !signingToken) return

    if (sigPadRef.current?.isEmpty()) {
      setError('Please provide your signature')
      return
    }

    setSigning(true)
    setError(null)

    try {
      const signatureData = sigPadRef.current?.toDataURL() || ''

      // Get device and location info
      const deviceInfo = navigator.userAgent
      let location = undefined

      // Try to get geolocation (optional)
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: false,
            })
          })
          location = `${position.coords.latitude},${position.coords.longitude}`
        } catch (err) {
          console.log('Geolocation not available:', err)
        }
      }

      const request: SignDocumentRequest = {
        signatureData,
        signingToken,
        deviceInfo,
        location,
      }

      const result = await documentApi.signDocument(documentId as UUID, request)
      setSuccess(true)

      // Redirect after short delay
      setTimeout(() => {
        if (groupId) {
          navigate(`/groups/${groupId}/documents/${documentId}`)
        } else {
          navigate('/')
        }
      }, 2000)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to sign document'
      setError(errorMessage)
      console.error('Error signing document:', err)
    } finally {
      setSigning(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#7a9b76' }} />
      </Box>
    )
  }

  if (!tokenValid || !document) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Invalid signing link'}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          This signing link may have expired or is invalid. Please contact the document sender for a new link.
        </Typography>
      </Box>
    )
  }

  if (success) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: '#7a9b76', mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#7a9b76', mb: 2 }}>
          Document Signed Successfully!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Thank you for signing the document. You will be redirected shortly...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        {groupId && (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/groups/${groupId}/documents/${documentId}`)}
            sx={{ mb: 2 }}
          >
            Back to Document
          </Button>
        )}

        <Typography variant="h4" sx={{ fontWeight: 600, color: '#7a9b76', mb: 1 }}>
          Sign Document
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please review and sign the document below
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'grid', TemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Document Preview */}
        <Box>
          <Card sx={{ bgcolor: '#f5ebe0' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Document to Sign
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {document.fileName}
              </Typography>
              {previewUrl ? (
                <Box
                  sx={{
                    width: '100%',
                    height: '600px',
                    bgcolor: 'white',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <iframe
                    src={previewUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                    title="Document Preview"
                  />
                </Box>
              ) : previewError ? (
                <Box
                  sx={{
                    width: '100%',
                    minHeight: '400px',
                    bgcolor: 'white',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    p: 4,
                  }}
                >
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Preview Not Available
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
                    The document preview could not be loaded. You can download the document to review it before signing.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadDocument}
                    sx={{
                      bgcolor: '#7a9b76',
                      '&:hover': { bgcolor: '#6a8b66' },
                    }}
                  >
                    Download Document
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                    You can still sign this document below
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '400px',
                    bgcolor: 'white',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CircularProgress sx={{ color: '#7a9b76' }} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Signature Section */}
        <Box>
          <Card sx={{ bgcolor: '#f5ebe0' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Your Signature
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Please draw your signature in the box below
              </Typography>

              {/* Signature Pad */}
              <Paper
                sx={{
                  border: '2px solid #d0d0d0',
                  borderRadius: 1,
                  overflow: 'hidden',
                  mb: 2,
                }}
              >
                <SignatureCanvas
                  ref={sigPadRef}
                  canvasProps={{
                    width: 400,
                    height: 200,
                    className: 'signature-canvas',
                    style: {
                      width: '100%',
                      height: '200px',
                      backgroundColor: 'white',
                    },
                  }}
                  penColor="#000000"
                />
              </Paper>

              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  onClick={handleClearSignature}
                  disabled={signing}
                  sx={{ borderColor: '#7a9b76', color: '#7a9b76' }}
                >
                  Clear Signature
                </Button>

                <Button
                  variant="contained"
                  startIcon={<SignatureIcon />}
                  onClick={handleSign}
                  disabled={signing}
                  sx={{
                    bgcolor: '#7a9b76',
                    '&:hover': { bgcolor: '#6a8b66' },
                  }}
                >
                  {signing ? 'Signing...' : 'Sign Document'}
                </Button>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Typography variant="caption" color="text.secondary">
                By signing this document, you agree that your electronic signature is legally binding and
                has the same effect as a handwritten signature.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}
