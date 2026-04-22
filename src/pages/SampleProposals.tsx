import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { API_ENDPOINTS } from "../lib/api";
import { useToastStore } from "../store/toastStore";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Eye,
  Edit2,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Loader2,
} from "lucide-react";

// Types
interface SampleProposal {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export default function SampleProposals() {
  const [proposals, setProposals] = useState<SampleProposal[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    page_size: 10,
    total_items: 0,
    total_pages: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingProposal, setViewingProposal] = useState<SampleProposal | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<SampleProposal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    useToastStore[type](message);
  };

  const getAuthToken = () => localStorage.getItem("token");

  // Fetch proposals
  const fetchProposals = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        `${API_ENDPOINTS.SAMPLE_PROPOSALS}?page=${page}&page_size=${pagination.page_size}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch proposals");

      const result = await response.json();
      if (result.success && result.data) {
        setProposals(result.data.proposals || []);
        setPagination(result.data.pagination || pagination);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load proposals", "error");
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page_size]);

  useEffect(() => {
    fetchProposals(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create proposal
  const handleCreate = async () => {
    if (!formTitle.trim() || !formContent.trim()) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(API_ENDPOINTS.SAMPLE_PROPOSALS, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formTitle,
          content: formContent,
        }),
      });

      if (!response.ok) throw new Error("Failed to create proposal");

      showToast("Sample proposal created successfully", "success");
      setIsCreateModalOpen(false);
      resetForm();
      fetchProposals(pagination.page);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create proposal", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update proposal
  const handleUpdate = async () => {
    if (!editingProposal || !formTitle.trim() || !formContent.trim()) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(API_ENDPOINTS.SAMPLE_PROPOSAL_DETAIL(editingProposal.id), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formTitle,
          content: formContent,
        }),
      });

      if (!response.ok) throw new Error("Failed to update proposal");

      showToast("Sample proposal updated successfully", "success");
      setIsEditModalOpen(false);
      setEditingProposal(null);
      resetForm();
      fetchProposals(pagination.page);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update proposal", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete proposal
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this sample proposal?")) return;

    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(API_ENDPOINTS.SAMPLE_PROPOSAL_DETAIL(id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete proposal");

      showToast("Sample proposal deleted successfully", "success");
      fetchProposals(pagination.page);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete proposal", "error");
    }
  };

  // View proposal details
  const handleView = async (proposal: SampleProposal) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(API_ENDPOINTS.SAMPLE_PROPOSAL_DETAIL(proposal.id), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch proposal details");

      const result = await response.json();
      if (result.success && result.data) {
        setViewingProposal(result.data);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load proposal", "error");
    }
  };

  // Open edit modal
  const openEditModal = (proposal: SampleProposal) => {
    setEditingProposal(proposal);
    setFormTitle(proposal.title);
    setFormContent(proposal.content);
    setIsEditModalOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormTitle("");
    setFormContent("");
  };

  // Filter proposals
  const filteredProposals = proposals.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm mb-1">
              <span style={{ color: "var(--text-muted)" }}>PROPOSALS</span>
              <span style={{ color: "var(--text-muted)" }}>/</span>
              <span className="font-medium" style={{ color: "var(--accent)" }}>
                SAMPLE LIBRARY
              </span>
            </div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Sample Proposals
            </h1>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 text-white text-sm font-medium rounded-lg transition-colors"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <Plus className="w-4 h-4" />
            Add Sample
          </button>
        </div>

        {/* Description */}
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          Store your best proposals or upload them as PDFs to help the AI learn your writing style and tone.
        </p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search sample proposals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none"
              style={{
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-primary)",
              }}
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent)" }} />
          </div>
        ) : filteredProposals.length === 0 ? (
          <div
            className="text-center py-20 rounded-xl"
            style={{ backgroundColor: "var(--bg-primary)" }}
          >
            <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
            <p className="text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>
              No sample proposals yet
            </p>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Add your best proposals to help the AI learn your style
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-2.5 text-white text-sm font-medium rounded-lg"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Add Your First Sample
            </button>
          </div>
        ) : (
          <>
            {/* Proposals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="rounded-xl p-6 transition-shadow hover:shadow-lg"
                  style={{ backgroundColor: "var(--bg-primary)" }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleView(proposal)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(proposal)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(proposal.id)}
                        className="p-2 rounded-lg transition-colors hover:text-red-500"
                        style={{ color: "var(--text-muted)" }}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3
                    className="text-lg font-semibold mb-2 line-clamp-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {proposal.title}
                  </h3>

                  <p
                    className="text-sm mb-4 line-clamp-3"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {proposal.content.substring(0, 150)}...
                  </p>

                  <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(proposal.created_at)}
                    </span>
                    {proposal.updated_at !== proposal.created_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Updated
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Showing {(pagination.page - 1) * pagination.page_size + 1} -{" "}
                  {Math.min(pagination.page * pagination.page_size, pagination.total_items)} of{" "}
                  {pagination.total_items} proposals
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => fetchProposals(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => fetchProposals(pagination.page + 1)}
                    disabled={pagination.page >= pagination.total_pages}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className="w-full max-w-2xl rounded-xl p-6 max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Add Sample Proposal
                </h2>
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                  className="p-2 rounded-lg"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-primary)" }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g., E-commerce Platform Proposal"
                    className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none"
                    style={{
                      backgroundColor: "var(--bg-item)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-primary)",
                    }}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-primary)" }}>
                    Content
                  </label>
                  <textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Paste your proposal content here..."
                    rows={12}
                    className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none resize-none"
                    style={{
                      backgroundColor: "var(--bg-item)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-primary)",
                    }}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: "var(--bg-item)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: "var(--accent)" }}
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmitting ? "Saving..." : "Save Sample"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && editingProposal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className="w-full max-w-2xl rounded-xl p-6 max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Edit Sample Proposal
                </h2>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingProposal(null);
                    resetForm();
                  }}
                  className="p-2 rounded-lg"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-primary)" }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none"
                    style={{
                      backgroundColor: "var(--bg-item)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-primary)",
                    }}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-primary)" }}>
                    Content
                  </label>
                  <textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none resize-none"
                    style={{
                      backgroundColor: "var(--bg-item)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-primary)",
                    }}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingProposal(null);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: "var(--bg-item)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: "var(--accent)" }}
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmitting ? "Saving..." : "Update Sample"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewingProposal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className="w-full max-w-3xl rounded-xl p-6 max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 w-fit mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {viewingProposal.title}
                  </h2>
                </div>
                <button
                  onClick={() => setViewingProposal(null)}
                  className="p-2 rounded-lg"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div
                className="p-4 rounded-lg mb-6 whitespace-pre-wrap text-sm leading-relaxed"
                style={{
                  backgroundColor: "var(--bg-item)",
                  color: "var(--text-primary)",
                }}
              >
                {viewingProposal.content}
              </div>

              <div className="flex items-center justify-between text-sm" style={{ color: "var(--text-muted)" }}>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Created: {formatDate(viewingProposal.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Updated: {formatDate(viewingProposal.updated_at)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setViewingProposal(null);
                      openEditModal(viewingProposal);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: "var(--bg-item)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setViewingProposal(null)}
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: "var(--accent)",
                      color: "white",
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
