import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useToastStore } from "../store/toastStore";
import { API_ENDPOINTS } from "../lib/api";
import {
  User,
  Briefcase,
  Zap,
  Globe,
  Layers,
  Rocket,
  Sparkles,
  Plus,
  X,
  Edit2,
  ChevronDown,
  Calendar,
  Loader2,
} from "lucide-react";

// Types
interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
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
  memoryScore: 97,
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
  projects: Array<{
    company_name: string;
    name: string;
    description: string;
    problem: string;
    solution: string;
    impact: string;
    tech_stack: string[];
    role: string;
    highlights: string[];
  }>;
  preferences: {
    preferred_stack: string[];
    project_size: string;
    work_type: string;
    work_mode: string;
    availability: string;
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
  projects: (data.projects || []).map((p, idx) => ({
    id: idx.toString(),
    name: p.name || "",
    description: p.description || "",
    techStack: p.tech_stack || [],
    highlights: p.highlights || [],
  })),
  preferences: {
    preferredStack: data.preferences?.preferred_stack || [],
    projectSize: data.preferences?.project_size || "",
    workMode: data.preferences?.work_mode || "",
    workType: data.preferences?.work_type || "",
    availability: data.preferences?.availability || "",
  },
  memoryScore: data.score || 0,
});

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
};

const getAuthToken = () => localStorage.getItem("token");

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
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load memory";
      setError(msg);
      showToast(msg, "error");
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
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      // Save each changed section
      const sectionsToSave = ["identity", "skills", "experience", "preferences"];

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

      // Refresh data to get updated scores
      await fetchMemory();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save memory";
      showToast(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    fetchMemory();
    setHasChanges(false);
  };

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
              <span
                className="font-medium"
                style={{ color: "var(--accent)" }}
              >
                PROFILE EDITOR
              </span>
            </div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Memory Profile Editor
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Memory Score Badge */}
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--accent)" }}
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <span
                  className="text-xs font-medium block"
                  style={{ color: "var(--accent)" }}
                >
                  Memory Score:
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: "var(--accent)" }}
                >
                  {profile.memoryScore}%
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {hasChanges && (
              <button
                onClick={handleDiscard}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{
                  color: "var(--text-secondary)",
                  backgroundColor: "transparent",
                }}
              >
                Discard
              </button>
            )}
            <button
              onClick={handleSave}
              className="px-6 py-2.5 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              style={{
                backgroundColor: hasChanges ? "var(--accent)" : "var(--bg-item)",
                color: hasChanges ? "white" : "var(--text-muted)",
              }}
              disabled={!hasChanges || isSaving}
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Subtitle */}
        <p
          className="text-sm mb-8"
          style={{ color: "var(--text-muted)" }}
        >
          {isLoading
            ? "Loading your memory profile..."
            : error
            ? `Error: ${error}`
            : "High-fidelity profile detected. AI suggestions are highly accurate."}
        </p>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
          {/* Left Column - 7 cols */}
          <div className="lg:col-span-7 space-y-6">
            {/* Identity & Role */}
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              <div className="flex items-center gap-2 mb-6">
                <User className="w-4 h-4" style={{ color: "var(--accent)" }} />
                <h2
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: "var(--text-primary)" }}
                >
                  Identity & Role
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="text-xs font-medium uppercase mb-2 block"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.identity.fullName}
                    onChange={(e) => {
                      setProfile((prev) => ({
                        ...prev,
                        identity: { ...prev.identity, fullName: e.target.value },
                      }));
                      setHasChanges(true);
                    }}
                    className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: "var(--bg-item)",
                      color: "var(--text-primary)",
                      border: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    className="text-xs font-medium uppercase mb-2 block"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Professional Title
                  </label>
                  <input
                    type="text"
                    value={profile.identity.title}
                    onChange={(e) => {
                      setProfile((prev) => ({
                        ...prev,
                        identity: { ...prev.identity, title: e.target.value },
                      }));
                      setHasChanges(true);
                    }}
                    className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: "var(--bg-item)",
                      color: "var(--text-primary)",
                      border: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    className="text-xs font-medium uppercase mb-2 block"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Experience Level
                  </label>
                  <div className="relative">
                    <select
                      value={profile.identity.experienceLevel}
                      onChange={(e) => {
                        setProfile((prev) => ({
                          ...prev,
                          identity: {
                            ...prev.identity,
                            experienceLevel: e.target.value,
                          },
                        }));
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none appearance-none cursor-pointer"
                      style={{
                        backgroundColor: "var(--bg-item)",
                        color: "var(--text-primary)",
                        border: "none",
                      }}
                    >
                      <option value="">Select level</option>
                      <option value="Junior">Junior</option>
                      <option value="Mid-level">Mid-level</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead">Lead</option>
                      <option value="Principal">Principal</option>
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="text-xs font-medium uppercase mb-2 block"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={profile.identity.yearsOfExperience}
                    onChange={(e) => {
                      setProfile((prev) => ({
                        ...prev,
                        identity: {
                          ...prev.identity,
                          yearsOfExperience: parseInt(e.target.value) || 0,
                        },
                      }));
                      setHasChanges(true);
                    }}
                    className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: "var(--bg-item)",
                      color: "var(--text-primary)",
                      border: "none",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Skill Matrix */}
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-4 h-4" style={{ color: "var(--accent)" }} />
                <h2
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: "var(--text-primary)" }}
                >
                  Skill Matrix
                </h2>
              </div>

              {/* Technical Skills */}
              <div className="mb-6">
                <label
                  className="text-xs font-medium uppercase mb-3 block"
                  style={{ color: "var(--text-muted)" }}
                >
                  Technical Skills
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.skills.technical.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm"
                      style={{
                        backgroundColor: "var(--bg-item)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill("technical", skill)}
                        className="ml-1 hover:opacity-70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addSkill("technical", newSkill);
                        setNewSkill("");
                      }
                    }}
                    placeholder="+ Add Skill"
                    className="flex-1 px-4 py-2 rounded-lg text-sm focus:outline-none"
                    style={{
                      backgroundColor: "var(--bg-item)",
                      color: "var(--text-primary)",
                      border: "none",
                    }}
                  />
                  <button
                    onClick={() => {
                      addSkill("technical", newSkill);
                      setNewSkill("");
                    }}
                    className="px-3 py-2 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: "var(--bg-item)",
                      color: "var(--text-muted)",
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Programming Languages */}
              <div className="mb-6">
                <label
                  className="text-xs font-medium uppercase mb-3 block"
                  style={{ color: "var(--text-muted)" }}
                >
                  Programming Languages
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.skills.programmingLanguages.map((lang) => (
                    <span
                      key={lang}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm"
                      style={{
                        backgroundColor: "var(--bg-item)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {lang}
                      <button
                        onClick={() => removeSkill("programmingLanguages", lang)}
                        className="ml-1 hover:opacity-70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addSkill("programmingLanguages", newLang);
                        setNewLang("");
                      }
                    }}
                    placeholder="+ Add Language"
                    className="flex-1 px-4 py-2 rounded-lg text-sm focus:outline-none"
                    style={{
                      backgroundColor: "var(--bg-item)",
                      color: "var(--text-primary)",
                      border: "none",
                    }}
                  />
                  <button
                    onClick={() => {
                      addSkill("programmingLanguages", newLang);
                      setNewLang("");
                    }}
                    className="px-3 py-2 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: "var(--bg-item)",
                      color: "var(--text-muted)",
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Core Tools */}
              <div>
                <label
                  className="text-xs font-medium uppercase mb-3 block"
                  style={{ color: "var(--text-muted)" }}
                >
                  Core Tools
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.skills.tools.map((tool) => (
                    <span
                      key={tool}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm"
                      style={{
                        backgroundColor: "var(--bg-item)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {tool}
                      <button
                        onClick={() => removeSkill("tools", tool)}
                        className="ml-1 hover:opacity-70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addSkill("tools", newTool);
                        setNewTool("");
                      }
                    }}
                    placeholder="+ Add Tool"
                    className="flex-1 px-4 py-2 rounded-lg text-sm focus:outline-none"
                    style={{
                      backgroundColor: "var(--bg-item)",
                      color: "var(--text-primary)",
                      border: "none",
                    }}
                  />
                  <button
                    onClick={() => {
                      addSkill("tools", newTool);
                      setNewTool("");
                    }}
                    className="px-3 py-2 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: "var(--bg-item)",
                      color: "var(--text-muted)",
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Signature Projects */}
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4" style={{ color: "var(--accent)" }} />
                  <h2
                    className="text-sm font-semibold uppercase tracking-wide"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Signature Projects
                  </h2>
                </div>
                <button
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                  style={{
                    color: "var(--accent)",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                  }}
                >
                  <Plus className="w-3 h-3" />
                  Add Project
                </button>
              </div>

              <div className="space-y-4">
                {profile.projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: "var(--bg-item)" }}
                  >
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {project.name}
                    </h3>
                    <p
                      className="text-sm mb-4"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {project.description}
                    </p>

                    {/* Tech Stack */}
                    <div className="mb-4">
                      <label
                        className="text-xs font-medium uppercase mb-2 block"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Tech Stack
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: "rgba(139, 92, 246, 0.1)",
                              color: "var(--accent)",
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Key Highlights */}
                    <div>
                      <label
                        className="text-xs font-medium uppercase mb-2 block"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Key Highlights
                      </label>
                      <ul className="space-y-2">
                        {project.highlights.map((highlight, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                              style={{ backgroundColor: "var(--accent)" }}
                            />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                      <button
                        className="flex items-center gap-1 mt-3 text-xs font-medium"
                        style={{ color: "var(--accent)" }}
                      >
                        <Plus className="w-3 h-3" />
                        Add Highlight
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - 5 cols */}
          <div className="lg:col-span-5 space-y-6">
            {/* Work Preferences */}
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Briefcase
                  className="w-4 h-4"
                  style={{ color: "var(--accent)" }}
                />
                <h2
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: "var(--text-primary)" }}
                >
                  Work Preferences
                </h2>
              </div>

              {/* Preferred Stack */}
              <div className="mb-6">
                <label
                  className="text-xs font-medium uppercase mb-3 block"
                  style={{ color: "var(--text-muted)" }}
                >
                  Preferred Stack
                </label>
                <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--bg-item)" }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                    >
                      <Layers className="w-5 h-5" style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <p
                      className="font-medium text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Modern Backend Focus
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {profile.preferences.preferredStack.join(", ")}
                    </p>
                  </div>
                  <button className="ml-auto">
                    <Edit2
                      className="w-4 h-4"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </button>
                </div>
              </div>

              {/* Project Size */}
              <div className="mb-6">
                <label
                  className="text-xs font-medium uppercase mb-3 block"
                  style={{ color: "var(--text-muted)" }}
                >
                  Project Size
                </label>
                <div className="flex gap-2">
                  {["Small", "Medium", "Large"].map((size) => (
                    <button
                      key={size}
                      onClick={() => togglePreference("projectSize", size)}
                      className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
                      style={{
                        backgroundColor:
                          profile.preferences.projectSize === size
                            ? "var(--accent)"
                            : "var(--bg-item)",
                        color:
                          profile.preferences.projectSize === size
                            ? "white"
                            : "var(--text-secondary)",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Mode */}
              <div className="mb-6">
                <label
                  className="text-xs font-medium uppercase mb-3 block"
                  style={{ color: "var(--text-muted)" }}
                >
                  Work Mode
                </label>
                <div className="flex gap-2">
                  {["Onsite", "Remote"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => togglePreference("workMode", mode)}
                      className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
                      style={{
                        backgroundColor:
                          profile.preferences.workMode === mode
                            ? "var(--accent)"
                            : "var(--bg-item)",
                        color:
                          profile.preferences.workMode === mode
                            ? "white"
                            : "var(--text-secondary)",
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Type */}
              <div className="mb-6">
                <label
                  className="text-xs font-medium uppercase mb-3 block"
                  style={{ color: "var(--text-muted)" }}
                >
                  Work Type
                </label>
                <div className="relative">
                  <select
                    value={profile.preferences.workType}
                    onChange={(e) => {
                      setProfile((prev) => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          workType: e.target.value,
                        },
                      }));
                      setHasChanges(true);
                    }}
                    className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none appearance-none cursor-pointer"
                    style={{
                      backgroundColor: "var(--bg-item)",
                      color: "var(--text-primary)",
                      border: "none",
                    }}
                  >
                    <option value="">Select type</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>
              </div>

              {/* Availability */}
              <div>
                <label
                  className="text-xs font-medium uppercase mb-3 block"
                  style={{ color: "var(--text-muted)" }}
                >
                  Availability
                </label>
                <div className="relative">
                  <select
                    value={profile.preferences.availability}
                    onChange={(e) => {
                      setProfile((prev) => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          availability: e.target.value,
                        },
                      }));
                      setHasChanges(true);
                    }}
                    className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none appearance-none cursor-pointer"
                    style={{
                      backgroundColor: "var(--bg-item)",
                      color: "var(--text-primary)",
                      border: "none",
                    }}
                  >
                    <option value="">Select availability</option>
                    <option value="Immediately">Immediately</option>
                    <option value="2 Weeks">2 Weeks</option>
                    <option value="1 Month">1 Month</option>
                    <option value="Negotiable">Negotiable</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>
              </div>
            </div>

            {/* Domain Expertise */}
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Globe className="w-4 h-4" style={{ color: "var(--accent)" }} />
                <h2
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: "var(--text-primary)" }}
                >
                  Domain Expertise
                </h2>
              </div>

              {/* Industries */}
              <div className="mb-6">
                <label
                  className="text-xs font-medium uppercase mb-3 block"
                  style={{ color: "var(--text-muted)" }}
                >
                  Industries
                </label>
                <div className="flex flex-wrap gap-2">
                  {profile.experience.domains.map((domain) => (
                    <span
                      key={domain}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{
                        backgroundColor: "var(--bg-item)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {domain}
                    </span>
                  ))}
                  <button
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: "var(--bg-item)",
                      color: "var(--accent)",
                    }}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Project Types */}
              <div>
                <label
                  className="text-xs font-medium uppercase mb-3 block"
                  style={{ color: "var(--text-muted)" }}
                >
                  Project Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {profile.experience.projectTypes.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{
                        backgroundColor: "var(--bg-item)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {type}
                    </span>
                  ))}
                  <button
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: "var(--bg-item)",
                      color: "var(--accent)",
                    }}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

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
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
  );
}
