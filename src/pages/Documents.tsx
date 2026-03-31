import {
  CloudUpload,
  ListFilter,
  Sparkles,
  Eye,
  Trash2,
  File,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

const CATEGORIES = [
  "CV / Resume",
  "Portfolio",
  "Cover Letter",
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

function UploadSection() {
  return (
    <div
      className="rounded-xl border p-8 h-full"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderColor: "var(--border-primary)",
      }}
    >
      <div className="flex flex-col items-center justify-center text-center h-full">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: "var(--bg-item)" }}
        >
          <CloudUpload
            className="w-8 h-8"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
        <h2
          className="text-xl font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          Drag and Drop PDFs
        </h2>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Securely transfer your documents to our encrypted AI vault.
        </p>
        <p
          className="mt-1 text-xs font-medium tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          ONLY .PDF FILES ARE ACCEPTED.
        </p>
        <button
          className="mt-6 px-6 py-3 text-white font-medium rounded-lg transition-colors cursor-pointer"
          style={{ backgroundColor: "var(--accent)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--accent-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--accent)")
          }
        >
          Browse Files
        </button>
      </div>
    </div>
  );
}

function CategorizationSection() {
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
        {CATEGORIES.map((category, index) => (
          <label
            key={category}
            className="flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor:
                index === 0
                  ? "var(--border-secondary)"
                  : "var(--border-primary)",
            }}
          >
            <input
              type="radio"
              name="category"
              defaultChecked={index === 0}
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
              {category}
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
          style={{ divideColor: "var(--border-primary)" }}
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
            <UploadSection />
          </div>
          <CategorizationSection />
        </div>

        <LibraryOverview />
      </div>
    </DashboardLayout>
  );
}
