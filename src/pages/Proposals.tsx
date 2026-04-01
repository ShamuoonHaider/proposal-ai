import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { FileText, Eye, Trash2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useToastStore } from "../store/toastStore";

interface Proposal {
  id: number;
  job_title: string;
  job_details: string;
  proposal: string;
  used_memory: Record<string, unknown>;
  created_at: string;
}

interface PaginationInfo {
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface ProposalsResponse {
  proposals: Proposal[];
  count: number;
  pagination: PaginationInfo;
}

export default function Proposals() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const fetchProposals = async (page: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        useToastStore.error("Authentication required. Please sign in again.");
        navigate("/signin");
        return;
      }

      const res = await fetch(
        `http://192.168.0.129:8000/api/v1/proposals?page=${page}&page_size=20`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        let errorMessage = "Failed to fetch proposals";

        if (res.status === 401) {
          errorMessage = "Authentication failed. Please sign in again.";
          navigate("/signin");
        } else if (res.status === 422) {
          if (data.detail) {
            errorMessage = Array.isArray(data.detail)
              ? data.detail.map((d: any) => d.msg).join(", ")
              : data.detail;
          }
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }

        useToastStore.error(errorMessage);
        return;
      }

      const proposalsData: ProposalsResponse = data.data || data;
      setProposals(proposalsData.proposals || []);
      setTotalCount(proposalsData.count || 0);
      setPagination(proposalsData.pagination);
    } catch (err: unknown) {
      let message = "Failed to fetch proposals";
      if (err instanceof Error) {
        if (err.message.includes("Failed to fetch")) {
          message = "Unable to connect to server. Please check your connection.";
        } else {
          message = err.message;
        }
      }
      useToastStore.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals(currentPage);
  }, [currentPage]);

  const handleViewProposal = (proposal: Proposal) => {
    // Navigate to view proposal detail or open in modal
    // TODO: Implement proposal detail view
    console.log("View proposal:", proposal.id);
    useToastStore.info("View proposal feature coming soon");
  };

  const handleDeleteProposal = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this proposal?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        useToastStore.error("Authentication required. Please sign in again.");
        return;
      }

      const res = await fetch(
        `http://192.168.0.129:8000/api/v1/proposals/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        useToastStore.success("Proposal deleted successfully");
        fetchProposals(currentPage);
      } else {
        useToastStore.error("Failed to delete proposal");
      }
    } catch (err: unknown) {
      useToastStore.error("Failed to delete proposal");
    }
  };

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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p
            className="text-xs font-semibold tracking-wide uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Proposal History
          </p>
          <h1
            className="mt-2 text-3xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            My Proposals
          </h1>
          <p
            className="mt-2 max-w-3xl"
            style={{ color: "var(--text-secondary)" }}
          >
            View and manage your previously generated proposals.
          </p>
        </div>

        {/* Proposals List */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            backgroundColor: "var(--bg-primary)",
            borderColor: "var(--border-primary)",
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg
                className="animate-spin w-8 h-8"
                style={{ color: "var(--accent)" }}
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
            </div>
          ) : proposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: "var(--bg-item)" }}
              >
                <FileText
                  className="w-8 h-8"
                  style={{ color: "var(--text-muted)" }}
                />
              </div>
              <h3
                className="text-lg font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                No proposals yet
              </h3>
              <p
                className="mt-2 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Create your first AI-powered proposal to get started.
              </p>
              <button
                onClick={() => navigate("/proposals/new")}
                className="mt-6 px-6 py-3 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                style={{ backgroundColor: "var(--accent)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--accent-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--accent)")
                }
              >
                <Sparkles className="w-4 h-4" />
                Create Proposal
              </button>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      className="text-left text-xs font-medium uppercase tracking-wide"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <th className="px-6 py-3">Job Title</th>
                      <th className="px-6 py-3">Preview</th>
                      <th className="px-6 py-3">Created</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y"
                    style={{ borderColor: "var(--border-primary)" }}
                  >
                    {proposals.map((proposal) => (
                      <tr
                        key={proposal.id}
                        className="transition-colors cursor-pointer"
                        onClick={() => handleViewProposal(proposal)}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "var(--bg-item)")
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
                              <FileText
                                className="w-4 h-4"
                                style={{ color: "#8d4fff" }}
                              />
                            </div>
                            <span
                              className="text-sm font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {proposal.job_title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {truncateText(proposal.proposal, 80)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="text-sm"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {formatDate(proposal.created_at)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProposal(proposal);
                              }}
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: "var(--text-secondary)" }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "var(--bg-item)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                              title="View proposal"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteProposal(proposal.id, e)}
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: "var(--text-muted)" }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "var(--bg-item)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                              title="Delete proposal"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && (
                <div
                  className="flex items-center justify-between px-6 py-4 border-t"
                  style={{ borderColor: "var(--border-primary)" }}
                >
                  <p
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Showing {proposals.length} of {totalCount} proposals
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination.has_prev}
                      className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={(e) => {
                        if (pagination.has_prev) {
                          e.currentTarget.style.backgroundColor = "var(--bg-item)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (pagination.has_prev) {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span
                      className="px-4 py-2 text-sm font-medium rounded-lg"
                      style={{
                        backgroundColor: "var(--bg-item)",
                        color: "var(--text-primary)",
                      }}
                    >
                      Page {pagination.page} of {pagination.total_pages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={!pagination.has_next}
                      className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={(e) => {
                        if (pagination.has_next) {
                          e.currentTarget.style.backgroundColor = "var(--bg-item)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (pagination.has_next) {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
