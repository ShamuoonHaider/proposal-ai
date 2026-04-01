import { FileText, X, Copy, Calendar, Check, Trash2 } from "lucide-react";
import type { Proposal } from "../types/proposal";

interface ProposalModalProps {
  proposal: Proposal | null;
  loading: boolean;
  copied: boolean;
  onClose: () => void;
  onCopy: () => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
}

export default function ProposalModal({
  proposal,
  loading,
  copied,
  onClose,
  onCopy,
  onDelete,
}: ProposalModalProps) {
  if (!proposal) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl"
        style={{
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border-primary)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--bg-item)" }}
            >
              <FileText className="w-5 h-5" style={{ color: "#8d4fff" }} />
            </div>
            <div>
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {proposal.job_title}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className="text-xs flex items-center gap-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Calendar className="w-3 h-3" />
                  {formatDate(proposal.created_at)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCopy}
              className="p-2 rounded-lg transition-colors"
              style={{ color: copied ? "#22c55e" : "var(--text-secondary)" }}
              onMouseEnter={(e) => {
                if (!copied) {
                  e.currentTarget.style.backgroundColor = "var(--bg-item)";
                }
              }}
              onMouseLeave={(e) => {
                if (!copied) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
              title="Copy proposal"
            >
              {copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={(e) => onDelete(proposal.id, e)}
              className="p-2 rounded-lg transition-colors"
              style={{ color: "#ef4444" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#fef2f2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              title="Delete proposal"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--bg-item)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div
                className="w-8 h-8 border-2 rounded-full animate-spin"
                style={{
                  borderColor: "var(--border-primary)",
                  borderTopColor: "var(--accent)",
                }}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Job Details */}
              <div>
                <h3
                  className="text-sm font-semibold uppercase tracking-wide mb-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  Job Details
                </h3>
                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: "var(--bg-item)" }}
                >
                  <p
                    className="text-sm whitespace-pre-wrap"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {proposal.job_details}
                  </p>
                </div>
              </div>

              {/* Proposal */}
              <div>
                <h3
                  className="text-sm font-semibold uppercase tracking-wide mb-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  Generated Proposal
                </h3>
                <div
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-primary)",
                  }}
                >
                  <p
                    className="text-sm whitespace-pre-wrap leading-relaxed"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {proposal.proposal}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
