import { createApiClient, API_GATEWAY_URL } from '@/services/api'
import axios from 'axios'
import Cookies from 'js-cookie'
import type {
  UUID,
} from '@/models/booking'
import {
  DocumentType,
  type DocumentDetailResponse,
  type DocumentListItemResponse,
  type DocumentSignatureStatusResponse,
  type DocumentUploadResponse,
  type SendForSigningRequest,
  type SendForSigningResponse,
  type SignDocumentRequest,
  type SignDocumentResponse,
  type DocumentQueryParameters,
  type PaginatedDocumentListResponse,
  type PendingSignatureResponse,
} from '@/models/document'

const http = createApiClient('/api/document')

export const documentApi = {
  // Upload document
  async uploadDocument(
    groupId: UUID,
    file: File,
    documentType: DocumentType,
    description?: string
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData()
    formData.append('File', file)
    formData.append('GroupId', groupId)
    formData.append('DocumentType', documentType) // Now it's a string enum value
    if (description) {
      formData.append('Description', description)
    }

    // Get auth token
    const cookieToken = Cookies.get('auth_token')
    const localStorageToken = localStorage.getItem('accessToken')
    const token = cookieToken || localStorageToken

    // Use raw axios instance to avoid default Content-Type: application/json
    const { data } = await axios.post<DocumentUploadResponse>(
      `${API_GATEWAY_URL}/api/document/upload`,
      formData,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        timeout: 30000,
      }
    )
    return data
  },

  // Get document by ID
  async getDocumentById(documentId: UUID): Promise<DocumentDetailResponse> {
    const { data } = await http.get<DocumentDetailResponse>(`/${documentId}`)
    return data
  },

  // Get group documents with pagination and filters
  async getGroupDocuments(
    groupId: UUID,
    params?: DocumentQueryParameters
  ): Promise<PaginatedDocumentListResponse> {
    const { data } = await http.get<PaginatedDocumentListResponse>(`/group/${groupId}/paginated`, {
      params,
    })
    return data
  },

  // Get user's documents across all groups
  async getUserDocuments(params?: DocumentQueryParameters): Promise<PaginatedDocumentListResponse> {
    const { data } = await http.get<PaginatedDocumentListResponse>('/my-documents', {
      params,
    })
    return data
  },

  // Download document
  async downloadDocument(documentId: UUID): Promise<Blob> {
    const { data } = await http.get<Blob>(`/${documentId}/download`, {
      responseType: 'blob',
    })
    return data
  },

  // Preview document (for PDF viewer)
  async previewDocument(documentId: UUID): Promise<Blob> {
    const { data } = await http.get<Blob>(`/${documentId}/preview`, {
      responseType: 'blob',
    })
    return data
  },

  // Delete document
  async deleteDocument(documentId: UUID): Promise<void> {
    await http.delete(`/${documentId}`)
  },

  // Update document metadata
  async updateDocument(
    documentId: UUID,
    updates: {
      description?: string
      tags?: string[]
    }
  ): Promise<DocumentDetailResponse> {
    const { data } = await http.put<DocumentDetailResponse>(`/${documentId}`, updates)
    return data
  },

  // Send document for signing
  async sendForSigning(
    documentId: UUID,
    request: SendForSigningRequest
  ): Promise<SendForSigningResponse> {
    const { data } = await http.post<SendForSigningResponse>(
      `/${documentId}/send-for-signing`,
      request
    )
    return data
  },

  // Get signature status
  async getSignatureStatus(documentId: UUID): Promise<DocumentSignatureStatusResponse> {
    const { data } = await http.get<DocumentSignatureStatusResponse>(`/${documentId}/signatures`)
    return data
  },

  // Get my pending signatures
  async getMyPendingSignatures(): Promise<PendingSignatureResponse[]> {
    const { data } = await http.get<PendingSignatureResponse[]>('/my-pending-signatures')
    return data
  },

  // Sign document
  async signDocument(documentId: UUID, request: SignDocumentRequest): Promise<SignDocumentResponse> {
    const { data } = await http.post<SignDocumentResponse>(`/${documentId}/sign`, request)
    return data
  },

  // Cancel signature request
  async cancelSignatureRequest(documentId: UUID, reason?: string): Promise<void> {
    await http.post(`/${documentId}/cancel-signing`, { reason })
  },

  // Remind signers
  async remindSigners(documentId: UUID, signerIds?: UUID[]): Promise<void> {
    await http.post(`/${documentId}/remind-signers`, { signerIds })
  },

  // Get document version history
  async getVersionHistory(documentId: UUID): Promise<DocumentListItemResponse[]> {
    const { data } = await http.get<DocumentListItemResponse[]>(`/${documentId}/versions`)
    return data
  },

  // Upload new version
  async uploadNewVersion(
    documentId: UUID,
    file: File,
    description?: string
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    if (description) {
      formData.append('description', description)
    }

    const { data } = await http.post<DocumentUploadResponse>(
      `/${documentId}/new-version`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return data
  },

  // Get audit trail
  async getAuditTrail(documentId: UUID): Promise<
    Array<{
      id: UUID
      documentId: UUID
      userId: UUID
      userName: string
      action: string
      details: string
      timestamp: string
      ipAddress: string
    }>
  > {
    const { data } = await http.get<
      Array<{
        id: UUID
        documentId: UUID
        userId: UUID
        userName: string
        action: string
        details: string
        timestamp: string
        ipAddress: string
      }>
    >(`/${documentId}/audit-trail`)
    return data
  },
}
