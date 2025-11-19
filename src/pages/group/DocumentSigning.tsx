import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  Paper,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
  Clear as ClearIcon,
} from '@mui/icons-material'
import SignatureCanvas from 'react-signature-canvas'
import { documentApi } from '@/services/group/documents'
import type { UUID } from '@/models/booking'
import type { SignDocumentRequest, SignDocumentResponse } from '@/models/document'

const steps = ['Review Document', 'Agree to Terms', 'Sign Document', 'Verify Identity', 'Confirm']

export default function DocumentSigning() {
  const { groupId, documentId } = useParams<{ groupId: string; documentId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const signingToken = searchParams.get('token') || ''

  // State
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  // Step 1: Document Review
  const [hasReadDocument, setHasReadDocument] = useState(false)
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false)

  // Step 2: Terms Agreement
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToLegal, setAgreedToLegal] = useState(false)

  // Step 3: Signature
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw')
  const [typedSignature, setTypedSignature] = useState('')
  const sigPadRef = useRef<SignatureCanvas>(null)

  // Step 4: Identity Verification
  const [verificationPin, setVerificationPin] = useState('')

  // Step 5: Result
  const [signResult, setSignResult] = useState<SignDocumentResponse | null>(null)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)

  // Token verification
  const [tokenData, setTokenData] = useState<{
    isValid: boolean
    documentName: string
    signerName: string
    expiresAt: string
  } | null>(null)

  useEffect(() => {
    if (documentId && signingToken) {
      verifyToken()
      loadPdfPreview()
    } else {
      setError('Invalid signing link')
      setLoading(false)
    }
  }, [documentId, signingToken])

  const verifyToken = async () => {
    if (!documentId) return

    setLoading(true)
    setError(null)

    try {
      const data = await documentApi.verifySigningToken(documentId as UUID, signingToken)
      if (!data.isValid) {
        setError('This signing link is invalid or has expired')
      } else {
        setTokenData(data)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify signing link')
    } finally {
      setLoading(false)
    }
  }

  const loadPdfPreview = async () => {
    if (!documentId) return

    try {
      const blob = await documentApi.previewDocument(documentId as UUID)
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
    } catch (err: any) {
      console.error('Error loading PDF preview:', err)
    }
  }

  const handleNext = () => {
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isBottom = scrollHeight - scrollTop <= clientHeight + 50
    if (isBottom && !isScrolledToBottom) {
      setIsScrolledToBottom(true)
      setHasReadDocument(true)
    }
  }

  const clearSignature = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear()
    }
  }

  const getSignatureData = (): string => {
    if (signatureMode === 'draw') {
      return sigPadRef.current?.toDataURL() || ''
    } else {
      // Convert typed signature to canvas and return as data URL
      const canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = 200
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#6b5a4d'
        ctx.font = '48px "Brush Script MT", cursive'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2)
      }
      return canvas.toDataURL()
    }
  }

  const handleSubmitSignature = async () => {
    if (!documentId) return

    const signatureData = getSignatureData()
    if (!signatureData) {
      setError('Please provide your signature')
      return
    }

    if (!verificationPin || verificationPin.length < 4) {
      setError('Please enter a valid verification PIN')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const request: SignDocumentRequest = {
        signatureData,
        signingToken,
        deviceInfo: navigator.userAgent,
      }

      const result = await documentApi.signDocument(documentId as UUID, request)
      setSignResult(result)
      setSuccessDialogOpen(true)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to sign document')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadSignedDocument = async () => {
    if (!documentId || !tokenData) return

    try {
      const blob = await documentApi.downloadDocument(documentId as UUID)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = tokenData.documentName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to download document')
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        // Step 1: Review Document
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Please review the document carefully
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Scroll to the bottom of the document to proceed
            </Alert>
            <Box
              sx={{
                height: 500,
                overflow: 'auto',
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                bgcolor: '#f5f5f5',
              }}
              onScroll={handleScroll}
            >
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  title="Document Preview"
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              )}
            </Box>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <FormControlLabel
                control={<Checkbox checked={hasReadDocument} disabled />}
                label="I have read the entire document"
              />
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!hasReadDocument}
                sx={{ bgcolor: '#7a9b76', '&:hover': { bgcolor: '#6a8b66' } }}
              >
                Continue
              </Button>
            </Box>
          </Box>
        )

      case 1:
        // Step 2: Agree to Terms
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Terms and Conditions
            </Typography>
            <Card sx={{ mb: 2, bgcolor: '#f5f5f5' }}>
              <CardContent>
                <Typography variant="body2" paragraph>
                  By signing this document electronically, you agree that:
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body2">
                      Your electronic signature is legally binding and has the same effect as a handwritten signature
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      You have reviewed the document in its entirety and understand its contents
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      You consent to conduct this transaction electronically
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Your signature, IP address, and device information will be recorded for audit purposes
                    </Typography>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
              }
              label="I agree to the terms and conditions of electronic signature"
            />
            <br />
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreedToLegal}
                  onChange={(e) => setAgreedToLegal(e.target.checked)}
                />
              }
              label="I confirm that I am authorized to sign this document on behalf of all relevant parties"
            />
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!agreedToTerms || !agreedToLegal}
                sx={{ bgcolor: '#7a9b76', '&:hover': { bgcolor: '#6a8b66' } }}
              >
                Continue
              </Button>
            </Box>
          </Box>
        )

      case 2:
        // Step 3: Sign Document
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Sign the Document
            </Typography>
            <Tabs
              value={signatureMode}
              onChange={(e, newValue) => setSignatureMode(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label="Draw Signature" value="draw" />
              <Tab label="Type Signature" value="type" />
            </Tabs>

            {signatureMode === 'draw' ? (
              <Box>
                <Paper
                  sx={{
                    border: '2px solid #7a9b76',
                    borderRadius: 2,
                    p: 2,
                    bgcolor: 'white',
                  }}
                >
                  <SignatureCanvas
                    ref={sigPadRef}
                    canvasProps={{
                      width: 600,
                      height: 200,
                      style: {
                        background: 'white',
                        backgroundImage:
                          'repeating-linear-gradient(0deg, #f0f0f0, #f0f0f0 1px, transparent 1px, transparent 100%)',
                        backgroundSize: '100% 50px',
                      },
                    }}
                    penColor="#6b5a4d"
                  />
                </Paper>
                <Box sx={{ mt: 2 }}>
                  <Button
                    startIcon={<ClearIcon />}
                    onClick={clearSignature}
                    variant="outlined"
                    sx={{ borderColor: '#7a9b76', color: '#7a9b76' }}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <TextField
                  fullWidth
                  label="Type your full name"
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  placeholder="John Doe"
                  sx={{ mb: 2 }}
                  inputProps={{
                    style: {
                      fontSize: '2rem',
                      fontFamily: '"Brush Script MT", cursive',
                    },
                  }}
                />
                <Paper
                  sx={{
                    border: '2px solid #7a9b76',
                    borderRadius: 2,
                    p: 4,
                    bgcolor: 'white',
                    minHeight: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '3rem',
                      fontFamily: '"Brush Script MT", cursive',
                      color: '#6b5a4d',
                    }}
                  >
                    {typedSignature || 'Your signature will appear here'}
                  </Typography>
                </Paper>
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={
                  signatureMode === 'draw'
                    ? !sigPadRef.current || sigPadRef.current.isEmpty()
                    : !typedSignature
                }
                sx={{ bgcolor: '#7a9b76', '&:hover': { bgcolor: '#6a8b66' } }}
              >
                Continue
              </Button>
            </Box>
          </Box>
        )

      case 3:
        // Step 4: Verify Identity
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Verify Your Identity
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              For security purposes, please enter a 4-digit PIN to verify your identity. This PIN will be used
              to authenticate your signature.
            </Alert>
            <TextField
              fullWidth
              label="Enter 4-digit PIN"
              type="password"
              value={verificationPin}
              onChange={(e) => setVerificationPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="0000"
              inputProps={{
                maxLength: 4,
                pattern: '[0-9]*',
              }}
              sx={{ mb: 2 }}
            />
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={verificationPin.length !== 4}
                sx={{ bgcolor: '#7a9b76', '&:hover': { bgcolor: '#6a8b66' } }}
              >
                Continue
              </Button>
            </Box>
          </Box>
        )

      case 4:
        // Step 5: Confirm and Submit
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Confirm Your Signature
            </Typography>
            <Alert severity="warning" sx={{ mb: 3 }}>
              Please review your information before submitting. Once submitted, your signature cannot be changed.
            </Alert>
            <Card sx={{ mb: 2, bgcolor: '#f5f5f5' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Document
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {tokenData?.documentName}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Signer
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {tokenData?.signerName}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Signature Preview
                </Typography>
                <Box
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    p: 2,
                    bgcolor: 'white',
                    mt: 1,
                  }}
                >
                  {signatureMode === 'draw' ? (
                    <img
                      src={sigPadRef.current?.toDataURL()}
                      alt="Signature"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  ) : (
                    <Typography
                      sx={{
                        fontSize: '2rem',
                        fontFamily: '"Brush Script MT", cursive',
                        color: '#6b5a4d',
                      }}
                    >
                      {typedSignature}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack} disabled={loading}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmitSignature}
                disabled={loading}
                sx={{ bgcolor: '#7a9b76', '&:hover': { bgcolor: '#6a8b66' } }}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Signature'}
              </Button>
            </Box>
          </Box>
        )

      default:
        return null
    }
  }

  if (loading && !tokenData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#7a9b76' }} />
      </Box>
    )
  }

  if (error && !tokenData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/home/groups/${groupId}/documents`)}
          sx={{ mt: 2 }}
        >
          Back to Documents
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(`/home/groups/${groupId}/documents/${documentId}`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ mt: 2, fontWeight: 600, color: '#7a9b76' }}>
          Sign Document
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {tokenData?.documentName}
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Card sx={{ bgcolor: '#f5ebe0' }}>
        <CardContent sx={{ p: 4 }}>{renderStepContent()}</CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: '#7a9b76', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Document Signed Successfully!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
            {signResult?.message}
          </Typography>
          {signResult?.isComplete ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              All signatures have been collected. The document is now fully executed.
            </Alert>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              Waiting for additional signatures. The document will be complete once all parties have signed.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadSignedDocument}
            sx={{ borderColor: '#7a9b76', color: '#7a9b76' }}
          >
            Download Document
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate(`/home/groups/${groupId}/documents`)}
            sx={{ bgcolor: '#7a9b76', '&:hover': { bgcolor: '#6a8b66' } }}
          >
            Back to Documents
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
