import { useState, useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/Loading";
import { API_GATEWAY_URL } from "@/services/api";
import { adminApi } from "@/utils/api";

interface DocumentViewerProps {
  documentUrl: string;
  fileName: string;
  documentId?: string; // Optional: needed if we need to use download endpoint
  onClose: () => void;
  onDownload?: () => void;
}

const DocumentViewer = ({
  documentUrl,
  fileName,
  documentId,
  onClose,
  onDownload,
}: DocumentViewerProps) => {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>(documentUrl);
  const [imageError, setImageError] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
  const isPdf = /\.pdf$/i.test(fileName);

  // Check if URL is external (not from API gateway) and needs to be fetched via API
  const isExternalUrl = (url: string): boolean => {
    if (!url) return false;

    // If it's a relative path, it's internal
    if (url.startsWith("/") || !url.includes("://")) {
      return false;
    }

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      const gatewayHostname = new URL(API_GATEWAY_URL).hostname.toLowerCase();

      // Check if it's a local/internal URL
      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.startsWith("192.168.") ||
        hostname.startsWith("10.") ||
        hostname === gatewayHostname
      ) {
        return false;
      }

      // It's an external URL (like storage.coownership.com)
      return true;
    } catch {
      // If URL parsing fails, assume it's internal/relative
      return false;
    }
  };

  // Fetch image via API if documentId is provided (for KYC documents)
  useEffect(() => {
    // Reset error state when document changes
    setImageError(false);
    setImageUrl(documentUrl);

    // Always use download endpoint for KYC documents if documentId is provided
    if (isImage && documentId) {
      const fetchImageViaApi = async () => {
        try {
          setLoading(true);
          setImageError(false);
          const response = await adminApi.downloadKycDocument(documentId);

          // Check if response is valid
          if (
            !response.data ||
            (response.data instanceof Blob && response.data.size === 0)
          ) {
            throw new Error("Empty response from server");
          }

          // Create blob URL from response (response.data is already a Blob when responseType is "blob")
          const blob =
            response.data instanceof Blob
              ? response.data
              : new Blob([response.data], {
                  type: response.headers["content-type"] || "image/jpeg",
                });
          const blobUrl = URL.createObjectURL(blob);
          blobUrlRef.current = blobUrl;
          setImageUrl(blobUrl);
          setImageError(false);
        } catch (error: unknown) {
          console.error("Error fetching image via API:", error);
          // If 404, the endpoint might not exist or document not found
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 404) {
            console.warn(
              "Document download endpoint returned 404. This may indicate:",
              "1. The document does not exist in the database",
              "2. The download endpoint is not implemented in User service",
              "3. The file was not actually stored"
            );
          }
          setImageError(true);
          // Fallback to original URL (will fail but at least we tried)
          setImageUrl(documentUrl);
        } finally {
          setLoading(false);
        }
      };

      fetchImageViaApi();
    } else if (isImage && !documentId && !isExternalUrl(documentUrl)) {
      // Use original URL directly if it's a relative/internal URL and no documentId
      setImageUrl(documentUrl);
      setLoading(false);
    } else {
      // Use original URL for non-images or external URLs without documentId
      setImageUrl(documentUrl);
      setLoading(false);
    }

    // Cleanup blob URL on unmount
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [documentUrl, documentId, isImage]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center ${
        isFullscreen ? "p-0" : "p-4"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-xl max-w-7xl w-full h-full flex flex-col ${
          isFullscreen ? "rounded-none" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-800 truncate flex-1">
            {fileName}
          </h3>
          <div className="flex items-center gap-2">
            {isImage && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                >
                  −
                </Button>
                <span className="text-sm text-neutral-600 min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                >
                  +
                </Button>
                <Button variant="secondary" size="sm" onClick={handleResetZoom}>
                  Reset
                </Button>
              </>
            )}
            {onDownload && (
              <Button variant="secondary" size="sm" onClick={onDownload}>
                Download
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </Button>
            <Button variant="error" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-neutral-100 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <LoadingSpinner />
            </div>
          )}
          {isImage ? (
            imageError ? (
              <div className="text-center p-8 max-w-md">
                <div className="mb-4 text-neutral-400">
                  <svg
                    className="mx-auto h-16 w-16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Image Not Available
                </h3>
                <p className="text-sm text-neutral-600 mb-4">
                  {imageError
                    ? "The document file could not be retrieved from the server. This may be because the download endpoint is not implemented or the file was not actually stored."
                    : "The document file is not available in the development environment. In production, files are stored in cloud storage."}
                </p>
                <p className="text-xs text-neutral-500 mb-4 break-all">
                  Storage URL: {documentUrl}
                </p>
                {onDownload && (
                  <Button onClick={onDownload} variant="secondary">
                    Try Download
                  </Button>
                )}
              </div>
            ) : (
              <img
                src={imageUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain transition-transform"
                style={{ transform: `scale(${zoom})` }}
                onLoad={() => {
                  setLoading(false);
                  setImageError(false);
                }}
                onError={(e) => {
                  console.error("Error loading image:", e);
                  setLoading(false);
                  setImageError(true);
                }}
              />
            )
          ) : isPdf ? (
            <iframe
              src={imageUrl}
              className="w-full h-full border-0"
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
              title={fileName}
            />
          ) : (
            <div className="text-center p-8">
              <p className="text-neutral-600 mb-4">
                Preview not available for this file type.
              </p>
              {onDownload && (
                <Button onClick={onDownload}>Download File</Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
