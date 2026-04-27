import { useState } from "react";
import {
  ListFilter,
  Trash2,
  File,
  Sparkles,
  Eye,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { FileUpload } from "../components/FileUpload";
import api, { API_ENDPOINTS } from "../lib/api";
import { useToastStore } from "../store/toastStore";
import { useCallback, useEffect } from "react";

interface Document {
  id: string;
  name: string;
  type: string;
  status: string;
  date?: string;
  created_at?: string;
}

interface PaginationInfo {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

const CATEGORIES = [
  "CV / Resume",
  "Portfolio",
  "Sample Proposal",
  "LinkedIn PDF",
  "Certificate",
];

const SAMPLE_DOCS = [
  {
    name: "Senior_Architect_2024.pdf",
    type: "CV",
    status: "Embedded",
    date: "Oct 12, 2023",
  },
  {
    name: "Urban_Design_Portfolio_V2.pdf",
    type: "Portfolio",
    status: "Processing",
    date: "Oct 14, 2023",
  },
  {
    name: "LEED_Certification_2022.pdf",
    type: "Certificate",
    status: "Embedded",
    date: "Sep 28, 2023",
  },
];

function UploadSection({ 
  category 
}: { 
  category: string; 
}) {
  const handleUploadSuccess = (response: unknown) => {
    console.log("Upload successful:", response);
    // Toast notification is already shown by FileUpload component
  };

  const handleUploadError = (error: string) => {
    console.error("Upload failed:", error);
    // Toast notification is already shown by FileUpload component
  };

  return (
    <FileUpload 
      onUploadSuccess={handleUploadSuccess} 
      onUploadError={handleUploadError}
      category={category}
    />
  );
}

function CategorizationSection({ 
  category, 
  setCategory 
}: { 
  category: string; 
  setCategory: (category: string) => void;
}) {
  return (
    <div
      className="rounded-xl border p-6 transition-colors"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-primary)",
      }}
    >
      <h3
        className="text-sm font-semibold tracking-wide uppercase transition-colors"
        style={{ color: "var(--text-primary)" }}
      >
        Categorization
      </h3>
      <p
        className="mt-2 text-sm transition-colors"
        style={{ color: "var(--text-secondary)" }}
      >
        Assign a semantic context to your next upload to optimize AI extraction.
      </p>
      <div className="mt-4 space-y-3">
        {CATEGORIES.map((cat) => (
          <label
            key={cat}
            className="flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor:
                category === cat
                  ? "var(--border-secondary)"
                  : "var(--border-primary)",
            }}
          >
            <input
              type="radio"
              name="category"
              checked={category === cat}
              onChange={() => setCategory(cat)}
              className="w-4 h-4"
              style={{
                color: "var(--text-primary)",
                borderColor: "var(--border-secondary)",
              }}
            />
            <span
              className="text-sm transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              {cat}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function DocumentTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr
            className="text-left text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            <th className="px-6 py-3">File Name</th>
            <th className="px-6 py-3">Type</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Date Uploaded</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody
          className="divide-y"
          style={{ borderColor: "var(--border-primary)" }}
        >
          {SAMPLE_DOCS.map((doc) => (
            <tr
              key={doc.name}
              className="transition-colors"
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--bg-item)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ backgroundColor: "var(--bg-item)" }}
                  >
                    <File className="w-4 h-4" style={{ color: "#3b82f6" }} />
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {doc.name}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: "var(--bg-item)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {doc.type}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      doc.status === "Embedded" ? "bg-green-500" : "bg-blue-500"
                    }`}
                  ></span>
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {doc.status}
                  </span>
                </div>
              </td>
              <td
                className="px-6 py-4 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {doc.date}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {doc.status === "Embedded" ? (
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                      style={{
                        backgroundColor: "#ede9fe",
                        color: "#7c3aed",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#ddd6fe")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#ede9fe")
                      }
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Memory
                    </button>
                  ) : (
                    <button
                      className="p-2 rounded-lg transition-colors"
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--bg-item)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <Eye
                        className="w-4 h-4"
                        style={{ color: "var(--text-secondary)" }}
                      />
                    </button>
                  )}
                  <button
                    className="p-2 rounded-lg transition-colors"
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "var(--bg-item)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <Trash2
                      className="w-4 h-4"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination() {
  return (
    <div
      className="flex items-center justify-between px-6 py-4 border-t"
      style={{ borderColor: "var(--border-primary)" }}
    >
      <p
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: "var(--text-muted)" }}
      >
        Showing 3 of 12 documents
      </p>
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1.5 text-sm rounded-lg transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--bg-item)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          Previous
        </button>
        <button
          className="px-3 py-1.5 text-sm rounded-lg"
          style={{ backgroundColor: "var(--accent)", color: "#fff" }}
        >
          1
        </button>
        <button
          className="px-3 py-1.5 text-sm rounded-lg transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--bg-item)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          2
        </button>
        <button
          className="px-3 py-1.5 text-sm rounded-lg transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--bg-item)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}

function LibraryOverview() {
  return (
    <div
      className="mt-6 rounded-xl border"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderColor: "var(--border-primary)",
      }}
    >
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "var(--border-primary)" }}
      >
        <h3
          className="text-lg font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          Library Overview
        </h3>
        <button
          className="p-2 rounded-lg transition-colors"
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--bg-item)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <ListFilter
            className="w-5 h-5"
            style={{ color: "var(--text-secondary)" }}
          />
        </button>
      </div>
      <DocumentTable />
      <Pagination />
    </div>
  );
}

export default function Documents() {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [_documents, setDocuments] = useState<Document[]>([]);
  const [_isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    page_size: 10,
    total_items: 0,
    total_pages: 1,
  });

  const fetchDocuments = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get(`${API_ENDPOINTS.LIST_DOCUMENTS}?page=${page}&page_size=${pagination.page_size}`);
      const result = response.data;
      if (result.success && result.data) {
        setDocuments(result.data.documents || []);
        setPagination(result.data.pagination);
      }
    } catch (error) { const err = error as { response?: { data?: { message?: string } }, message?: string };
      useToastStore.error(err.response?.data?.message || err.message || "Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page_size]);

  useEffect(() => {
    fetchDocuments(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <div className="mb-8">
          <p
            className="text-xs font-semibold tracking-wide uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Curation Hub
          </p>
          <h1
            className="mt-2 text-3xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Document Management
          </h1>
          <p
            className="mt-2 max-w-3xl"
            style={{ color: "var(--text-secondary)" }}
          >
            Elevate your proposals with architectural precision. Upload,
            categorize, and embed your professional history into the AI
            intelligence engine.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <UploadSection category={selectedCategory} />
          </div>
          <CategorizationSection 
            category={selectedCategory} 
            setCategory={setSelectedCategory} 
          />
        </div>

        <LibraryOverview />
      </div>
    </DashboardLayout>
  );
}
