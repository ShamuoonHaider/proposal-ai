import { useState, useRef } from "react";
import { useUIStore } from "../store/uiStore";

interface FileUploadProps {
  onFileSelect?: (files: File[]) => void;
  onClear?: () => void;
}

export const FileUpload = ({ onFileSelect, onClear }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf"
    );

    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
      onFileSelect?.(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      (file) => file.type === "application/pdf"
    );

    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
      onFileSelect?.(files);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setSelectedFiles([]);
    onClear?.();
  };

  const handleDone = () => {
    console.log("Uploading files:", selectedFiles);
    // TODO: Handle file upload logic here
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`rounded-xl border-2 border-dashed p-8 h-full cursor-pointer transition-all ${
        isDragging
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-[var(--border-primary)]"
      }`}
      style={{
        backgroundColor: isDragging ? undefined : "var(--bg-primary)",
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center text-center h-full">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: "var(--bg-item)" }}
        >
          <svg
            className="w-8 h-8"
            style={{ color: "var(--text-primary)" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <h2
          className="text-xl font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {isDragging ? "Drop PDF here" : "Drag and Drop PDFs"}
        </h2>

        <p
          className="mt-2"
          style={{ color: "var(--text-secondary)" }}
        >
          {isDragging ? "Release to upload" : "Securely transfer your documents to our encrypted AI vault."}
        </p>

        <p
          className="mt-1 text-xs font-medium tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          ONLY .PDF FILES ARE ACCEPTED.
        </p>

        {selectedFiles.length === 0 ? (
          <button
            className="mt-6 px-6 py-3 text-white font-medium rounded-lg transition-colors"
            style={{ backgroundColor: "var(--accent)" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent)")}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            Browse Files
          </button>
        ) : (
          <div className="mt-6 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleClear}
              className="px-6 py-3 font-medium rounded-lg transition-colors border"
              style={{
                backgroundColor: "transparent",
                color: "var(--text-secondary)",
                borderColor: "var(--border-primary)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-item)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              Clear
            </button>
            <button
              onClick={handleDone}
              className="px-6 py-3 text-white font-medium rounded-lg transition-colors"
              style={{ backgroundColor: "var(--accent)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent)")}
            >
              Done
            </button>
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div className="mt-6 w-full">
            <p
              className="text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Selected Files ({selectedFiles.length})
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ backgroundColor: "var(--bg-item)" }}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      style={{ color: "#ef4444" }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {file.name}
                    </span>
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
