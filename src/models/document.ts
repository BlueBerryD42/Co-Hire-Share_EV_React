import type { UUID } from './booking'

// Enums
export enum DocumentType {
  OwnershipAgreement = 0,
  MaintenanceContract = 1,
  InsurancePolicy = 2,
  CheckInReport = 3,
  CheckOutReport = 4,
  Other = 5,
}

export enum SignatureStatus {
  Draft = 0,
  SentForSigning = 1,
  PartiallySigned = 2,
  FullySigned = 3,
  Expired = 4,
  Cancelled = 5,
}

export enum SigningMode {
  Parallel = 0,
  Sequential = 1,
}

// Request DTOs
export interface DocumentUploadRequest {
  groupId: UUID
  documentType: DocumentType
  description?: string
  file: File
}

export interface SendForSigningRequest {
  signerIds: UUID[]
  signingMode: SigningMode
  dueDate?: string
  message?: string
  tokenExpirationDays?: number
}

export interface SignDocumentRequest {
  signatureData: string
  signingToken: string
  deviceInfo?: string
  location?: string
}

export interface DocumentQueryParameters {
  page?: number
  pageSize?: number
  documentType?: DocumentType
  signatureStatus?: SignatureStatus
  searchTerm?: string
  sortBy?: string
  sortDescending?: boolean
  startDate?: string
  endDate?: string
}

// Response DTOs
export interface DocumentListItemResponse {
  id: UUID
  fileName: string
  type: DocumentType
  signatureStatus: SignatureStatus
  createdAt: string
  updatedAt: string
  fileSize: number
  uploaderName: string
  description?: string
  signatureCount: number
  signedCount: number
}

export interface DocumentDetailResponse {
  id: UUID
  groupId: UUID
  fileName: string
  filePath: string
  type: DocumentType
  signatureStatus: SignatureStatus
  createdAt: string
  updatedAt: string
  fileSize: number
  pageCount?: number
  uploaderId: UUID
  uploaderName: string
  description?: string
  author?: string
  isVirusScanned: boolean
  virusScanResult?: string
  tags?: string[]
}

export interface DocumentSignatureStatusResponse {
  documentId: UUID
  status: SignatureStatus
  signingMode: SigningMode
  totalSigners: number
  signedCount: number
  progressPercentage: number
  dueDate?: string
  expiresAt?: string
  signatures: SignatureDetailResponse[]
}

export interface SignatureDetailResponse {
  id: UUID
  documentId: UUID
  signerId: UUID
  signerName: string
  signerEmail: string
  status: SignatureStatus
  signatureOrder: number
  signedAt?: string
  signatureData?: string
  ipAddress?: string
  deviceInfo?: string
  isCurrentSigner: boolean
  isPending: boolean
}

export interface DocumentUploadResponse {
  documentId: UUID
  fileName: string
  fileSize: number
  uploadedAt: string
  message: string
}

export interface SendForSigningResponse {
  documentId: UUID
  status: SignatureStatus
  totalSigners: number
  message: string
  signingTokens: Record<UUID, string>
}

export interface SignDocumentResponse {
  documentId: UUID
  signatureId: UUID
  signerName: string
  signedAt: string
  status: SignatureStatus
  isComplete: boolean
  nextSignerId?: UUID
  message: string
}

export interface PaginatedDocumentListResponse {
  items: DocumentListItemResponse[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

// Helper functions
export const getDocumentTypeName = (type: DocumentType): string => {
  const names: Record<DocumentType, string> = {
    [DocumentType.OwnershipAgreement]: 'Ownership Agreement',
    [DocumentType.MaintenanceContract]: 'Maintenance Contract',
    [DocumentType.InsurancePolicy]: 'Insurance Policy',
    [DocumentType.CheckInReport]: 'Check-In Report',
    [DocumentType.CheckOutReport]: 'Check-Out Report',
    [DocumentType.Other]: 'Other',
  }
  return names[type] || 'Unknown'
}

export const getDocumentTypeColor = (type: DocumentType): string => {
  const colors: Record<DocumentType, string> = {
    [DocumentType.OwnershipAgreement]: '#7a9b76',
    [DocumentType.MaintenanceContract]: '#6b9bd1',
    [DocumentType.InsurancePolicy]: '#d4a574',
    [DocumentType.CheckInReport]: '#8b7d6b',
    [DocumentType.CheckOutReport]: '#8b7d6b',
    [DocumentType.Other]: '#999999',
  }
  return colors[type] || '#999999'
}

export const getSignatureStatusName = (status: SignatureStatus): string => {
  const names: Record<SignatureStatus, string> = {
    [SignatureStatus.Draft]: 'Draft',
    [SignatureStatus.SentForSigning]: 'Pending',
    [SignatureStatus.PartiallySigned]: 'Partially Signed',
    [SignatureStatus.FullySigned]: 'Signed',
    [SignatureStatus.Expired]: 'Expired',
    [SignatureStatus.Cancelled]: 'Cancelled',
  }
  return names[status] || 'Unknown'
}

export const getSignatureStatusColor = (status: SignatureStatus): string => {
  const colors: Record<SignatureStatus, string> = {
    [SignatureStatus.Draft]: '#999999',
    [SignatureStatus.SentForSigning]: '#d4a574',
    [SignatureStatus.PartiallySigned]: '#d4a574',
    [SignatureStatus.FullySigned]: '#7a9b76',
    [SignatureStatus.Expired]: '#b87d6f',
    [SignatureStatus.Cancelled]: '#b87d6f',
  }
  return colors[status] || '#999999'
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export const getFileIcon = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase()

  const icons: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    png: '🖼️',
    jpg: '🖼️',
    jpeg: '🖼️',
    gif: '🖼️',
    zip: '📦',
    rar: '📦',
  }

  return icons[extension || ''] || '📄'
}
