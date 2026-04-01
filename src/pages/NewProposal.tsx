import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Sparkles, Save, Copy, Loader2, Wand2, Check, Bot } from "lucide-react";
import { useToastStore } from "../store/toastStore";

export default function NewProposal() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDetails, setJobDetails] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!jobTitle || !jobDetails) {
      useToastStore.error("Please fill in both job title and details");
      return;
    }

    setGenerating(true);
    setStreaming(true);
    setGeneratedProposal("");
    setCopied(false);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        useToastStore.error("Authentication required. Please sign in again.");
        setGenerating(false);
        setStreaming(false);
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

      if (!res.ok) {
        const data = await res.json();
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
        setGenerating(false);
        setStreaming(false);
        return;
      }

      // Handle SSE stream response
      if (!res.body) {
        useToastStore.error("Streaming not supported");
        setGenerating(false);
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullProposal = "";

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process complete lines
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine.startsWith(":")) continue;

          // Remove "data: " prefix
          const dataStr = trimmedLine.startsWith("data: ") 
            ? trimmedLine.slice(6) 
            : trimmedLine;

          try {
            const event = JSON.parse(dataStr);

            if (event.type === "token" && event.content) {
              fullProposal += event.content;
              setGeneratedProposal(fullProposal);
            } else if (event.type === "complete") {
              if (event.proposal) {
                setGeneratedProposal(event.proposal);
              }
              setStreaming(false);
              setGenerating(false);
              useToastStore.success("Proposal generated successfully!");
              return;
            } else if (event.type === "error") {
              useToastStore.error(event.message || "Generation failed");
              setStreaming(false);
              setGenerating(false);
              return;
            }
          } catch (e) {
            console.error("Failed to parse SSE event:", line);
          }
        }
      }
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
      setGenerating(false);
      setStreaming(false);
    }
  };

  const handleCopy = () => {
    if (generatedProposal) {
      navigator.clipboard.writeText(generatedProposal);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = () => {
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
                    <Loader2 className="w-5 h-5 animate-spin" />
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
                    style={{ color: copied ? "#22c55e" : "var(--text-secondary)" }}
                    onMouseEnter={(e) => {
                      if (generatedProposal && !copied) {
                        e.currentTarget.style.backgroundColor = "var(--bg-item)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (generatedProposal && !copied) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    {copied ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {streaming && !generatedProposal ? (
                  <div className="h-full flex flex-col items-start">
                    {/* Animated thinking indicator */}
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center animate-pulse-glow"
                        style={{ backgroundColor: "var(--bg-item)" }}
                      >
                        <Bot
                          className="w-6 h-6 animate-breathe"
                          style={{ color: "var(--accent)" }}
                        />
                      </div>
                    </div>
                  </div>
                ) : generatedProposal ? (
                  <div
                    className="prose max-w-none"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <p className="whitespace-pre-wrap">
                      {generatedProposal}
                      {streaming && (
                        <span className="inline-block w-2 h-5 ml-1 bg-current animate-pulse" />
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: "var(--bg-item)" }}
                    >
                      <Wand2
                        className="w-8 h-8"
                        style={{ color: "var(--text-muted)" }}
                      />
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
