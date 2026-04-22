import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import ProposalModal from "../components/ProposalModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { FileText, Eye, Trash2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useToastStore } from "../store/toastStore";
import type { Proposal, PaginationInfo } from "../types/proposal";
import { API_ENDPOINTS } from "../lib/api";

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
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [viewProposal, setViewProposal] = useState<Proposal | null>(null);
  const [loadingProposal, setLoadingProposal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [proposalToDelete, setProposalToDelete] = useState<number | null>(null);

  const fetchProposals = async (page: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        useToastStore.error("Authentication required.");
        navigate("/signin");
        return;
      }

      const res = await fetch(
        `${API_ENDPOINTS.LIST_PROPOSALS}?page=${page}&page_size=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");

      const proposalsData: ProposalsResponse = data.data || data;
      setProposals(proposalsData.proposals || []);
      setPagination(proposalsData.pagination);
    } catch (err: unknown) {
      const message = err instanceof Error && err.message.includes("Failed to fetch")
        ? "Unable to connect to server."
        : "Failed to fetch proposals";
      useToastStore.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleProposal = async (id: number) => {
    setLoadingProposal(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        useToastStore.error("Authentication required.");
        return;
      }

      const res = await fetch(
        `${API_ENDPOINTS.LIST_PROPOSALS}/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");

      setViewProposal(data.data?.proposal || data);
    } catch (err: unknown) {
      const message = err instanceof Error && err.message.includes("Failed to fetch")
        ? "Unable to connect to server."
        : "Failed to fetch proposal";
      useToastStore.error(message);
    } finally {
      setLoadingProposal(false);
    }
  };

  const handleViewProposal = (proposal: Proposal) => {
    fetchSingleProposal(proposal.id);
  };

  const handleCloseModal = () => {
    setViewProposal(null);
    setCopied(false);
  };

  const handleCopy = () => {
    if (viewProposal?.proposal) {
      navigator.clipboard.writeText(viewProposal.proposal);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setProposalToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!proposalToDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        useToastStore.error("Authentication required.");
        return;
      }

      const res = await fetch(
        `${API_ENDPOINTS.LIST_PROPOSALS}/${proposalToDelete}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        useToastStore.success("Proposal deleted successfully");
        if (viewProposal?.id === proposalToDelete) handleCloseModal();
        fetchProposals(currentPage);
      } else {
        const data = await res.json();
        useToastStore.error(data.message || "Failed to delete proposal");
      }
    } catch (err: unknown) {
      const message = err instanceof Error && err.message.includes("Failed to fetch")
        ? "Unable to connect to server."
        : "Failed to delete proposal";
      useToastStore.error(message);
    } finally {
      setShowDeleteConfirm(false);
      setProposalToDelete(null);
    }
  };

  useEffect(() => {
    fetchProposals(currentPage);
  }, [currentPage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length <= maxLength ? text : text.substring(0, maxLength) + "...";
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--text-muted)" }}>
            Proposal History
          </p>
          <h1 className="mt-2 text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>
            My Proposals
          </h1>
          <p className="mt-2 max-w-3xl" style={{ color: "var(--text-secondary)" }}>
            View and manage your previously generated proposals.
          </p>
        </div>

        {/* Proposals List */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div
                className="w-8 h-8 border-2 rounded-full animate-spin"
                style={{ borderColor: "var(--border-primary)", borderTopColor: "var(--accent)" }}
              />
            </div>
          ) : proposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: "var(--bg-item)" }}
              >
                <FileText className="w-8 h-8" style={{ color: "var(--text-muted)" }} />
              </div>
              <h3 className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>
                No proposals yet
              </h3>
              <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                Create your first AI-powered proposal to get started.
              </p>
              <button
                onClick={() => navigate("/proposals/new")}
                className="mt-6 px-6 py-3 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                style={{ backgroundColor: "var(--accent)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent)")}
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
                    <tr className="text-left text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                      <th className="px-6 py-3">Job Title</th>
                      <th className="px-6 py-3">Preview</th>
                      <th className="px-6 py-3">Created</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "var(--border-primary)" }}>
                    {proposals.map((proposal) => (
                      <tr
                        key={proposal.id}
                        className="transition-colors cursor-pointer"
                        onClick={() => handleViewProposal(proposal)}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-item)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded flex items-center justify-center"
                              style={{ backgroundColor: "var(--bg-item)" }}
                            >
                              <FileText className="w-4 h-4" style={{ color: "#8d4fff" }} />
                            </div>
                            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                              {proposal.job_title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            {truncateText(proposal.proposal, 80)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
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
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-item)")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                              title="View proposal"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(proposal.id, e)}
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: "var(--text-muted)" }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-item)")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
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
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    Showing {proposals.length} of {pagination.total_pages * 20} proposals
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination.has_prev}
                      className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={(e) => {
                        if (pagination.has_prev) e.currentTarget.style.backgroundColor = "var(--bg-item)";
                      }}
                      onMouseLeave={(e) => {
                        if (pagination.has_prev) e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span
                      className="px-4 py-2 text-sm font-medium rounded-lg"
                      style={{ backgroundColor: "var(--bg-item)", color: "var(--text-primary)" }}
                    >
                      Page {pagination.page} of {pagination.total_pages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={!pagination.has_next}
                      className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={(e) => {
                        if (pagination.has_next) e.currentTarget.style.backgroundColor = "var(--bg-item)";
                      }}
                      onMouseLeave={(e) => {
                        if (pagination.has_next) e.currentTarget.style.backgroundColor = "transparent";
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

      {/* Modals */}
      <ProposalModal
        proposal={viewProposal}
        loading={loadingProposal}
        copied={copied}
        onClose={handleCloseModal}
        onCopy={handleCopy}
        onDelete={handleDeleteClick}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setProposalToDelete(null);
        }}
      />
    </DashboardLayout>
  );
}
