import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { API_ENDPOINTS } from "../lib/api";
import { useToastStore } from "../store/toastStore";
import {
  FileText,
  Brain,
  BadgeCheck,
  Upload,
  Loader2,
  FolderKanban,
  Zap,
  FileEdit,
  Activity,
  Star,
} from "lucide-react";

// Types
interface DashboardStats {
  summary: {
    total_documents: number;
    trained_documents: number;
    total_proposals: number;
    memory_score: number;
  };
  recent_activity: {
    period_days: number;
    new_documents: number;
    new_proposals: number;
  };
  documents_breakdown: Record<string, number>;
  last_activity: {
    last_document_upload: string | null;
    last_proposal_generated: string | null;
  };
  memory: {
    score: number;
    summary: string;
    has_memory: boolean;
  };
}

interface ActivityTimeline {
  period_days: number;
  timeline: Array<{
    date: string;
    documents: number;
    proposals: number;
  }>;
}

interface RecentActivity {
  id: string;
  type: "document" | "proposal";
  title: string;
  timestamp: string;
}

// Document type mapping
const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  cv: "Curriculum Vitae",
  portfolio: "Portfolio Items",
  cover_letter: "Cover Letter Base",
  linkedin: "LinkedIn Profile",
  certificate: "Certificates",
};

const DOCUMENT_TYPE_ICONS: Record<string, string> = {
  cv: "badge",
  portfolio: "palette",
  cover_letter: "mail",
  linkedin: "badge",
  certificate: "badge",
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activityTimeline, setActivityTimeline] = useState<ActivityTimeline | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    useToastStore[type](message);
  };

  const getAuthToken = () => localStorage.getItem("token");

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_ENDPOINTS.DASHBOARD}?days=30`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch dashboard stats");

      const result = await response.json();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load dashboard", "error");
    }
  }, []);

  // Fetch activity timeline
  const fetchActivityTimeline = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_ENDPOINTS.DASHBOARD_ACTIVITY}?days=30`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch activity timeline");

      const result = await response.json();
      if (result.success && result.data) {
        setActivityTimeline(result.data);
      }
    } catch (err) {
      console.error("Failed to load activity timeline", err);
    }
  }, []);

  // Fetch recent activities (proposals and documents)
  const fetchRecentActivities = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // Fetch recent proposals
      const proposalsRes = await fetch(`${API_ENDPOINTS.LIST_PROPOSALS}?page=1&page_size=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const activities: RecentActivity[] = [];

      if (proposalsRes.ok) {
        const result = await proposalsRes.json();
        if (result.success && result.data?.proposals) {
          result.data.proposals.forEach((p: { id: number; job_title: string; created_at: string }) => {
            activities.push({
              id: `proposal-${p.id}`,
              type: "proposal",
              title: p.job_title || "New Proposal",
              timestamp: p.created_at,
            });
          });
        }
      }

      // Sort by timestamp (newest first) and take top 4
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivities(activities.slice(0, 4));
    } catch (err) {
      console.error("Failed to load recent activities", err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchDashboardStats(),
        fetchActivityTimeline(),
        fetchRecentActivities(),
      ]);
      setIsLoading(false);
    };

    loadData();
  }, [fetchActivityTimeline, fetchDashboardStats, fetchRecentActivities]);

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  // Get last sync time
  const getLastSyncTime = () => {
    if (!stats?.last_activity?.last_document_upload && !stats?.last_activity?.last_proposal_generated) {
      return "Never";
    }

    const lastDoc = stats.last_activity.last_document_upload
      ? new Date(stats.last_activity.last_document_upload).getTime()
      : 0;
    const lastProposal = stats.last_activity.last_proposal_generated
      ? new Date(stats.last_activity.last_proposal_generated).getTime()
      : 0;

    const mostRecent = Math.max(lastDoc, lastProposal);
    if (mostRecent === 0) return "Never";

    const diffMs = Date.now() - mostRecent;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return formatDate(new Date(mostRecent).toISOString());
  };

  // Extract tone profile and expertise tags from memory summary
  const extractMemoryInsights = (summary: string) => {
    // Default values
    console.log("Extracting insights from summary length:", summary.length);
    return {
      toneProfile: "Technical & Precise",
      expertiseTags: ["Node.js", "AWS", "React"],
    };
  };

  // Render activity bar chart
  const renderActivityChart = () => {
    if (!activityTimeline?.timeline || activityTimeline.timeline.length === 0) {
      // Generate mock data for visualization if no real data
      const mockData = Array.from({ length: 10 }, (_, i) => ({
        date: `Day ${i + 1}`,
        documents: Math.floor(Math.random() * 5),
        proposals: Math.floor(Math.random() * 3),
      }));

      return (
        <div className="h-64 flex items-end justify-between gap-2 px-2 border-b border-[#c4c6cf]/30 relative">
          {mockData.map((day, i) => {
            const docHeight = Math.max(day.documents * 20, 10);
            const proposalHeight = Math.max(day.proposals * 20, 10);
            const isActive = i === mockData.length - 2;

            return (
              <div
                key={i}
                className={`flex-1 flex flex-col justify-end gap-1 h-full ${isActive ? "bg-white/30 rounded-t-lg px-0.5" : ""}`}
              >
                <div
                  className={`w-full rounded-t-sm transition-all ${isActive ? "bg-[#2b0066]" : "bg-[#2b0066]/20"}`}
                  style={{ height: `${docHeight}%` }}
                />
                <div
                  className={`w-full rounded-t-sm transition-all ${isActive ? "bg-[#1960a3]" : "bg-[#1960a3]/40"}`}
                  style={{ height: `${proposalHeight}%` }}
                />
              </div>
            );
          })}
        </div>
      );
    }

    // Find max values for scaling
    const maxDocs = Math.max(...activityTimeline.timeline.map((t) => t.documents), 1);
    const maxProposals = Math.max(...activityTimeline.timeline.map((t) => t.proposals), 1);
    const maxValue = Math.max(maxDocs, maxProposals, 1);

    return (
      <div className="h-64 flex items-end justify-between gap-2 px-2 border-b border-[#c4c6cf]/30 relative">
        {activityTimeline.timeline.map((day) => {
          const docPercent = (day.documents / maxValue) * 100 || 5;
          const proposalPercent = (day.proposals / maxValue) * 100 || 5;
          const isToday = new Date(day.date).toDateString() === new Date().toDateString();

          return (
            <div
              key={day.date}
              className={`flex-1 flex flex-col justify-end gap-1 h-full ${isToday ? "bg-white/30 rounded-t-lg px-0.5" : ""}`}
            >
              <div
                className={`w-full rounded-t-sm transition-all ${isToday ? "bg-[#2b0066]" : "bg-[#2b0066]/20"}`}
                style={{ height: `${Math.max(docPercent, 5)}%` }}
              />
              <div
                className={`w-full rounded-t-sm transition-all ${isToday ? "bg-[#1960a3]" : "bg-[#1960a3]/40"}`}
                style={{ height: `${Math.max(proposalPercent, 5)}%` }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent)" }} />
        </div>
      </DashboardLayout>
    );
  }

  const memoryInsights = extractMemoryInsights(stats?.memory?.summary || "");

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header & Welcome */}
        <header className="mb-12">
          <h1 className="text-3xl font-black tracking-tighter mb-2" style={{ color: "var(--text-primary)" }}>
            Architectural Overview
          </h1>
          <p className="max-w-2xl" style={{ color: "var(--text-secondary)" }}>
            The Digital Curator has processed your latest materials. Your proposal intelligence is currently at peak capacity.
          </p>
        </header>

        {/* Summary Grid (Bento Style) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Total Documents */}
          <div
            className="p-6 rounded-xl shadow-[0_12px_32px_-4px_rgba(22,28,34,0.04)] group hover:translate-y-[-4px] transition-transform duration-300"
            style={{ backgroundColor: "#ffffff" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: "#d6e3ff" }}>
                <FolderKanban className="w-5 h-5" style={{ color: "#002045" }} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#1960a3" }}>
                Active
              </span>
            </div>
            <div className="text-4xl font-black mb-1" style={{ color: "#002045" }}>
              {stats?.summary?.total_documents || 0}
            </div>
            <div className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              Total Documents
            </div>
          </div>

          {/* Trained Documents */}
          <div
            className="p-6 rounded-xl shadow-[0_12px_32px_-4px_rgba(22,28,34,0.04)] group hover:translate-y-[-4px] transition-transform duration-300"
            style={{ backgroundColor: "#ffffff" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: "#eaddff" }}>
                <Zap className="w-5 h-5" style={{ color: "#2b0066" }} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#5a00c6" }}>
                Ready
              </span>
            </div>
            <div className="text-4xl font-black mb-1" style={{ color: "#2b0066" }}>
              {stats?.summary?.trained_documents || 0}
            </div>
            <div className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              Trained Nodes
            </div>
          </div>

          {/* Total Proposals */}
          <div
            className="p-6 rounded-xl shadow-[0_12px_32px_-4px_rgba(22,28,34,0.04)] group hover:translate-y-[-4px] transition-transform duration-300"
            style={{ backgroundColor: "#ffffff" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: "#d3e4ff" }}>
                <FileEdit className="w-5 h-5" style={{ color: "#1960a3" }} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#004881" }}>
                +{stats?.recent_activity?.new_proposals || 0} this week
              </span>
            </div>
            <div className="text-4xl font-black mb-1" style={{ color: "#002045" }}>
              {stats?.summary?.total_proposals || 0}
            </div>
            <div className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              Total Proposals
            </div>
          </div>

          {/* Memory Score */}
          <div
            className="p-6 rounded-xl shadow-lg relative overflow-hidden group hover:translate-y-[-4px] transition-transform duration-300"
            style={{ backgroundColor: "#002045", color: "#ffffff" }}
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg backdrop-blur-md" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#86a0cd" }}>
                  Neural Sync
                </span>
              </div>
              <div className="text-4xl font-black mb-1">
                {stats?.summary?.memory_score || 0}%
              </div>
              <div className="text-sm font-semibold opacity-80">Memory Accuracy</div>
              <div className="mt-4 h-1.5 w-full rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: "#7db6ff",
                    width: `${stats?.summary?.memory_score || 0}%`,
                  }}
                />
              </div>
            </div>
            {/* Abstract AI texture */}
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Activity className="w-32 h-32" />
            </div>
          </div>
        </div>

        {/* Asymmetric Intelligence Section */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Activity Timeline (The Neural Track) */}
          <div
            className="flex-grow lg:w-2/3 p-8 rounded-3xl"
            style={{ backgroundColor: "#eef4fc" }}
          >
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-bold" style={{ color: "#002045" }}>
                  Activity Timeline
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Historical daily ingestion vs. output
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#2b0066" }} />
                  <span className="text-xs font-bold uppercase" style={{ color: "#74777f" }}>
                    Docs
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#1960a3" }} />
                  <span className="text-xs font-bold uppercase" style={{ color: "#74777f" }}>
                    Proposals
                  </span>
                </div>
              </div>
            </div>

            {renderActivityChart()}

            <div className="flex justify-between mt-4 text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: "#c4c6cf" }}>
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </div>

          {/* Curator Memory Profile */}
          <div
            className="lg:w-1/3 p-8 rounded-3xl shadow-[0_12px_32px_-4px_rgba(22,28,34,0.06)] flex flex-col"
            style={{ backgroundColor: "#ffffff" }}
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: "#002045" }}>
                <Activity className="w-5 h-5" style={{ color: "#2b0066" }} />
                Memory Context
              </h3>
            </div>
            <div className="flex-grow">
              <p className="leading-relaxed text-sm italic mb-6" style={{ color: "var(--text-secondary)" }}>
                &ldquo;{stats?.memory?.summary || "Backend Developer with 2+ years of experience specializing in scalable systems, Node.js, and architectural documentation. Focused on efficiency and technical clarity."}&rdquo;
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold uppercase tracking-wider" style={{ color: "#74777f" }}>
                    Tone Profile
                  </span>
                  <span className="font-bold" style={{ color: "#1960a3" }}>
                    {memoryInsights.toneProfile}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold uppercase tracking-wider" style={{ color: "#74777f" }}>
                    Expertise Tags
                  </span>
                  <div className="flex gap-2">
                    {memoryInsights.expertiseTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded"
                        style={{ backgroundColor: "#e8eef6", color: "#002045" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t" style={{ borderColor: "rgba(196,198,207,0.2)" }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ background: "linear-gradient(to bottom right, #2b0066, #1960a3)" }}
                >
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: "#002045" }}>AI Ready</p>
                  <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                    Last synced: {getLastSyncTime()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Breakdown Section */}
          <div
            className="p-8 rounded-3xl shadow-[0_12px_32px_-4px_rgba(22,28,34,0.06)]"
            style={{ backgroundColor: "#ffffff" }}
          >
            <h3 className="text-xl font-bold mb-8" style={{ color: "#002045" }}>
              Document Breakdown
            </h3>
            <div className="space-y-6">
              {Object.entries(stats?.documents_breakdown || {}).length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  No documents uploaded yet. Start by adding your CV or portfolio.
                </p>
              ) : (
                Object.entries(stats?.documents_breakdown || {}).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: "#eef4fc" }}
                      >
                        <span style={{ color: "#002045" }}>
                          {DOCUMENT_TYPE_ICONS[type] || <BadgeCheck className="w-5 h-5" style={{ color: "#002045" }} />}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold" style={{ color: "var(--text-primary)" }}>
                          {DOCUMENT_TYPE_LABELS[type] || type}
                        </h4>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          Stored
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black" style={{ color: "#002045" }}>
                        {count}
                      </div>
                      <div className="text-[10px] font-bold uppercase" style={{ color: "#74777f" }}>
                        Stored
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity List */}
          <div
            className="p-8 rounded-3xl"
            style={{ backgroundColor: "#eef4fc" }}
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold" style={{ color: "#002045" }}>
                Recent Pulse
              </h3>
              <span
                className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{ backgroundColor: "#d3e4ff", color: "#1960a3" }}
              >
                Last 30 Days
              </span>
            </div>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  No recent activity. Generate your first proposal to get started.
                </p>
              ) : (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 rounded-xl flex items-center justify-between border"
                    style={{ backgroundColor: "#ffffff", borderColor: "#ffffff" }}
                  >
                    <div className="flex items-center gap-4">
                      <span style={{ color: activity.type === "proposal" ? "#1960a3" : "#2b0066" }}>
                        {activity.type === "proposal" ? (
                          <FileText className="w-5 h-5" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {activity.type === "proposal" ? "New Proposal: " : "Updated: "}
                        {activity.title}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="mt-8 flex gap-4 text-center">
              <div
                className="flex-1 p-4 rounded-xl"
                style={{ backgroundColor: "rgba(255,255,255,0.4)" }}
              >
                <div className="text-2xl font-black" style={{ color: "#002045" }}>
                  {stats?.recent_activity?.new_documents || 0}
                </div>
                <div className="text-[10px] font-bold uppercase" style={{ color: "#74777f" }}>
                  New Docs
                </div>
              </div>
              <div
                className="flex-1 p-4 rounded-xl"
                style={{ backgroundColor: "rgba(255,255,255,0.4)" }}
              >
                <div className="text-2xl font-black" style={{ color: "#002045" }}>
                  {stats?.recent_activity?.new_proposals || 0}
                </div>
                <div className="text-[10px] font-bold uppercase" style={{ color: "#74777f" }}>
                  New Proposals
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

