import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { 
  Save, 
  Copy, 
  Loader2, 
  Bot, 
  Meh,
  Edit3, 
  X,
  Lightbulb,
  Bold,
  List as ListIcon,
  Smile,
  Heart,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  Search,
  Bell,
  Frown
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
  
  // Feedback states
  const [rating, setRating] = useState<string | null>(null);

  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!streaming) {
      setRating(null);
      setIsEditing(false);
    }
  }, [jobTitle, proposalType]);

  const handleGenerate = async () => {
    if (!jobTitle || !jobDetails) {
      useToastStore.error("Fill in details first");
      return;
    }

    setShowOutput(true);
    setGenerating(true);
    setStreaming(true);
    setGeneratedProposal("");
    setEditableProposal("");
    setProposalId(null);
    setRating(null);
    setIsEditing(false);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_ENDPOINTS.GENERATE_PROPOSAL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ job_title: jobTitle, job_details: jobDetails, proposal_type: proposalType }),
      });

      if (!res.ok) {
        const data = await res.json();
        useToastStore.error(data.message || "Failed");
        setGenerating(false);
        setStreaming(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedProposal = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          try {
            const dataStr = trimmed.slice(6).trim();
            if (!dataStr) continue;
            
            const event = JSON.parse(dataStr);
            if (event.type === "token") {
              accumulatedProposal += event.content;
              setGeneratedProposal(accumulatedProposal);
              setEditableProposal(accumulatedProposal);
            } else if (event.type === "complete") {
              if (event.proposal) {
                setGeneratedProposal(event.proposal);
                setEditableProposal(event.proposal);
              }
              if (event.proposal_id) setProposalId(event.proposal_id);
              setStreaming(false);
              setGenerating(false);
              return;
            }
          } catch { }
        }
      }
    } catch {
      useToastStore.error("Lost connection");
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
        useToastStore.success("Saved");
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
        comment: "Quick rate"
      });
      if (newRating === "loved") useToastStore.success("Saved to samples");
    } catch { }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(isEditing ? editableProposal : generatedProposal);
    useToastStore.success("Copied");
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto px-4 h-full flex flex-col">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-700 dark:text-slate-200">Generate Proposal</h1>
            <span className="text-xs text-slate-400 font-medium">{showOutput ? "(Workspace Active)" : ""}</span>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative group hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search proposals..." 
                  className="pl-9 pr-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-xs w-64 outline-none focus:ring-1 focus:ring-blue-500/50 dark:text-slate-200"
                />
             </div>
             <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400">
                <Bell className="w-4 h-4" />
             </button>
             {showOutput && (
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
                </button>
              )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 pb-6">
          
          <div className={`
            transition-all duration-300
            ${!showOutput ? "lg:col-span-12 max-w-4xl mx-auto w-full" : sidebarOpen ? "lg:col-span-4" : "hidden"}
          `}>
            <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 block">Job Title</label>
                <input 
                  type="text" 
                  value={jobTitle} 
                  onChange={(e) => setJobTitle(e.target.value)} 
                  placeholder="e.g. Backend Developer" 
                  className="w-full px-4 py-2.5 rounded-lg bg-[#f1f5f9] dark:bg-[#0f172a] border-none text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-blue-500/30" 
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Job Details</label>
                  <span className="text-[9px] text-slate-300 font-medium">Markdown supported</span>
                </div>
                <textarea 
                  value={jobDetails} 
                  onChange={(e) => setJobDetails(e.target.value)} 
                  placeholder="Paste job description here..." 
                  className={`w-full ${!showOutput ? 'h-[300px]' : 'h-[250px]'} px-4 py-3 rounded-lg bg-[#f1f5f9] dark:bg-[#0f172a] border-none text-sm font-medium text-slate-600 dark:text-slate-300 outline-none focus:ring-1 focus:ring-blue-500/30 resize-none leading-relaxed transition-all`} 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 block">Response Length</label>
                <div className="flex p-1 bg-[#f1f5f9] dark:bg-[#0f172a] rounded-lg gap-1">
                  {(["short", "medium", "long"] as ProposalType[]).map((type) => (
                    <button 
                      key={type} 
                      onClick={() => setProposalType(type)} 
                      className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${proposalType === type ? 'bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerate} 
                disabled={generating || !jobTitle || !jobDetails} 
                className="w-full py-3.5 rounded-lg bg-[#0f172a] dark:bg-[#8d4fff] text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Proposal
              </button>
            </div>
          </div>

          {showOutput && (
            <div className={`flex flex-col gap-4 h-full min-h-0 ${sidebarOpen ? "lg:col-span-8" : "lg:col-span-12"} transition-all duration-300`}>
              
              <div className="bg-[#f1f5f9] dark:bg-slate-800/50 p-4 rounded-xl flex items-start gap-4 border border-slate-100 dark:border-slate-700/50">
                <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pt-0.5">
                  <strong className="font-bold uppercase text-slate-800 dark:text-slate-200 mr-2 tracking-tighter">Pro Tip:</strong>
                  Highlight your <span className="font-bold text-slate-900 dark:text-white">microservices architecture</span> expertise to match the requirements.
                </p>
              </div>

              <div className="flex-1 min-h-0 bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col shadow-sm overflow-hidden h-[800px]">
                
                <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-slate-900 dark:text-slate-200 tracking-tighter">Editor</span>
                    <div className="flex items-center gap-1 border-l pl-4 border-slate-100 dark:border-slate-700">
                      <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white"><Bold className="w-4 h-4" /></button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white"><ListIcon className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button onClick={handleCopy} className="flex items-center gap-2 px-2 py-1 text-[10px] font-bold uppercase text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                    <button 
                      onClick={isEditing ? handleSaveDraftChanges : () => setIsEditing(true)} 
                      disabled={!generatedProposal || isSavingDraft}
                      className="flex items-center gap-2 px-4 py-1.5 bg-[#0f172a] dark:bg-[#8d4fff] text-white rounded-md text-[10px] font-bold uppercase hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      {isSavingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 sm:p-12 custom-scrollbar">
                   {streaming && !generatedProposal ? (
                     <div className="h-full flex items-center justify-center opacity-20">
                        <Bot className="w-12 h-12 animate-pulse" />
                     </div>
                   ) : generatedProposal ? (
                     <div className="max-w-3xl mx-auto">
                        <div className="flex justify-between items-start mb-6">
                           <h2 className="text-2xl font-bold text-slate-800 dark:text-white">AI Draft: {jobTitle}</h2>
                           <button onClick={() => setIsEditing(!isEditing)} className="p-1 text-slate-300 hover:text-slate-600 transition-colors">
                             {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                           </button>
                        </div>

                        {isEditing ? (
                          <textarea 
                            ref={editorRef}
                            value={editableProposal}
                            onChange={(e) => setEditableProposal(e.target.value)}
                            className="w-full min-h-[400px] border-none outline-none text-slate-600 dark:text-slate-300 leading-relaxed text-sm font-medium resize-none bg-transparent focus:ring-0"
                            autoFocus
                          />
                        ) : (
                          <p className="whitespace-pre-wrap text-slate-500 dark:text-slate-400 leading-relaxed text-sm font-medium">{generatedProposal}</p>
                        )}
                        
                        {streaming && (
                           <div className="mt-4 flex items-center gap-2 opacity-50">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Live Synthesis active</span>
                           </div>
                        )}
                     </div>
                   ) : null}
                </div>

                {proposalId && !generating && !streaming && !isEditing && (
                  <div className="px-8 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0 bg-[#f8fafc] dark:bg-[#0f172a]/50">
                    <div className="flex items-center gap-6">
                      <span className="text-[9px] font-bold uppercase text-slate-400 tracking-tighter">Rate Draft Quality</span>
                      <div className="flex items-center gap-4">
                        <button onClick={() => handleRate("loved")} className={`flex flex-col items-center gap-0.5 transition-all ${rating === 'loved' ? 'text-red-500' : 'text-slate-300 hover:text-slate-500'}`}>
                          <Heart className={`w-4 h-4 ${rating === 'loved' ? 'fill-current' : ''}`} />
                          <span className="text-[7px] font-bold uppercase">Loved</span>
                        </button>
                        <button onClick={() => handleRate("good")} className={`flex flex-col items-center gap-0.5 transition-all ${rating === 'good' ? 'text-green-500' : 'text-slate-300 hover:text-slate-500'}`}>
                          <Smile className="w-4 h-4" />
                          <span className="text-[7px] font-bold uppercase">Good</span>
                        </button>
                        <button onClick={() => handleRate("neutral")} className={`flex flex-col items-center gap-0.5 transition-all ${rating === 'neutral' ? 'text-blue-500' : 'text-slate-300 hover:text-slate-500'}`}>
                          <Meh className="w-4 h-4" />
                          <span className="text-[7px] font-bold uppercase">Neutral</span>
                        </button>
                        <button onClick={() => handleRate("bad")} className={`flex flex-col items-center gap-0.5 transition-all ${rating === 'bad' ? 'text-slate-500' : 'text-slate-300 hover:text-slate-500'}`}>
                          <Frown className="w-4 h-4" />
                          <span className="text-[7px] font-bold uppercase">Bad</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                       <span className="text-[9px] font-bold uppercase text-slate-400 tracking-tighter">Status</span>
                       <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Synced</span>
                       </div>
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
