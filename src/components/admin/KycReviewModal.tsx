import { useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { KycDocumentType } from "@/models/kyc";

interface Document {
  id: string;
  documentType: string;
  fileName: string;
  status: string;
  storageUrl: string;
  uploadedAt: string;
  reviewNotes?: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  kycStatus: string;
  documents: Document[];
}

interface KycReviewModalProps {
  user: User;
  onClose: () => void;
  onReview: (
    documentId: string,
    status: string,
    notes: string
  ) => Promise<void>;
  onBulkReview?: (
    documentIds: string[],
    status: string,
    notes: string
  ) => Promise<void>;
}

const KycReviewModal = ({
  user,
  onClose,
  onReview,
  onBulkReview,
}: KycReviewModalProps) => {
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(
    new Set()
  );
  const [reviewStatus, setReviewStatus] = useState<string>("");
  const [reviewNotes, setReviewNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleDocumentToggle = (documentId: string) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(documentId)) {
      newSelected.delete(documentId);
    } else {
      newSelected.add(documentId);
    }
    setSelectedDocuments(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedDocuments.size === user.documents.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(user.documents.map((doc) => doc.id)));
    }
  };

  // Convert status string to enum number
  // KycDocumentStatus: Pending=0, UnderReview=1, Approved=2, Rejected=3, RequiresUpdate=4
  const convertStatusToEnum = (status: string): number => {
    switch (status) {
      case "Approved":
        return 2; // Approved
      case "Rejected":
        return 3; // Rejected
      case "RequiresUpdate":
        return 4; // RequiresUpdate
      default:
        return 0; // Pending (fallback)
    }
  };

  const handleSubmit = async () => {
    if (!reviewStatus) {
      setSnackbar({
        open: true,
        message: "Vui lòng chọn trạng thái review",
        severity: "error",
      });
      return;
    }

    if (selectedDocuments.size === 0) {
      setSnackbar({
        open: true,
        message: "Vui lòng chọn ít nhất một tài liệu",
        severity: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert status string to enum number
      const statusEnum = convertStatusToEnum(reviewStatus);

      if (selectedDocuments.size === 1 && onReview) {
        const documentId = Array.from(selectedDocuments)[0];
        await onReview(documentId, statusEnum.toString(), reviewNotes);
      } else if (selectedDocuments.size > 1 && onBulkReview) {
        await onBulkReview(
          Array.from(selectedDocuments),
          statusEnum.toString(),
          reviewNotes
        );
      }
      onClose();
    } catch (error) {
      console.error("Error reviewing documents:", error);
      setSnackbar({
        open: true,
        message: "Không thể review tài liệu. Vui lòng thử lại.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatStatus = (status: string | number | undefined | null): string => {
    if (status === null || status === undefined) return "Unknown";

    const statusStr = String(status);

    // Handle enum values - KycStatus enum: Pending=0, InReview=1, Approved=2, Rejected=3
    // KycDocumentStatus enum: Pending=0, UnderReview=1, Approved=2, Rejected=3, RequiresUpdate=4
    const statusMap: Record<string, string> = {
      // KycStatus enum values (user-level)
      "0": "Pending",
      "1": "In Review",
      "2": "Approved",
      "3": "Rejected",
      // KycDocumentStatus enum values (document-level)
      "4": "Requires Update",
      // String values (case-insensitive matching)
      pending: "Pending",
      inreview: "In Review",
      underreview: "Under Review",
      approved: "Approved",
      rejected: "Rejected",
      requiresupdate: "Requires Update",
      // Original enum names
      Pending: "Pending",
      InReview: "In Review",
      UnderReview: "Under Review",
      Approved: "Approved",
      Rejected: "Rejected",
      RequiresUpdate: "Requires Update",
    };

    // Try exact match first
    if (statusMap[statusStr]) {
      return statusMap[statusStr];
    }

    // Try case-insensitive match
    const lowerStatus = statusStr.toLowerCase();
    for (const [key, value] of Object.entries(statusMap)) {
      if (key.toLowerCase() === lowerStatus) {
        return value;
      }
    }

    return statusStr; // Return original if no match found
  };

  const getStatusBadgeVariant = (
    status: string | number | undefined | null
  ) => {
    if (status === null || status === undefined) return "default";

    // Convert to string and normalize
    const statusStr = String(status).toLowerCase().replace(/\s+/g, "");

    switch (statusStr) {
      // KycStatus: Pending=0, InReview=1, Approved=2, Rejected=3
      // KycDocumentStatus: Pending=0, UnderReview=1, Approved=2, Rejected=3, RequiresUpdate=4
      case "pending":
      case "0": // Pending
        return "warning";
      case "inreview":
      case "underreview":
      case "1": // InReview/UnderReview
        return "default";
      case "approved":
      case "2": // Approved
        return "success";
      case "rejected":
      case "3": // Rejected
        return "error";
      case "requiresupdate":
      case "4": // RequiresUpdate
        return "warning";
      default:
        return "default";
    }
  };

  // Convert document type (number or string) to readable name
  const getDocumentTypeName = (
    type: string | number | undefined | null
  ): string => {
    if (type === null || type === undefined) return "Unknown";

    // Normalize to number
    let typeNum: number;
    if (typeof type === "number") {
      typeNum = type;
    } else if (typeof type === "string") {
      // Try to parse as number first
      const parsed = parseInt(type, 10);
      if (!isNaN(parsed)) {
        typeNum = parsed;
      } else {
        // Try to convert from string name to enum
        const typeMap: Record<string, number> = {
          NationalId: KycDocumentType.NationalId,
          Passport: KycDocumentType.Passport,
          DriverLicense: KycDocumentType.DriverLicense,
          ProofOfAddress: KycDocumentType.ProofOfAddress,
          BankStatement: KycDocumentType.BankStatement,
          Other: KycDocumentType.Other,
        };
        typeNum = typeMap[type] ?? -1;
      }
    } else {
      return "Unknown";
    }

    // Map number to readable name
    const typeNames: Record<number, string> = {
      [KycDocumentType.NationalId]: "CMND/CCCD",
      [KycDocumentType.Passport]: "Passport",
      [KycDocumentType.DriverLicense]: "Driver License",
      [KycDocumentType.ProofOfAddress]: "Proof of Address",
      [KycDocumentType.BankStatement]: "Bank Statement",
      [KycDocumentType.Other]: "Selfie", // Other (used for selfie verification)
    };

    return typeNames[typeNum] || `Type ${typeNum}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800">
                Review KYC Documents
              </h2>
              <p className="text-neutral-600 mt-1">
                {user.firstName} {user.lastName} ({user.email})
              </p>
            </div>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>

          {/* User Info */}
          <div className="mb-6 p-4 bg-neutral-50 rounded-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-600">KYC Status</p>
                <Badge variant={getStatusBadgeVariant(user.kycStatus)}>
                  {formatStatus(user.kycStatus)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Documents</p>
                <p className="text-lg font-semibold text-neutral-800">
                  {user.documents.length}
                </p>
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-800">
                Documents
              </h3>
              <Button variant="secondary" size="sm" onClick={handleSelectAll}>
                {selectedDocuments.size === user.documents.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <div className="space-y-3">
              {user.documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`border rounded-md p-4 cursor-pointer transition-colors ${
                    selectedDocuments.has(doc.id)
                      ? "border-primary-600 bg-primary-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                  onClick={() => handleDocumentToggle(doc.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.has(doc.id)}
                        onChange={() => handleDocumentToggle(doc.id)}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-neutral-800">
                          {getDocumentTypeName(doc.documentType)}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {doc.fileName}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Uploaded:{" "}
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(doc.status)}>
                      {formatStatus(doc.status)}
                    </Badge>
                  </div>
                  {doc.reviewNotes && (
                    <div className="mt-2 p-2 bg-neutral-100 rounded text-sm text-neutral-700">
                      <strong>Previous Notes:</strong> {doc.reviewNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Review Form */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">
              Review Action
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Status
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select status...</option>
                  <option value="Approved">Approve</option>
                  <option value="Rejected">Reject</option>
                  <option value="RequiresUpdate">Requires Update</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Review Notes{" "}
                  <span className="text-neutral-500">
                    ({reviewNotes.length}/1000)
                  </span>
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => {
                    if (e.target.value.length <= 1000) {
                      setReviewNotes(e.target.value);
                    }
                  }}
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter review notes (optional)"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={
                isSubmitting || !reviewStatus || selectedDocuments.size === 0
              }
            >
              {isSubmitting
                ? "Submitting..."
                : selectedDocuments.size > 1
                ? `Review ${selectedDocuments.size} Documents`
                : "Review Document"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default KycReviewModal;
