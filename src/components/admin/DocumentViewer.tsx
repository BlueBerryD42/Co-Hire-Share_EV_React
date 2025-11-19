import { useState } from "react";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/Loading";

interface DocumentViewerProps {
  documentUrl: string;
  fileName: string;
  onClose: () => void;
  onDownload?: () => void;
}

const DocumentViewer = ({
  documentUrl,
  fileName,
  onClose,
  onDownload,
}: DocumentViewerProps) => {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

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
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-neutral-100">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          )}
          {isImage ? (
            <img
              src={documentUrl}
              alt={fileName}
              className="max-w-full max-h-full object-contain transition-transform"
              style={{ transform: `scale(${zoom})` }}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          ) : isPdf ? (
            <iframe
              src={documentUrl}
              className="w-full h-full border-0"
              onLoad={() => setLoading(false)}
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
