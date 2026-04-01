import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Sparkles, Save, Copy } from "lucide-react";
import { useToastStore } from "../store/toastStore";

export default function NewProposal() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDetails, setJobDetails] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!jobTitle || !jobDetails) {
      useToastStore.error("Please fill in both job title and details");
      return;
    }

    setGenerating(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        useToastStore.error("Authentication required. Please sign in again.");
        return;
      }

      const res = await fetch("http://192.168.0.129:8000/api/v1/generate-proposal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          job_title: jobTitle,
          job_details: jobDetails,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        let errorMessage = "Failed to generate proposal";

        if (res.status === 401) {
          errorMessage = "Authentication failed. Please sign in again.";
        } else if (res.status === 422) {
          if (data.detail) {
            errorMessage = Array.isArray(data.detail)
              ? data.detail.map((d: any) => d.msg).join(", ")
              : data.detail;
          }
        } else if (res.status === 503) {
          errorMessage = "AI service is currently unavailable. Please try again later.";
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }

        useToastStore.error(errorMessage);
        return;
      }

      // Success - extract proposal from response
      const proposal = data.data?.proposal || data.proposal;
      setGeneratedProposal(proposal);
      useToastStore.success("Proposal generated successfully!");
    } catch (err: unknown) {
      let message = "Failed to generate proposal";
      if (err instanceof Error) {
        if (err.message.includes("Failed to fetch")) {
          message = "Unable to connect to server. Please check your connection.";
        } else {
          message = err.message;
        }
      }
      useToastStore.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedProposal) {
      navigator.clipboard.writeText(generatedProposal);
      useToastStore.success("Proposal copied to clipboard!");
    }
  };

  const handleSave = () => {
    // TODO: Save proposal to backend
    useToastStore.info("Save feature coming soon");
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Form */}
          <div>
            <div className="mb-6">
              <h1
                className="text-2xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Create New Proposal
              </h1>
              <p
                className="mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Provide job details to generate a tailored response.
              </p>
            </div>

            <div className="space-y-6">
              {/* Job Title */}
              <div>
                <label
                  htmlFor="job-title"
                  className="block text-xs font-semibold tracking-wide uppercase mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Job Title
                </label>
                <input
                  id="job-title"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer for FinTech MVP"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  style={{
                    backgroundColor: "var(--bg-item)",
                    borderColor: "var(--border-primary)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              {/* Job Details */}
              <div>
                <label
                  htmlFor="job-details"
                  className="block text-xs font-semibold tracking-wide uppercase mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Full Job Details
                </label>
                <textarea
                  id="job-details"
                  value={jobDetails}
                  onChange={(e) => setJobDetails(e.target.value)}
                  placeholder="Paste the job posting or project scope here..."
                  rows={12}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                  style={{
                    backgroundColor: "var(--bg-item)",
                    borderColor: "var(--border-primary)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={generating || !jobTitle || !jobDetails}
                className="w-full mt-8 py-4 px-6 text-white font-medium rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--accent)" }}
                onMouseEnter={(e) => {
                  if (!generating && jobTitle && jobDetails) {
                    e.currentTarget.style.backgroundColor = "var(--accent-hover)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!generating && jobTitle && jobDetails) {
                    e.currentTarget.style.backgroundColor = "var(--accent)";
                  }
                }}
              >
                {generating ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Proposal
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel - Generated Proposal */}
          <div>
            <div
              className="rounded-xl border h-full flex flex-col"
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border-primary)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-4 border-b"
                style={{ borderColor: "var(--border-primary)" }}
              >
                <h2
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Generated Proposal
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={!generatedProposal}
                    className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => {
                      if (generatedProposal) {
                        e.currentTarget.style.backgroundColor = "var(--bg-item)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (generatedProposal) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <Save className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCopy}
                    disabled={!generatedProposal}
                    className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => {
                      if (generatedProposal) {
                        e.currentTarget.style.backgroundColor = "var(--bg-item)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (generatedProposal) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {generatedProposal ? (
                  <div
                    className="prose max-w-none"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <p className="whitespace-pre-wrap">{generatedProposal}</p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: "var(--bg-item)" }}
                    >
                      <svg
                        className="w-8 h-8"
                        style={{ color: "var(--text-muted)" }}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Your AI-crafted proposal will be displayed here.
                    </p>
                    <p
                      className="text-sm mt-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Fill in the job details and click Generate to begin.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
