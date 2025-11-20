/**
 * KYC Document Types - matching backend enum
 */
export enum KycDocumentType {
  NationalId = 0, // CMND/CCCD
  Passport = 1,
  DriverLicense = 2,
  ProofOfAddress = 3,
  BankStatement = 4,
  Other = 5, // For selfie verification
}

/**
 * KYC Document Status - matching backend enum
 */
export enum KycDocumentStatus {
  Pending = 0,
  UnderReview = 1,
  Approved = 2,
  Rejected = 3,
  RequiresUpdate = 4,
}

/**
 * KYC Document DTO from backend
 */
export interface KycDocumentDto {
  id: string;
  userId: string;
  userName: string;
  documentType: KycDocumentType;
  fileName: string;
  storageUrl: string;
  status: KycDocumentStatus;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewerName?: string;
  reviewedAt?: string;
  uploadedAt: string;
}

/**
 * Upload KYC Document Request
 */
export interface UploadKycDocumentRequest {
  documentType: KycDocumentType;
  fileName: string;
  base64Content: string;
  notes?: string;
}

/**
 * Step configuration for KYC wizard
 */
export interface KycStep {
  id: number;
  title: string;
  description: string;
  documentType: KycDocumentType;
  required: boolean;
  fileNamePrefix: string;
}
