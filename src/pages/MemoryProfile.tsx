import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useToastStore } from "../store/toastStore";
import { API_ENDPOINTS } from "../lib/api";
import {
  User,
  Briefcase,
  Zap,
  Rocket,
  Sparkles,
  Plus,
  X,
  Edit2,
  ChevronDown,
  Loader2,
  Brain,
  Star,
  Trash2,
  Check,
} from "lucide-react";

// Types
interface Project {
  project_id?: string;
  name: string;
  description: string;
  company_name?: string;
  problem?: string;
  solution?: string;
  impact?: string;
  tech_stack: string[];
  role?: string;
  highlights: string[];
}

interface MemoryProfile {
  identity: {
    fullName: string;
    title: string;
    experienceLevel: string;
    yearsOfExperience: number;
  };
  skills: {
    technical: string[];
    programmingLanguages: string[];
    tools: string[];
    softSkills: string[];
  };
  experience: {
    domains: string[];
    industries: string[];
    projectTypes: string[];
  };
  projects: Project[];
  preferences: {
    preferredStack: string[];
    projectSize: string;
    workMode: string;
    workType: string;
    availability: string;
  };
  strengths: string[];
  knowledge_summary: {
    summary: string;
    key_takeaways: string[];
  };
  memoryScore: number;
}

const initialProfile: MemoryProfile = {
  identity: {
    fullName: "John Doe",
    title: "Senior Python Developer",
    experienceLevel: "Senior",
    yearsOfExperience: 8,
  },
  skills: {
    technical: ["Python", "FastAPI", "Redis", "Docker"],
    programmingLanguages: ["Python", "TypeScript", "Go"],
    tools: ["VS Code", "Git", "Postman"],
    softSkills: [],
  },
  experience: {
    domains: ["Fintech", "SaaS", "Logistics"],
    industries: [],
    projectTypes: ["Microservices", "Legacy Migrations", "ML Ops"],
  },
  projects: [
    {
      id: "1",
      name: "E-commerce API",
      description:
        "High-performance microservices backend for a global retail platform, processing 10k+ requests per second.",
      techStack: ["FastAPI", "PostgreSQL", "Kubernetes"],
      highlights: [
        "Reduced checkout latency by 45% through aggressive caching",
        "Implemented event-driven architecture using Kafka for order processing",
      ],
    },
  ],
  preferences: {
    preferredStack: ["Python", "AsyncIO", "Cloud Native"],
    projectSize: "Medium",
    workMode: "Remote",
    workType: "Full-Time",
    availability: "Immediately",
  },
<<<<<<< HEAD
  memoryScore: 97,
=======
  strengths: [],
  knowledge_summary: {
    summary: "",
    key_takeaways: [],
  },
  memoryScore: 0,
>>>>>>> e54f627 (improved UI)
};

// Backend API response types
interface BackendMemoryResponse {
  id: number;
  user_id: number;
  score: number;
  summary: string;
  identity: {
    full_name: string;
    title: string;
    experience_level: string;
    years_of_experience: number;
  };
  skills: {
    technical: string[];
    programming_languages: string[];
    tools: string[];
    soft_skills: string[];
  };
  experience: {
    domains: string[];
    industries: string[];
    project_types: string[];
  };
  projects: Array<Project>;
  preferences: {
    preferred_stack: string[];
    project_size: string;
    work_type: string;
    work_mode: string;
    availability: string;
  };
  strengths?: string[];
  knowledge_summary?: {
    summary: string;
    key_takeaways: string[];
  };
  uploaded_documents: Array<{ document_type: string; document_id: string }>;
  last_document_id: string | null;
  created_at: string;
  updated_at: string;
}

// Helper to map backend data to frontend format
const mapBackendToFrontend = (data: BackendMemoryResponse): MemoryProfile => ({
  identity: {
    fullName: data.identity?.full_name || "",
    title: data.identity?.title || "",
    experienceLevel: data.identity?.experience_level || "",
    yearsOfExperience: data.identity?.years_of_experience || 0,
  },
  skills: {
    technical: data.skills?.technical || [],
    programmingLanguages: data.skills?.programming_languages || [],
    tools: data.skills?.tools || [],
    softSkills: data.skills?.soft_skills || [],
  },
  experience: {
    domains: data.experience?.domains || [],
    industries: data.experience?.industries || [],
    projectTypes: data.experience?.project_types || [],
  },
  projects: (data.projects || []).map((p) => ({
    ...p,
    tech_stack: p.tech_stack || (p as { techStack?: string[] }).techStack || [],  })),
  preferences: {
    preferredStack: data.preferences?.preferred_stack || [],
    projectSize: data.preferences?.project_size || "",
    workMode: data.preferences?.work_mode || "",
    workType: data.preferences?.work_type || "",
    availability: data.preferences?.availability || "",
  },
  strengths: data.strengths || [],
  knowledge_summary: {
    summary: data.knowledge_summary?.summary || data.summary || "",
    key_takeaways: data.knowledge_summary?.key_takeaways || [],
  },
  memoryScore: data.score || 0,
});

<<<<<<< HEAD
// Helper to map frontend to backend format for a section
const mapSectionToBackend = (section: string, profile: MemoryProfile) => {
  switch (section) {
    case "identity":
      return {
        identity: {
          full_name: profile.identity.fullName,
          title: profile.identity.title,
          experience_level: profile.identity.experienceLevel,
          years_of_experience: profile.identity.yearsOfExperience,
        },
      };
    case "skills":
      return {
        skills: {
          technical: profile.skills.technical,
          programming_languages: profile.skills.programmingLanguages,
          tools: profile.skills.tools,
          soft_skills: profile.skills.softSkills,
        },
      };
    case "experience":
      return {
        experience: {
          domains: profile.experience.domains,
          industries: profile.experience.industries,
          project_types: profile.experience.projectTypes,
        },
      };
    case "preferences":
      return {
        preferences: {
          preferred_stack: profile.preferences.preferredStack,
          project_size: profile.preferences.projectSize,
          work_type: profile.preferences.workType,
          work_mode: profile.preferences.workMode,
          availability: profile.preferences.availability,
        },
      };
    default:
      return {};
  }
=======
// Helper to map full frontend profile to backend format
const mapProfileToBackend = (profile: MemoryProfile) => {
  return {
    identity: {
      full_name: profile.identity.fullName,
      title: profile.identity.title,
      experience_level: profile.identity.experienceLevel,
      years_of_experience: profile.identity.yearsOfExperience,
    },
    skills: {
      technical: profile.skills.technical,
      programming_languages: profile.skills.programmingLanguages,
      tools: profile.skills.tools,
      soft_skills: profile.skills.softSkills,
    },
    experience: {
      domains: profile.experience.domains,
      industries: profile.experience.industries,
      project_types: profile.experience.projectTypes,
    },
    projects: profile.projects.map(p => ({
      project_id: p.project_id,
      name: p.name,
      company_name: p.company_name || "",
      description: p.description,
      problem: p.problem || "",
      solution: p.solution || "",
      impact: p.impact || "",
      tech_stack: p.tech_stack || [],
      role: p.role || "",
      highlights: p.highlights || [],
    })),
    preferences: {
      preferred_stack: profile.preferences.preferredStack,
      project_size: profile.preferences.projectSize,
      work_type: profile.preferences.workType,
      work_mode: profile.preferences.workMode,
      availability: profile.preferences.availability,
    },
    strengths: profile.strengths,
    knowledge_summary: profile.knowledge_summary,
  };
>>>>>>> e54f627 (improved UI)
};

export default function MemoryProfile() {
  const [profile, setProfile] = useState<MemoryProfile>(initialProfile);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Skill input states
  const [newSkill, setNewSkill] = useState("");
  const [newLang, setNewLang] = useState("");
  const [newTool, setNewTool] = useState("");
  const [newStrength, setNewStrength] = useState("");

  // Project editing state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    useToastStore[type](message);
  };

  // Fetch memory data on mount
  const fetchMemory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(API_ENDPOINTS.GET_MEMORY, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // No memory yet - use default empty state
          setProfile(initialProfile);
          return;
        }
        throw new Error(`Failed to fetch memory: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const mapped = mapBackendToFrontend(result.data as BackendMemoryResponse);
        setProfile(mapped);
      } else {
        throw new Error(result.message || "Failed to parse memory data");
      }
<<<<<<< HEAD
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load memory";
      setError(msg);
      showToast(msg, "error");
=======
    } catch (error) { const err = error as { response?: { data?: { message?: string }, status?: number }, message?: string };
      if (err.response?.status === 404) {
        setProfile(initialProfile);
      } else {
        const msg = err.response?.data?.message || err.message || "Failed to load memory";
        setError(msg);
        showToast(msg, "error");
      }
>>>>>>> e54f627 (improved UI)
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save changes to backend
  const handleSave = async () => {
    setIsSaving(true);

    try {
<<<<<<< HEAD
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      // Save each changed section
      const sectionsToSave = ["identity", "skills", "experience", "preferences"];
=======
      const backendData = mapProfileToBackend(profile);
      const payload = {
        section: null,
        data: backendData,
        merge_strategy: "replace"
      };

      const response = await api.patch(API_ENDPOINTS.UPDATE_MEMORY, payload);
>>>>>>> e54f627 (improved UI)

      for (const section of sectionsToSave) {
        const sectionDataFull = mapSectionToBackend(section, profile);
        // The backend expects the data for the specific section
        const sectionData = sectionDataFull[section as keyof typeof sectionDataFull];

        const response = await fetch(API_ENDPOINTS.PATCH_MEMORY_SECTION(section), {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: sectionData,
            merge_strategy: "replace",
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || `Failed to save ${section}: ${response.status}`);
        }
      }

      setHasChanges(false);
      showToast("Memory profile saved successfully", "success");
<<<<<<< HEAD

      // Refresh data to get updated scores
      await fetchMemory();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save memory";
=======
      await fetchMemory();
    } catch (error) { const err = error as { response?: { data?: { message?: string }, status?: number }, message?: string };
      const msg = err.response?.data?.message || err.message || "Failed to save memory";
>>>>>>> e54f627 (improved UI)
      showToast(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    fetchMemory();
    setHasChanges(false);
  };

  // Skill matrix actions
  const addSkill = (category: keyof typeof profile.skills, value: string) => {
    if (value.trim() && !profile.skills[category].includes(value.trim())) {
      setProfile((prev) => ({
        ...prev,
        skills: {
          ...prev.skills,
          [category]: [...prev.skills[category], value.trim()],
        },
      }));
      setHasChanges(true);
    }
  };

  const removeSkill = (category: keyof typeof profile.skills, skill: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: prev.skills[category].filter((s) => s !== skill),
      },
    }));
    setHasChanges(true);
  };

  // Project actions
  const handleAddProject = () => {
    const newProject: Project = {
      name: "",
      description: "",
      tech_stack: [],
      highlights: [],
    };
    setEditingProject(newProject);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject({ ...project });
    setIsProjectModalOpen(true);
  };

  const handleDeleteProject = (projectId: string | undefined, index: number) => {
    setProfile((prev) => {
      const newProjects = [...prev.projects];
      if (projectId) {
        return {
          ...prev,
          projects: newProjects.filter((p) => p.project_id !== projectId),
        };
      } else {
        newProjects.splice(index, 1);
        return {
          ...prev,
          projects: newProjects,
        };
      }
    });
    setHasChanges(true);
    showToast("Project removed from local profile", "info");
  };

  const saveProject = () => {
    if (!editingProject || !editingProject.name) {
      showToast("Project name is required", "error");
      return;
    }

    setProfile((prev) => {
      const newProjects = [...prev.projects];
      if (editingProject.project_id) {
        // Update existing
        const idx = newProjects.findIndex((p) => p.project_id === editingProject.project_id);
        if (idx !== -1) newProjects[idx] = editingProject;
      } else if ((editingProject as { temp_id?: string }).temp_id) {
         // Update new unsaved
         const idx = newProjects.findIndex((p) => (p as { temp_id?: string }).temp_id === (editingProject as { temp_id?: string }).temp_id);
         if (idx !== -1) newProjects[idx] = editingProject;
      } else {
        // Add new
        (editingProject as { temp_id?: string }).temp_id = Date.now().toString();
        newProjects.push(editingProject);
      }
      return { ...prev, projects: newProjects };
    });

    setIsProjectModalOpen(false);
    setEditingProject(null);
    setHasChanges(true);
  };

  // Strengths actions
  const addStrength = () => {
    if (newStrength.trim() && !profile.strengths.includes(newStrength.trim())) {
      setProfile(prev => ({
        ...prev,
        strengths: [...prev.strengths, newStrength.trim()]
      }));
      setNewStrength("");
      setHasChanges(true);
    }
  };

  const removeStrength = (strength: string) => {
    setProfile(prev => ({
      ...prev,
      strengths: prev.strengths.filter(s => s !== strength)
    }));
    setHasChanges(true);
  };

  const togglePreference = (key: keyof typeof profile.preferences, value: string) => {
    setProfile((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: prev.preferences[key] === value ? "" : value,
      },
    }));
    setHasChanges(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm mb-1">
              <span style={{ color: "var(--text-muted)" }}>MEMORY BANK</span>
              <span style={{ color: "var(--text-muted)" }}>/</span>
              <span className="font-medium" style={{ color: "var(--accent)" }}>PROFILE EDITOR</span>
            </div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Memory Profile Editor</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--accent)" }}>
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <span className="text-xs font-medium block" style={{ color: "var(--accent)" }}>Memory Score:</span>
                <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>{profile.memoryScore}%</span>
              </div>
            </div>

            {hasChanges && (
              <button onClick={handleDiscard} className="px-4 py-2 text-sm font-medium rounded-lg transition-colors" style={{ color: "var(--text-secondary)" }}>Discard</button>
            )}
            <button onClick={handleSave} className="px-6 py-2.5 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2" style={{ backgroundColor: hasChanges ? "var(--accent)" : "var(--bg-item)", color: hasChanges ? "white" : "var(--text-muted)" }} disabled={!hasChanges || isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          {isLoading ? "Loading your memory profile..." : error ? `Error: ${error}` : "High-fidelity profile detected. AI suggestions are highly accurate."}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
          <div className="lg:col-span-7 space-y-6">
            {/* Knowledge Summary */}
            <div className="rounded-xl p-6" style={{ backgroundColor: "var(--bg-primary)" }}>
              <div className="flex items-center gap-2 mb-6">
                <Brain className="w-4 h-4" style={{ color: "var(--accent)" }} />
                <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>Knowledge Summary</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium uppercase mb-2 block" style={{ color: "var(--text-muted)" }}>Professional Summary</label>
                  <textarea value={profile.knowledge_summary.summary} onChange={(e) => { setProfile(prev => ({ ...prev, knowledge_summary: { ...prev.knowledge_summary, summary: e.target.value } })); setHasChanges(true); }} rows={4} className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none resize-none" style={{ backgroundColor: "var(--bg-item)", color: "var(--text-primary)", border: "none" }} placeholder="Brief overview of your professional background..." />
                </div>
              </div>
            </div>

            {/* Identity & Role */}
            <div className="rounded-xl p-6" style={{ backgroundColor: "var(--bg-primary)" }}>
              <div className="flex items-center gap-2 mb-6">
                <User className="w-4 h-4" style={{ color: "var(--accent)" }} />
                <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>Identity & Role</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium uppercase mb-2 block" style={{ color: "var(--text-muted)" }}>Full Name</label>
                  <input type="text" value={profile.identity.fullName} onChange={(e) => { setProfile((prev) => ({ ...prev, identity: { ...prev.identity, fullName: e.target.value } })); setHasChanges(true); }} className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: "var(--bg-item)", color: "var(--text-primary)", border: "none" }} />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase mb-2 block" style={{ color: "var(--text-muted)" }}>Professional Title</label>
                  <input type="text" value={profile.identity.title} onChange={(e) => { setProfile((prev) => ({ ...prev, identity: { ...prev.identity, title: e.target.value } })); setHasChanges(true); }} className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: "var(--bg-item)", color: "var(--text-primary)", border: "none" }} />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase mb-2 block" style={{ color: "var(--text-muted)" }}>Experience Level</label>
                  <div className="relative">
                    <select value={profile.identity.experienceLevel} onChange={(e) => { setProfile((prev) => ({ ...prev, identity: { ...prev.identity, experienceLevel: e.target.value } })); setHasChanges(true); }} className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none appearance-none cursor-pointer" style={{ backgroundColor: "var(--bg-item)", color: "var(--text-primary)", border: "none" }}>
                      <option value="">Select level</option>
                      <option value="Junior">Junior</option>
                      <option value="Mid-level">Mid-level</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead">Lead</option>
                      <option value="Principal">Principal</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase mb-2 block" style={{ color: "var(--text-muted)" }}>Years of Experience</label>
                  <input type="number" value={profile.identity.yearsOfExperience} onChange={(e) => { setProfile((prev) => ({ ...prev, identity: { ...prev.identity, yearsOfExperience: parseInt(e.target.value) || 0 } })); setHasChanges(true); }} className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: "var(--bg-item)", color: "var(--text-primary)", border: "none" }} />
                </div>
              </div>
            </div>

            {/* Skill Matrix */}
            <div className="rounded-xl p-6" style={{ backgroundColor: "var(--bg-primary)" }}>
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-4 h-4" style={{ color: "var(--accent)" }} />
                <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>Skill Matrix</h2>
              </div>
              
              <div className="space-y-6">
                {(["technical", "programmingLanguages", "tools"] as const).map((cat) => (
                  <div key={cat}>
                    <label className="text-xs font-medium uppercase mb-3 block" style={{ color: "var(--text-muted)" }}>{cat.replace(/([A-Z])/g, ' $1')}</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {profile.skills[cat].map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm" style={{ backgroundColor: "var(--bg-item)", color: "var(--text-primary)" }}>
                          {skill}
                          <button onClick={() => removeSkill(cat, skill)} className="ml-1 hover:opacity-70"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={cat === "technical" ? newSkill : cat === "programmingLanguages" ? newLang : newTool} onChange={(e) => cat === "technical" ? setNewSkill(e.target.value) : cat === "programmingLanguages" ? setNewLang(e.target.value) : setNewTool(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { const val = cat === "technical" ? newSkill : cat === "programmingLanguages" ? newLang : newTool; addSkill(cat, val); if (cat === "technical") { setNewSkill(""); } else if (cat === "programmingLanguages") { setNewLang(""); } else { setNewTool(""); } } }} placeholder={`+ Add ${cat.slice(0, -1)}`} className="flex-1 px-4 py-2 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: "var(--bg-item)", color: "var(--text-primary)", border: "none" }} />
                      <button onClick={() => { const val = cat === "technical" ? newSkill : cat === "programmingLanguages" ? newLang : newTool; addSkill(cat, val); if (cat === "technical") { setNewSkill(""); } else if (cat === "programmingLanguages") { setNewLang(""); } else { setNewTool(""); } }} className="px-3 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "var(--bg-item)", color: "var(--text-muted)" }}><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Signature Projects */}
            <div className="rounded-xl p-6" style={{ backgroundColor: "var(--bg-primary)" }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4" style={{ color: "var(--accent)" }} />
                  <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>Signature Projects</h2>
                </div>
                <button onClick={handleAddProject} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors" style={{ color: "var(--accent)", backgroundColor: "rgba(59, 130, 246, 0.1)" }}>
                  <Plus className="w-3 h-3" /> Add Project
                </button>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                {profile.projects.length === 0 ? (
                  <div className="w-full py-8 text-center border-2 border-dashed rounded-xl" style={{ borderColor: "var(--border-primary)" }}>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>No projects added yet. Click "Add Project" to showcase your work.</p>
                  </div>
                ) : (
                  profile.projects.map((project, idx) => (
                    <div 
                      key={project.project_id || (project as { temp_id?: string }).temp_id || idx} 
                      className="min-w-[320px] md:min-w-[400px] p-5 rounded-xl group relative border border-transparent hover:border-blue-500/20 transition-all snap-start" 
                      style={{ backgroundColor: "var(--bg-item)" }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold truncate pr-8" style={{ color: "var(--text-primary)" }} title={project.name}>{project.name}</h3>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 bg-inherit rounded-lg px-1">
                          <button onClick={() => handleEditProject(project)} className="p-2 rounded-lg hover:bg-white/10" style={{ color: "var(--text-muted)" }}><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteProject(project.project_id, idx)} className="p-2 rounded-lg hover:bg-red-500/10" style={{ color: "#ef4444" }}><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <p className="text-sm mb-4 leading-relaxed line-clamp-3 h-15" style={{ color: "var(--text-secondary)" }}>{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {(project.tech_stack || []).slice(0, 4).map((tech) => (
                          <span key={tech} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: "rgba(139, 92, 246, 0.1)", color: "var(--accent)" }}>{tech}</span>
                        ))}
                        {(project.tech_stack || []).length > 4 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>+{(project.tech_stack || []).length - 4} more</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {/* Preferences */}
            <div className="rounded-xl p-6" style={{ backgroundColor: "var(--bg-primary)" }}>
              <div className="flex items-center gap-2 mb-6">
                <Briefcase className="w-4 h-4" style={{ color: "var(--accent)" }} />
                <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>Work Preferences</h2>
              </div>
              <div className="space-y-6">
                {(["projectSize", "workMode"] as const).map((key) => (
                  <div key={key}>
                    <label className="text-xs font-medium uppercase mb-3 block" style={{ color: "var(--text-muted)" }}>{key.replace(/([A-Z])/g, ' $1')}</label>
                    <div className="flex gap-2">
                      {(key === "projectSize" ? ["Small", "Medium", "Large"] : ["Onsite", "Remote"]).map((opt) => (
                        <button key={opt} onClick={() => togglePreference(key, opt)} className="px-4 py-2 rounded-lg text-xs font-medium transition-all" style={{ backgroundColor: profile.preferences[key] === opt ? "var(--accent)" : "var(--bg-item)", color: profile.preferences[key] === opt ? "white" : "var(--text-secondary)" }}>{opt}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths Section */}
            <div className="rounded-xl p-6" style={{ backgroundColor: "var(--bg-primary)" }}>
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-4 h-4" style={{ color: "var(--accent)" }} />
                <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>Strengths & Highlights</h2>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.strengths.map((strength) => (
                  <span key={strength} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm" style={{ backgroundColor: "var(--bg-item)", color: "var(--text-primary)" }}>{strength}<button onClick={() => removeStrength(strength)} className="ml-1 hover:opacity-70"><X className="w-3 h-3" /></button></span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={newStrength} onChange={(e) => setNewStrength(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addStrength(); }} placeholder="+ Add Strength" className="flex-1 px-4 py-2 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: "var(--bg-item)", color: "var(--text-primary)", border: "none" }} />
                <button onClick={addStrength} className="px-3 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "var(--bg-item)", color: "var(--text-muted)" }}><Plus className="w-4 h-4" /></button>
              </div>
            </div>
<<<<<<< HEAD

            {/* AI Curator Tip */}
            <div
              className="rounded-xl p-6"
              style={{
                backgroundColor: "#1e1b4b",
                background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-purple-300" />
                <h2 className="text-xs font-semibold uppercase tracking-wide text-purple-200">
                  AI Curator Tip
                </h2>
              </div>

              <p className="text-sm text-purple-100 mb-6">
                Your "Memory Score" is high, but adding more detail to your
                Projects Section could increase proposal win rates by up to 15%.
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-purple-300 uppercase mb-1">Last Updated</p>
                  <p className="text-purple-100 font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Oct 24, 2023 • 14:32
                  </p>
                </div>
                <div>
                  <p className="text-purple-300 uppercase mb-1">Profile Created</p>
                  <p className="text-purple-100 font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Jan 12, 2023
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4">
              <button
                className="text-xs font-medium transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                Export Memory JSON
              </button>
              <button
                className="text-xs font-medium transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                Duplicate Profile
              </button>
            </div>
=======
>>>>>>> e54f627 (improved UI)
          </div>
        </div>
      </div>

      {/* Project Modal */}
      {isProjectModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">Edit Project</h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="text-xs font-bold uppercase mb-1 block text-gray-500">Project Name</label>
                <input type="text" value={editingProject.name} onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="E-commerce Platform" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase mb-1 block text-gray-500">Description</label>
                <textarea value={editingProject.description} onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })} rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="A brief overview of what the project does..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase mb-1 block text-gray-500">Company Name</label>
                  <input type="text" value={editingProject.company_name} onChange={(e) => setEditingProject({ ...editingProject, company_name: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase mb-1 block text-gray-500">Your Role</label>
                  <input type="text" value={editingProject.role} onChange={(e) => setEditingProject({ ...editingProject, role: e.target.value })} className="w-full px-4 py-2 border rounded-lg outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                 <div className="col-span-1">
                   <label className="text-xs font-bold uppercase mb-1 block text-gray-500">Tech Stack</label>
                   <div className="flex gap-2 mb-2">
                     <input type="text" onKeyDown={(e) => { if (e.key === "Enter") { const val = (e.target as HTMLInputElement).value; if (val) { setEditingProject({ ...editingProject, tech_stack: [...editingProject.tech_stack, val] }); (e.target as HTMLInputElement).value = ""; } } }} placeholder="+ Add" className="w-full px-3 py-1.5 border rounded-lg text-sm" />
                   </div>
                   <div className="flex flex-wrap gap-1">
                     {editingProject.tech_stack.map(t => (
                       <span key={t} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] flex items-center gap-1">{t} <button onClick={() => setEditingProject({ ...editingProject, tech_stack: editingProject.tech_stack.filter(x => x !== t) })}><X className="w-2 h-2" /></button></span>
                     ))}
                   </div>
                 </div>
                 <div className="col-span-2">
                    <label className="text-xs font-bold uppercase mb-1 block text-gray-500">Highlights</label>
                    <textarea onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const val = (e.target as HTMLTextAreaElement).value; if (val) { setEditingProject({ ...editingProject, highlights: [...editingProject.highlights, val] }); (e.target as HTMLTextAreaElement).value = ""; } } }} rows={2} className="w-full px-3 py-1.5 border rounded-lg text-sm mb-2" placeholder="Press Enter to add a highlight..." />
                    <ul className="space-y-1">
                      {editingProject.highlights.map((h, i) => (
                        <li key={i} className="text-xs flex items-start gap-2 text-gray-600">
                          <span className="mt-1.5 w-1 h-1 bg-blue-500 rounded-full shrink-0" /> {h} <button onClick={() => setEditingProject({ ...editingProject, highlights: editingProject.highlights.filter((_, idx) => idx !== i) })} className="text-red-400 hover:text-red-600 ml-auto"><Trash2 className="w-3 h-3" /></button>
                        </li>
                      ))}
                    </ul>
                 </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={saveProject} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2"><Check className="w-4 h-4" /> Save Project</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
