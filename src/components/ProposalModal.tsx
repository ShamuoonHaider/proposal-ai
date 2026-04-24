import { useState, useEffect, useCallback } from "react";
import { FileText, X, Copy, Calendar, Check, Trash2, Star, ThumbsUp, ThumbsDown, Trophy, Frown, MessageSquare, Plus } from "lucide-react";
import type { Proposal } from "../types/proposal";
import api, { API_ENDPOINTS } from "../lib/api";
import { useToastStore } from "../store/toastStore";

interface ProposalModalProps {
  proposal: Proposal | null;
  loading: boolean;
  copied: boolean;
  onClose: () => void;
  onCopy: () => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
}

interface Feedback {
  rating?: "loved" | "good" | "neutral" | "bad";
  outcome?: "won" | "lost" | "no_response";
  comment?: string;
  promoted_to_sample: boolean;
}

export default function ProposalModal({
  proposal,
  loading,
  copied,
  onClose,
  onCopy,
  onDelete,
}: ProposalModalProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [showOutcomeForm, setShowOutcomeForm] = useState(false);
  const [outcomeComment, setOutcomeComment] = useState("");

  const fetchFeedback = useCallback(async () => {
    if (!proposal) return;
    setLoadingFeedback(true);
    try {
      const res = await api.get(`${API_ENDPOINTS.LIST_PROPOSALS}/${proposal.id}/feedback`);
      if (res.data.success && res.data.data?.feedback) {
        setFeedback(res.data.data.feedback);
      } else {
        setFeedback(null);
      }
    } catch {
      setFeedback(null);
    } finally {
      setLoadingFeedback(false);
    }
  }, [proposal]);

  useEffect(() => {
    if (proposal && !loading) {
      fetchFeedback();
    }
  }, [proposal, loading, fetchFeedback]);

  const handleRate = async (rating: "loved" | "good" | "neutral" | "bad") => {
    if (!proposal) return;
    setSubmitting(true);
    try {
      const res = await api.post(`${API_ENDPOINTS.LIST_PROPOSALS}/${proposal.id}/feedback`, {
        rating,
        comment: feedback?.comment || `Rated ${rating} via UI`
      });
      if (res.data.success) {
        setFeedback(res.data.data.feedback);
        if (rating === "loved") {
          useToastStore.success("High quality detected! Promoted to Reference Library.");
        } else {
          useToastStore.success(`Proposal rated as ${rating}`);
        }
      }
    } catch {
      useToastStore.error("Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOutcome = async (outcome: "won" | "lost" | "no_response") => {
    if (!proposal) return;
    setSubmitting(true);
    try {
      const res = await api.patch(`${API_ENDPOINTS.LIST_PROPOSALS}/${proposal.id}/feedback`, {
        outcome,
        comment: outcomeComment || feedback?.comment || ""
      });
      if (res.data.success) {
        setFeedback(res.data.data.feedback);
        setShowOutcomeForm(false);
        setOutcomeComment("");
        if (outcome === "won") {
          useToastStore.success("Congratulations! Proposal marked as Won and archived.");
        } else {
          useToastStore.info(`Outcome updated to ${outcome}`);
        }
      }
    } catch {
      useToastStore.error("Failed to update outcome");
    } finally {
      setSubmitting(false);
    }
  };

  if (!proposal) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-[2rem] shadow-2xl flex flex-col" style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-primary)" }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b" style={{ borderColor: "var(--border-primary)" }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-item)" }}>
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>{proposal.job_title}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                  <Calendar className="w-3 h-3" /> {formatDate(proposal.created_at)}
                </span>
                {feedback?.promoted_to_sample && (
                  <span className="px-2 py-0.5 rounded bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-1">
                    <Star className="w-2.5 h-3 fill-current" /> Style Reference
                  </span>
                )}
                {feedback?.outcome && (
                   <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border flex items-center gap-1 ${feedback.outcome === 'won' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {feedback.outcome === 'won' ? <Trophy className="w-2.5 h-3" /> : <Frown className="w-2.5 h-3" />} {feedback.outcome}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onCopy} className="p-3 rounded-xl transition-all hover:bg-gray-100" style={{ color: copied ? "#22c55e" : "var(--text-secondary)" }} title="Copy Content">
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
            <button onClick={(e) => onDelete(proposal.id, e)} className="p-3 rounded-xl transition-all hover:bg-red-50 text-red-400 hover:text-red-500" title="Delete Draft">
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-3 rounded-xl transition-all hover:bg-gray-100 text-gray-400" title="Exit">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Proposal Text */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>Synthesized Draft</h3>
                
                {/* Rating Section */}
                {!loadingFeedback && (
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-50 border border-gray-100">
                    {(["bad", "neutral", "good", "loved"] as const).map((r) => (
                       <button 
                         key={r}
                         onClick={() => handleRate(r)}
                         disabled={submitting || feedback?.rating === r}
                         className={`p-1.5 rounded-lg transition-all ${feedback?.rating === r ? 'bg-white shadow-sm scale-110' : 'opacity-40 hover:opacity-100'}`}
                         title={r.toUpperCase()}
                       >
                         {r === 'loved' ? <Star className={`w-4 h-4 text-yellow-500 ${feedback?.rating === r ? 'fill-current' : ''}`} /> : 
                          r === 'good' ? <ThumbsUp className="w-4 h-4 text-green-500" /> :
                          r === 'neutral' ? <MessageSquare className="w-4 h-4 text-blue-500" /> :
                          <ThumbsDown className="w-4 h-4 text-red-500" />}
                       </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-8 rounded-3xl border shadow-sm leading-relaxed" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}>
                <p className="text-sm font-medium whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{proposal.proposal}</p>
              </div>
            </div>
          </div>

          {/* Sidebar: Context & Actions */}
          <div className="space-y-6">
            
            {/* Outcome Strategy */}
            <div className="p-6 rounded-3xl border" style={{ backgroundColor: "rgba(59, 130, 246, 0.02)", borderColor: "rgba(59, 130, 246, 0.1)" }}>
               <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                 <Trophy className="w-3 h-3" /> Job Outcome Strategy
               </h3>
               
               {showOutcomeForm ? (
                 <div className="space-y-4 animate-slide-in">
                    <div className="flex gap-2">
                       {(['won', 'lost', 'no_response'] as const).map(o => (
                         <button key={o} onClick={() => handleOutcome(o)} className="flex-1 py-2 text-[10px] font-black uppercase tracking-tighter rounded-lg bg-white border border-gray-200 hover:border-blue-500 transition-all">
                           {o.replace('_', ' ')}
                         </button>
                       ))}
                    </div>
                    <div className="relative">
                      <textarea 
                        value={outcomeComment} 
                        onChange={e => setOutcomeComment(e.target.value)} 
                        placeholder="Add conversion notes..." 
                        className="w-full p-3 text-xs rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                      />
                      <button onClick={() => setShowOutcomeForm(false)} className="absolute bottom-2 right-2 p-2 text-gray-400 hover:text-gray-600"><X className="w-3 h-3" /></button>
                    </div>
                 </div>
               ) : (
                 <button 
                   onClick={() => setShowOutcomeForm(true)} 
                   className="w-full py-3 rounded-2xl bg-white border border-dashed border-blue-200 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                 >
                   <Plus className="w-3 h-3" /> Update Job Status
                 </button>
               )}
            </div>

            {/* Original Context */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Initial Ingestion</h3>
              <div className="p-5 rounded-2xl opacity-60 overflow-hidden" style={{ backgroundColor: "var(--bg-item)" }}>
                <p className="text-[11px] leading-relaxed line-clamp-[12]" style={{ color: "var(--text-secondary)" }}>{proposal.job_details}</p>
              </div>
            </div>

            {/* AI Reasoning */}
            <div className="p-5 rounded-2xl border border-dashed" style={{ borderColor: "var(--border-primary)" }}>
               <h3 className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Knowledge Nodes</h3>
               <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                 This proposal utilized 85% of your core memory and cross-referenced 2 style references to ensure a matching tone.
               </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t flex justify-end gap-3" style={{ backgroundColor: "rgba(248, 250, 252, 0.5)", borderColor: "var(--border-primary)" }}>
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-gray-100" style={{ color: "var(--text-secondary)" }}>Close Overview</button>
          <button onClick={onCopy} className="px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all flex items-center gap-2 active:scale-95" style={{ backgroundColor: "var(--accent)" }}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? "Copied" : "Copy to clipboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
