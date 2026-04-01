import { useState, useRef } from "react";
import { useToastStore } from "../store/toastStore";
import { API_ENDPOINTS } from "../lib/api";

interface FileUploadProps {
  onUploadSuccess?: (response: unknown) => void;
  onUploadError?: (error: string) => void;
  category?: string;
}

export const FileUpload = ({ onUploadSuccess, onUploadError, category = "CV / Resume" }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Map frontend categories to backend field names
  const getCategoryFieldName = (cat: string): string => {
    const fieldMap: Record<string, string> = {
      "CV / Resume": "cv",
      "Portfolio": "portfolio",
      "Cover Letter": "cover_letter",
      "LinkedIn PDF": "linkedin",
      "Certificate": "certificate",
    };
    return fieldMap[cat] || "cv";
  };

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
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      (file) => file.type === "application/pdf"
    );

    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
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
  };

  const handleDone = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      // Get the correct field name for the selected category
      const fieldName = getCategoryFieldName(category);
      // Append each file with the category-specific field name
      selectedFiles.forEach((file) => {
        formData.append(fieldName, file);
      });

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found. Please sign in again.");
      }

      const res = await fetch(API_ENDPOINTS.UPLOAD_DOCUMENTS, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      // Log full response for debugging 422 errors
      console.log("Backend response status:", res.status);
      console.log("Backend response data:", data);

      if (!res.ok) {
        let errorMessage = "Upload failed";

        // FastAPI typically returns validation errors in 'detail' field
        if (data.detail) {
          console.log("Validation errors:", data.detail);
          if (Array.isArray(data.detail)) {
            errorMessage = data.detail
              .map((d: any) => `${d.loc?.join(".") || "Field"}: ${d.msg}`)
              .join("; ");
          } else {
            errorMessage = typeof data.detail === "string" 
              ? data.detail 
              : JSON.stringify(data.detail);
          }
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.errors) {
          errorMessage = Array.isArray(data.errors)
            ? data.errors.map((e: any) => e.message || e.msg || e).join(", ")
            : "Validation failed";
        }

        useToastStore.error(errorMessage);
        onUploadError?.(errorMessage);
        throw new Error(errorMessage);
      }

      useToastStore.success(`${category} uploaded successfully!`);
      onUploadSuccess?.(data);
      setSelectedFiles([]);
    } catch (err: unknown) {
      let message = "Upload failed";
      if (err instanceof Error) {
        console.error("Upload error:", err);
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);

        if (err.message.includes("Failed to fetch")) {
          message = "CORS Error: The backend server is blocking this request. Please ensure CORS is enabled for your frontend origin.";
        } else {
          message = err.message;
        }
      }
      useToastStore.error(message);
      onUploadError?.(message);
    } finally {
      setUploading(false);
    }
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
              disabled={uploading}
              className="px-6 py-3 font-medium rounded-lg transition-colors border disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "transparent",
                color: "var(--text-secondary)",
                borderColor: "var(--border-primary)",
              }}
              onMouseEnter={(e) => {
                if (!uploading) e.currentTarget.style.backgroundColor = "var(--bg-item)";
              }}
              onMouseLeave={(e) => {
                if (!uploading) e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Clear
            </button>
            <button
              onClick={handleDone}
              disabled={uploading}
              className="px-6 py-3 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--accent)" }}
              onMouseEnter={(e) => {
                if (!uploading) e.currentTarget.style.backgroundColor = "var(--accent-hover)";
              }}
              onMouseLeave={(e) => {
                if (!uploading) e.currentTarget.style.backgroundColor = "var(--accent)";
              }}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin w-5 h-5 inline-block mr-2" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                "Done"
              )}
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
