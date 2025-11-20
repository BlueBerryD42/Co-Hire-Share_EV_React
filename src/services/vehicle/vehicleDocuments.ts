import { documentApi } from '@/services/group/documents'
import type { UUID } from '@/models/booking'
import type {
  DocumentListItemResponse,
  DocumentDetailResponse,
  DocumentQueryParameters,
  PaginatedDocumentListResponse,
  DocumentType,
} from '@/models/document'

/**
 * Vehicle Document Service
 * Uses group document APIs to manage vehicle-related documents
 * Documents are linked to vehicles via description metadata: [Vehicle: {vehicleId}]
 */
export const vehicleDocumentService = {
  /**
   * Upload a document for a vehicle
   * Documents are stored in the vehicle's group
   */
  async uploadVehicleDocument(
    groupId: UUID,
    vehicleId: UUID,
    file: File,
    documentType: 'Registration' | 'Insurance' | 'Image',
    description?: string
  ): Promise<DocumentDetailResponse> {
    // Map vehicle document types to API document types
    const apiDocumentType: DocumentType =
      documentType === 'Insurance'
        ? DocumentType.InsurancePolicy
        : DocumentType.Other

    // Add vehicle ID to description for filtering
    const fullDescription = `[Vehicle: ${vehicleId}] ${documentType}: ${description || file.name}`

    const uploadResponse = await documentApi.uploadDocument(
      groupId,
      file,
      apiDocumentType,
      fullDescription
    )

    // Fetch full document details
    return await documentApi.getDocumentById(uploadResponse.id)
  },

  /**
   * Get all documents for a vehicle
   * Filters group documents by vehicle ID in description
   * Supports both formats:
   * - New format: [Vehicle: {vehicleId}] {documentType}: ...
   * - Legacy format: {documentType}: ... (when vehicleId not in description)
   */
  async getVehicleDocuments(
    groupId: UUID,
    vehicleId: UUID,
    params?: DocumentQueryParameters
  ): Promise<DocumentListItemResponse[]> {
    const allDocuments = await documentApi.getGroupDocuments(groupId, {
      ...params,
      pageSize: params?.pageSize || 100, // Get more to filter client-side
    })

    // Filter documents that belong to this vehicle
    // Priority: Check for vehicle ID in description first
    // Fallback: Show vehicle-related document types (Registration, Insurance, Image)
    // if they don't have a vehicle ID tag (legacy documents)
    const vehicleDocuments = allDocuments.items.filter((doc) => {
      if (!doc.description) return false
      
      // New format: [Vehicle: {vehicleId}] ...
      if (doc.description.includes(`[Vehicle: ${vehicleId}]`)) {
        return true
      }
      
      // Legacy format: Check if it's a vehicle-related document type
      // Only include if it's Registration, Insurance, or Image type
      const isVehicleDocumentType = 
        doc.description.includes('Registration') ||
        doc.description.includes('Insurance') ||
        doc.description.includes('Image')
      
      // For legacy documents without vehicle ID, include them
      // (they might be for this vehicle but uploaded before the format change)
      if (isVehicleDocumentType && !doc.description.includes('[Vehicle:')) {
        return true
      }
      
      return false
    })

    return vehicleDocuments
  },

  /**
   * Get a specific vehicle document by ID
   */
  async getVehicleDocument(documentId: UUID): Promise<DocumentDetailResponse> {
    return await documentApi.getDocumentById(documentId)
  },

  /**
   * Download a vehicle document
   */
  async downloadVehicleDocument(documentId: UUID): Promise<Blob> {
    return await documentApi.downloadDocument(documentId)
  },

  /**
   * Preview a vehicle document
   */
  async previewVehicleDocument(documentId: UUID): Promise<Blob> {
    return await documentApi.previewDocument(documentId)
  },

  /**
   * Delete a vehicle document
   */
  async deleteVehicleDocument(documentId: UUID): Promise<void> {
    await documentApi.deleteDocument(documentId)
  },

  /**
   * Check if a document belongs to a vehicle
   */
  isVehicleDocument(document: DocumentListItemResponse | DocumentDetailResponse, vehicleId: UUID): boolean {
    if (!document.description) return false
    return document.description.includes(`[Vehicle: ${vehicleId}]`)
  },

  /**
   * Extract document type from description
   */
  getVehicleDocumentType(document: DocumentListItemResponse | DocumentDetailResponse): 'Registration' | 'Insurance' | 'Image' | 'Other' {
    if (!document.description) return 'Other'
    
    if (document.description.includes('Registration')) return 'Registration'
    if (document.description.includes('Insurance')) return 'Insurance'
    if (document.description.includes('Image')) return 'Image'
    
    return 'Other'
  },
}

export default vehicleDocumentService

