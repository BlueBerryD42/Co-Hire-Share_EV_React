import { useEffect, useState } from "react";
import { adminApi } from "@/utils/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/Loading";
import DocumentViewer from "@/components/admin/DocumentViewer";
import KycReviewModal from "@/components/admin/KycReviewModal";

interface Document {
  id: string;
  userId: string;
  userName: string;
  documentType: string;
  fileName: string;
  storageUrl: string;
  status: string;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  uploadedAt: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  kycStatus: string;
  submittedAt: string;
  documents: Document[];
}

interface FilterParams extends Record<string, unknown> {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  documentType?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDirection?: string;
}

const KycDocumentReview = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("UploadedAt");
  const [sortDirection, setSortDirection] = useState<string>("desc");

  useEffect(() => {
    fetchPendingKycUsers();
  }, [currentPage, statusFilter, documentTypeFilter, sortBy, sortDirection]);

  const buildFilterParams = (): FilterParams => {
    const params: FilterParams = {
      page: currentPage,
      pageSize: 20,
      sortBy,
      sortDirection,
    };

    if (searchTerm) params.search = searchTerm;
    if (statusFilter) params.status = statusFilter;
    if (documentTypeFilter) params.documentType = documentTypeFilter;

    return params;
  };

  const fetchPendingKycUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = buildFilterParams();
      const response = await adminApi.getPendingKycUsers(
        params as Record<string, unknown>
      );
      const data = response.data;
      setUsers(data.users || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error("Error fetching pending KYC users:", err);
      setError("Failed to load pending KYC users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPendingKycUsers();
  };

  const handleReviewDocument = async (
    documentId: string,
    status: string,
    notes: string
  ) => {
    try {
      await adminApi.reviewKycDocument(documentId, {
        status,
        reviewNotes: notes,
      });
      await fetchPendingKycUsers();
      if (selectedUser) {
        // Refresh selected user data
        const updatedUser = users.find((u) => u.id === selectedUser.id);
        if (updatedUser) setSelectedUser(updatedUser);
      }
      setShowReviewModal(false);
      alert("Document reviewed successfully");
    } catch (err) {
      console.error("Error reviewing document:", err);
      alert("Failed to review document");
      throw err;
    }
  };

  const handleBulkReview = async (
    documentIds: string[],
    status: string,
    notes: string
  ) => {
    try {
      await adminApi.bulkReviewKycDocuments({
        documentIds,
        status,
        reviewNotes: notes,
      });
      await fetchPendingKycUsers();
      setShowReviewModal(false);
      alert(`Successfully reviewed ${documentIds.length} documents`);
    } catch (err) {
      console.error("Error bulk reviewing documents:", err);
      alert("Failed to review documents");
      throw err;
    }
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      const response = await adminApi.downloadKycDocument(doc.id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading document:", err);
      alert("Failed to download document");
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

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-accent-terracotta/20 border border-accent-terracotta rounded-md p-4">
          <p className="text-accent-terracotta">{error}</p>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="UnderReview">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="RequiresUpdate">Requires Update</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Document Type
            </label>
            <select
              value={documentTypeFilter}
              onChange={(e) => {
                setDocumentTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Types</option>
              <option value="NationalId">National ID</option>
              <option value="Passport">Passport</option>
              <option value="DriverLicense">Driver License</option>
              <option value="ProofOfAddress">Proof of Address</option>
              <option value="BankStatement">Bank Statement</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="primary" onClick={handleSearch} className="w-full">
              Search
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users List */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neutral-800">
              Pending Reviews ({totalCount})
            </h3>
            <div className="flex items-center gap-2">
              <select
                value={`${sortBy}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split("-");
                  setSortBy(field);
                  setSortDirection(direction);
                  setCurrentPage(1);
                }}
                className="px-2 py-1 text-sm border border-neutral-300 rounded"
              >
                <option value="UploadedAt-desc">Newest First</option>
                <option value="UploadedAt-asc">Oldest First</option>
                <option value="FileName-asc">File Name A-Z</option>
                <option value="FileName-desc">File Name Z-A</option>
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-600">No pending KYC reviews</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`border rounded-md p-4 cursor-pointer transition-colors ${
                      selectedUser?.id === user.id
                        ? "border-primary-600 bg-primary-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-neutral-800">
                        {user.firstName} {user.lastName}
                      </h4>
                      <Badge variant={getStatusBadgeVariant(user.kycStatus)}>
                        {formatStatus(user.kycStatus)}
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">
                      {user.email}
                    </p>
                    <p className="text-xs text-neutral-600 mb-2">
                      Submitted:{" "}
                      {new Date(user.submittedAt).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {user.documents?.map((doc) => (
                        <Badge
                          key={doc.id}
                          variant={getStatusBadgeVariant(doc.status)}
                        >
                          {doc.documentType}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200">
                  <p className="text-sm text-neutral-600">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Document Review Panel */}
        {selectedUser ? (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-800">
                Review Documents
              </h3>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowReviewModal(true)}
              >
                Review All
              </Button>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-neutral-50 rounded-md">
                <p className="font-medium text-neutral-800">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <p className="text-sm text-neutral-600">{selectedUser.email}</p>
                <p className="text-xs text-neutral-500 mt-1">
                  KYC Status: {selectedUser.kycStatus}
                </p>
              </div>

              <div className="space-y-3">
                {selectedUser.documents?.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-neutral-200 rounded-md p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-neutral-800">
                        {doc.documentType}
                      </h4>
                      <Badge variant={getStatusBadgeVariant(doc.status)}>
                        {formatStatus(doc.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">
                      {doc.fileName}
                    </p>
                    <p className="text-xs text-neutral-500 mb-3">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                    {doc.reviewNotes && (
                      <div className="mb-3 p-2 bg-neutral-100 rounded text-sm text-neutral-700">
                        <strong>Review Notes:</strong> {doc.reviewNotes}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setViewingDocument(doc)}
                      >
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc)}
                      >
                        Download
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setShowReviewModal(true);
                        }}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="text-center py-12">
              <p className="text-neutral-600">
                Select a user to review their documents
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Document Viewer */}
      {viewingDocument && (
        <DocumentViewer
          documentUrl={viewingDocument.storageUrl}
          fileName={viewingDocument.fileName}
          documentId={viewingDocument.id}
          onClose={() => setViewingDocument(null)}
          onDownload={() => handleDownloadDocument(viewingDocument)}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && selectedUser && (
        <KycReviewModal
          user={{
            id: selectedUser.id,
            email: selectedUser.email,
            firstName: selectedUser.firstName,
            lastName: selectedUser.lastName,
            kycStatus: selectedUser.kycStatus,
            documents: selectedUser.documents.map((doc) => ({
              id: doc.id,
              documentType: doc.documentType,
              fileName: doc.fileName,
              status: doc.status,
              storageUrl: doc.storageUrl,
              uploadedAt: doc.uploadedAt,
              reviewNotes: doc.reviewNotes,
            })),
          }}
          onClose={() => setShowReviewModal(false)}
          onReview={handleReviewDocument}
          onBulkReview={handleBulkReview}
        />
      )}
    </div>
  );
};

export default KycDocumentReview;
