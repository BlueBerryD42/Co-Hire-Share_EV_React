import { useEffect, useState } from "react";
import { adminApi } from "@/utils/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/Loading";

const KycDocumentReview = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    fetchPendingKycUsers();
  }, []);

  const fetchPendingKycUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getPendingKycUsers();
      setPendingUsers(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching pending KYC users:", err);
      setError("Failed to load pending KYC users");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewDocument = async (documentId, action, reason) => {
    try {
      await adminApi.reviewKycDocument(documentId, {
        action,
        reason,
      });
      fetchPendingKycUsers();
      setSelectedDocument(null);
    } catch (err) {
      console.error("Error reviewing document:", err);
      alert("Failed to review document");
    }
  };

  if (loading && pendingUsers.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">
        KYC Document Review
      </h1>

      {error && (
        <div className="bg-accent-terracotta/20 border border-accent-terracotta rounded-md p-4">
          <p className="text-accent-terracotta">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Users List */}
        <Card>
          <h3 className="text-lg font-bold text-neutral-800 mb-4">
            Pending Reviews
          </h3>
          <div className="space-y-3">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="border border-neutral-200 rounded-md p-4 hover:bg-neutral-50 cursor-pointer"
                onClick={() => {
                  setSelectedUser(user);
                  setSelectedDocument(null);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-neutral-800">
                    {user.fullName}
                  </h4>
                  <Badge variant="warning">Pending</Badge>
                </div>
                <p className="text-sm text-neutral-600 mb-2">{user.email}</p>
                <p className="text-xs text-neutral-600">
                  Submitted: {new Date(user.submittedAt).toLocaleDateString()}
                </p>
                <div className="mt-2 flex gap-2">
                  {user.documents?.map((doc) => (
                    <Badge key={doc.id} variant="default">
                      {doc.type}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {!loading && pendingUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-600">No pending KYC reviews</p>
            </div>
          )}
        </Card>

        {/* Document Review Panel */}
        {selectedUser && (
          <Card>
            <h3 className="text-lg font-bold text-neutral-800 mb-4">
              Review Documents
            </h3>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-neutral-800">
                  {selectedUser.fullName}
                </p>
                <p className="text-sm text-neutral-600">{selectedUser.email}</p>
              </div>

              <div className="space-y-3">
                {selectedUser.documents?.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-neutral-200 rounded-md p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-neutral-800">
                        {doc.type}
                      </h4>
                      <Badge
                        variant={
                          doc.status === "Approved"
                            ? "success"
                            : doc.status === "Rejected"
                            ? "error"
                            : "warning"
                        }
                      >
                        {doc.status}
                      </Badge>
                    </div>
                    {doc.imageUrl && (
                      <div className="mb-3">
                        <img
                          src={doc.imageUrl}
                          alt={doc.type}
                          className="w-full h-auto rounded-md border border-neutral-200"
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() =>
                          handleReviewDocument(doc.id, "Approve", "")
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        variant="error"
                        size="sm"
                        onClick={() => {
                          const reason = prompt("Reason for rejection:");
                          if (reason) {
                            handleReviewDocument(doc.id, "Reject", reason);
                          }
                        }}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedDocument(doc)}
                      >
                        View Full
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {selectedDocument && (
                <div className="mt-4 border border-neutral-200 rounded-md p-4 bg-neutral-50">
                  <h4 className="font-semibold text-neutral-800 mb-2">
                    Selected Document
                  </h4>
                  <p className="text-sm text-neutral-600 mb-2">
                    {selectedDocument.type} • Status: {selectedDocument.status}
                  </p>
                  {selectedDocument.imageUrl ? (
                    <img
                      src={selectedDocument.imageUrl}
                      alt={selectedDocument.type}
                      className="w-full h-auto rounded-md border border-neutral-200 mb-3"
                    />
                  ) : (
                    <p className="text-sm text-neutral-500">
                      No preview available for this document.
                    </p>
                  )}
                  {selectedDocument.notes && (
                    <p className="text-sm text-neutral-600">
                      Notes: {selectedDocument.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default KycDocumentReview;
