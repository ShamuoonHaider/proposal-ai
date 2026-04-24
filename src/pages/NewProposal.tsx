import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { 
  Save, 
  Copy, 
  Loader2, 
  Wand2, 
  Check, 
  Bot, 
  FileText, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Zap, 
  Edit3, 
  RefreshCcw,
  X,
  Lightbulb,
  Bold,
  List as ListIcon,
  Smile,
  Meh,
  Frown,
  Heart,
  Sparkles,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";
import { useToastStore } from "../store/toastStore";
import api, { API_ENDPOINTS } from "../lib/api";

type ProposalType = "short" | "medium" | "long";

export default function NewProposal() {
  // Layout states
  const [showOutput, setShowOutput] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Input states
  const [jobTitle, setJobTitle] = useState("");
  const [jobDetails, setJobDetails] = useState("");
  const [proposalType, setProposalType] = useState<ProposalType>("medium");
  
  // Generation states
  const [generating, setGenerating] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState("");
  const [proposalId, setProposalId] = useState<number | null>(null);
  const [streaming, setStreaming] = useState(false);
  
  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editableProposal, setEditableProposal] = useState("");
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  
  // UI states
  const [copied, setCopied] = useState(false);
  
  // Feedback states
  const [rating, setRating] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);

  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Clear states when input changes significantly
  useEffect(() => {
    if (!streaming) {
      setProposalId(null);
      setRating(null);
      setOutcome(null);
      setIsEditing(false);
    }
  }, [jobTitle, proposalType]);

  const handleGenerate = async () => {
    if (!jobTitle || !jobDetails) {
      useToastStore.error("Please fill in both job title and details");
      return;
    }

    setShowOutput(true);
    setGenerating(true);
    setStreaming(true);
    setGeneratedProposal("");
    setEditableProposal("");
    setProposalId(null);
    setRating(null);
    setOutcome(null);
    setIsEditing(false);
    setCopied(false);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_ENDPOINTS.GENERATE_PROPOSAL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ job_title: jobTitle, job_details: jobDetails, proposal_type: proposalType }),
      });

      if (!res.ok) {
        const data = await res.json();
        useToastStore.error(data.message || "Generation failed");
        setGenerating(false);
        setStreaming(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullProposal = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          try {
            const dataStr = trimmed.slice(6).trim();
            if (!dataStr) continue;
            
            const event = JSON.parse(dataStr);
            if (event.type === "token") {
              fullProposal += event.content;
              setGeneratedProposal(fullProposal);
              setEditableProposal(fullProposal);
            } else if (event.type === "complete") {
              if (event.proposal) {
                setGeneratedProposal(event.proposal);
                setEditableProposal(event.proposal);
              }
              if (event.proposal_id) setProposalId(event.proposal_id);
              setStreaming(false);
              setGenerating(false);
              useToastStore.success("Proposal Ready!");
              return;
            }
          } catch { }
        }
      }
    } catch {
      useToastStore.error("Connection lost");
      setGenerating(false);
      setStreaming(false);
    }
  };

  const handleSaveDraftChanges = async () => {
    if (!proposalId) return;
    setIsSavingDraft(true);
    try {
      const res = await api.patch(`${API_ENDPOINTS.LIST_PROPOSALS}/${proposalId}`, {
        proposal_text: editableProposal
      });
      if (res.data.success) {
        setGeneratedProposal(editableProposal);
        setIsEditing(false);
        useToastStore.success("Draft updated");
      }
    } catch {
      useToastStore.error("Save failed");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleRate = async (newRating: "loved" | "good" | "neutral" | "bad") => {
    if (!proposalId) return;
    setRating(newRating);
    try {
      await api.post(`${API_ENDPOINTS.LIST_PROPOSALS}/${proposalId}/feedback`, {
        rating: newRating,
        comment: `Rated ${newRating} via Workspace`
      });
      if (newRating === "loved") useToastStore.success("Added to Samples!");
    } catch { }
  };

  const handleOutcome = async (newOutcome: "won" | "lost" | "no_response") => {
    if (!proposalId) return;
    setOutcome(newOutcome);
    try {
      await api.patch(`${API_ENDPOINTS.LIST_PROPOSALS}/${proposalId}/feedback`, {
        outcome: newOutcome
      });
      useToastStore.info(`Marked as ${newOutcome}`);
    } catch { }
  };

  const handleCopy = () => {
    const textToCopy = isEditing ? editableProposal : generatedProposal;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      useToastStore.success("Copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Generate Proposal</h1>
            <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              {showOutput ? "(Workspace Active)" : "(Initialization Stage)"}
            </span>
          </div>
          {showOutput && (
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all hover:bg-slate-50 dark:hover:bg-white/5"
              style={{ color: "var(--text-primary)", borderColor: "var(--border-primary)" }}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
              {sidebarOpen ? "Collapse Controls" : "Edit Ingestion"}
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start transition-all duration-500 h-[calc(100vh-180px)] min-h-[700px]">
          
          {/* Left: Input Panel */}
          <div className={`
            transition-all duration-500 overflow-hidden h-full
            ${!showOutput ? "lg:col-span-12" : sidebarOpen ? "lg:col-span-4" : "hidden"}
          `}>
            <div className={`${!showOutput ? "p-10" : "p-6"} rounded-[2.5rem] border shadow-sm transition-all duration-500 flex flex-col h-full`} style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}>
              
              <div className={`flex items-center gap-4 ${!showOutput ? "mb-10" : "mb-6"}`}>
                 <div className={`${!showOutput ? "w-12 h-12" : "w-10 h-10"} rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all`}>
                    <Sparkles className={`${!showOutput ? "w-6 h-6" : "w-5 h-5"} text-white`} />
                 </div>
                 <div>
                    <h3 className={`${!showOutput ? "text-xl" : "text-base"} font-bold`} style={{ color: "var(--text-primary)" }}>Engine Parameters</h3>
                    <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Configure your proposal synthesis</p>
                 </div>
              </div>

              <div className={`flex-1 overflow-y-auto custom-scrollbar ${!showOutput ? "space-y-8" : "space-y-6"} pr-2`}>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--text-muted)" }}>Job Title</label>
                  <input 
                    type="text" 
                    value={jobTitle} 
                    onChange={(e) => setJobTitle(e.target.value)} 
                    placeholder="e.g. Senior Backend Engineer" 
                    className={`w-full ${!showOutput ? "px-6 py-5" : "px-4 py-3"} rounded-2xl border-none ring-1 focus:ring-2 outline-none transition-all font-semibold`} 
                    style={{ backgroundColor: "var(--bg-item)", color: "var(--text-primary)", ringColor: "var(--border-primary)" }}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>Job Details</label>
                    <span className="text-[9px] font-medium italic" style={{ color: "var(--text-muted)" }}>Markdown supported</span>
                  </div>
                  <textarea 
                    value={jobDetails} 
                    onChange={(e) => setJobDetails(e.target.value)} 
                    placeholder="Paste job description here..." 
                    className={`w-full ${!showOutput ? "h-[350px]" : "h-[250px]"} px-6 py-5 rounded-2xl border-none ring-1 focus:ring-2 outline-none transition-all resize-none text-sm font-medium leading-relaxed`} 
                    style={{ backgroundColor: "var(--bg-item)", color: "var(--text-primary)", ringColor: "var(--border-primary)" }}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--text-muted)" }}>Response Strategy</label>
                  <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl ring-1" style={{ backgroundColor: "var(--bg-item)", ringColor: "var(--border-primary)" }}>
                    {(["short", "medium", "long"] as ProposalType[]).map((type) => (
                      <button 
                        key={type} 
                        onClick={() => setProposalType(type)} 
                        className={`py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${proposalType === type ? 'shadow-xl ring-1' : ''}`}
                        style={{ 
                          backgroundColor: proposalType === type ? "var(--bg-primary)" : "transparent",
                          color: proposalType === type ? "var(--text-primary)" : "var(--text-muted)",
                          ringColor: proposalType === type ? "var(--border-primary)" : "transparent"
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-auto">
                <button 
                  onClick={handleGenerate} 
                  disabled={generating || !jobTitle || !jobDetails} 
                  className={`w-full ${!showOutput ? "py-6" : "py-4"} rounded-[1.5rem] text-white font-black text-xs uppercase tracking-[0.3em] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-black/10`}
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
                  {generating ? "Synthesizing" : "Generate Proposal"}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Workspace / Editor */}
          {showOutput && (
            <div className={`transition-all duration-500 h-full ${sidebarOpen ? "lg:col-span-8" : "lg:col-span-12"} flex flex-col gap-6 overflow-hidden`}>
              
              {/* Pro Tip Header Card */}
              <div className="border p-5 rounded-[1.5rem] flex items-start gap-4 animate-slide-in shrink-0" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: "var(--bg-item)" }}>
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                   <p className="text-[11px] leading-relaxed py-0.5" style={{ color: "var(--text-secondary)" }}>
                    <strong className="font-black uppercase mr-2" style={{ color: "var(--text-primary)" }}>Intelligence Node:</strong>
                    The AI suggests highlighting your <span className="font-bold underline decoration-blue-500/30" style={{ color: "var(--text-primary)" }}>microservices architecture</span> expertise to match the high-scalability requirement detected in the job context.
                  </p>
                </div>
              </div>

              {/* Main Workspace Card */}
              <div className="rounded-[2.5rem] border shadow-2xl flex flex-col flex-1 min-h-0 animate-fade-in overflow-hidden" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}>
                
                {/* Editor Toolbar */}
                <div className="px-10 py-6 border-b flex flex-col sm:flex-row gap-4 sm:items-center justify-between shrink-0" style={{ borderColor: "var(--border-primary)" }}>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-blue-500" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "var(--text-primary)" }}>Editor Workspace</span>
                    </div>
                    <div className="flex items-center gap-1 border-l pl-6" style={{ borderColor: "var(--border-primary)" }}>
                      <button className="p-2.5 transition-colors rounded-xl hover:bg-slate-50 dark:hover:bg-white/5" style={{ color: "var(--text-muted)" }}><Bold className="w-4 h-4" /></button>
                      <button className="p-2.5 transition-colors rounded-xl hover:bg-slate-50 dark:hover:bg-white/5" style={{ color: "var(--text-muted)" }}><ListIcon className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={handleCopy} className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl hover:bg-slate-50 dark:hover:bg-white/5" style={{ color: "var(--text-muted)" }}>
                      <Copy className="w-4 h-4" /> Copy Content
                    </button>
                    <button 
                      onClick={isEditing ? handleSaveDraftChanges : () => setIsEditing(true)} 
                      disabled={!generatedProposal || isSavingDraft}
                      className="flex items-center gap-3 px-8 py-3 text-white rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-xl shadow-blue-500/20 active:scale-95"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      {isSavingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isEditing ? "Commit Refinements" : "Refine Draft"}
                    </button>
                  </div>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 p-8 sm:p-14 overflow-y-auto relative custom-scrollbar min-h-0">
                  {streaming && !generatedProposal ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-6">
                       <Bot className="w-20 h-20 text-blue-500 animate-bounce" />
                       <div className="text-center">
                          <p className="text-base font-black uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>Synthesizing Nodes</p>
                          <p className="text-xs font-bold mt-2" style={{ color: "var(--text-muted)" }}>Applying your style reference parameters...</p>
                       </div>
                    </div>
                  ) : generatedProposal ? (
                    <div className="max-w-3xl mx-auto pb-10">
                      <div className="flex justify-between items-start mb-10">
                         <h2 className="text-3xl font-black tracking-tighter" style={{ color: "var(--text-primary)" }}>AI Draft: {jobTitle}</h2>
                         <button onClick={() => setIsEditing(!isEditing)} className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 transition-colors" style={{ color: "var(--text-muted)" }}>
                           {isEditing ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                         </button>
                      </div>
                      
                      {isEditing ? (
                        <textarea 
                          ref={editorRef}
                          value={editableProposal}
                          onChange={(e) => setEditableProposal(e.target.value)}
                          className="w-full min-h-[500px] border-none outline-none leading-relaxed text-[1.15rem] font-medium resize-none focus:ring-0 bg-transparent p-0"
                          style={{ color: "var(--text-secondary)" }}
                          autoFocus
                        />
                      ) : (
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                          <p className="whitespace-pre-wrap leading-[2.1] text-[1.15rem] font-medium" style={{ color: "var(--text-secondary)" }}>{generatedProposal}</p>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Integrated Bottom Feedback/Outcome Bar */}
                {proposalId && !generating && !streaming && !isEditing && (
                  <div className="px-10 py-10 border-t flex flex-col xl:flex-row items-center justify-between gap-12 bg-slate-50/10" style={{ borderColor: "var(--border-primary)" }}>
                    <div className="flex flex-col sm:flex-row items-center gap-10">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>Rate Resonance</span>
                      <div className="flex items-center gap-8 sm:gap-12">
                        <button onClick={() => handleRate("loved")} className={`flex flex-col items-center gap-3 transition-all ${rating === 'loved' ? 'text-red-500 scale-125' : 'opacity-30 hover:opacity-100 hover:scale-110'}`} style={{ color: rating === 'loved' ? '#ef4444' : 'var(--text-muted)' }}>
                          <Heart className={`w-8 h-8 ${rating === 'loved' ? 'fill-current' : ''}`} />
                          <span className="text-[9px] font-black uppercase tracking-tighter">Loved</span>
                        </button>
                        <button onClick={() => handleRate("good")} className={`flex flex-col items-center gap-3 transition-all ${rating === 'good' ? 'text-green-500 scale-125' : 'opacity-30 hover:opacity-100 hover:scale-110'}`} style={{ color: rating === 'good' ? '#22c55e' : 'var(--text-muted)' }}>
                          <Smile className="w-8 h-8" />
                          <span className="text-[9px] font-black uppercase tracking-tighter">Good</span>
                        </button>
                        <button onClick={() => handleRate("neutral")} className={`flex flex-col items-center gap-3 transition-all ${rating === 'neutral' ? 'text-blue-500 scale-125' : 'opacity-30 hover:opacity-100 hover:scale-110'}`} style={{ color: rating === 'neutral' ? '#3b82f6' : 'var(--text-muted)' }}>
                          <Meh className="w-8 h-8" />
                          <span className="text-[9px] font-black uppercase tracking-tighter">Neutral</span>
                        </button>
                        <button onClick={() => handleRate("bad")} className={`flex flex-col items-center gap-3 transition-all ${rating === 'bad' ? 'text-slate-600 scale-125' : 'opacity-30 hover:opacity-100 hover:scale-110'}`} style={{ color: rating === 'bad' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          <Frown className="w-8 h-8" />
                          <span className="text-[9px] font-black uppercase tracking-tighter">Bad</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-10 xl:border-l xl:pl-12" style={{ borderColor: "var(--border-primary)" }}>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>Job Outcome</span>
                      <div className="flex gap-4">
                        {(['won', 'lost', 'no_response'] as const).map(opt => (
                           <button 
                             key={opt} 
                             onClick={() => handleOutcome(opt)}
                             className={`px-6 py-3 text-[10px] font-black uppercase rounded-[1.2rem] border transition-all ${outcome === opt ? 'shadow-2xl scale-110 ring-2' : 'opacity-40 hover:opacity-100'}`}
                             style={{ 
                                backgroundColor: outcome === opt ? "var(--accent)" : "var(--bg-item)",
                                color: outcome === opt ? "white" : "var(--text-primary)",
                                borderColor: outcome === opt ? "transparent" : "var(--border-primary)",
                                ringColor: outcome === opt ? "rgba(59, 130, 246, 0.2)" : "transparent"
                             }}
                           >
                             {opt.replace('_', ' ')}
                           </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Final Workspace Status Footer */}
                {generatedProposal && (
                  <div className="px-10 py-6 border-t flex justify-between items-center bg-slate-50/20" style={{ borderColor: "var(--border-primary)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: "var(--text-muted)" }}>Status: Active Ingestion</span>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="flex items-center gap-2">
                         <RefreshCcw className="w-3.5 h-3.5 text-slate-300 animate-spin-slow" />
                         <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>Live Sync</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 px-4 py-1.5 rounded-xl bg-blue-500/5 border border-blue-500/10">DRAFT_ID: #{proposalId || "TEMP_BUFF"}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}

function SearchIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
  )
}
