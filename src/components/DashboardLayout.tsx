import { useUIStore } from "../store/uiStore";
import { useAuthStore } from "../store/authStore";
import {
  LayoutDashboard,
  FileText,
  BrainCircuit,
  Copy,
  Settings,
  Plus,
  HelpCircle,
  Search,
  Bell,
  History,
  Menu,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ProfileDropdown } from "./ProfileDropdown";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Memory Builder", href: "/memory", icon: BrainCircuit },
  { name: "Proposals", href: "/proposals", icon: Copy },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen, setSidebarOpen, theme, setTheme } = useUIStore();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved as "light" | "dark");
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <div className="flex h-screen">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transition-colors border-r ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          backgroundColor: "var(--bg-primary)",
          borderColor: "var(--border-primary)",
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div
            className="px-6 py-5 border-b"
            style={{ borderColor: "var(--border-primary)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 22h20L12 2z" />
                </svg>
              </div>
              <div>
                <h1
                  className="font-semibold text-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  The Curator
                </h1>
                <p
                  className="text-xs font-medium tracking-wide"
                  style={{ color: "var(--text-muted)" }}
                >
                  AI ENGINE: ACTIVE
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: active ? "var(--bg-item)" : "transparent",
                    color: active
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    if (!active)
                      e.currentTarget.style.backgroundColor = "var(--bg-item)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active)
                      e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{
                      color: active
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                    }}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div
            className="p-4 border-t space-y-4"
            style={{ borderColor: "var(--border-primary)" }}
          >
            <Link
              to="/new-proposal"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 text-white text-sm font-medium rounded-lg transition-colors"
              style={{ backgroundColor: "var(--accent)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--accent-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--accent)")
              }
            >
              <Plus className="w-5 h-5" />
              New Proposal
            </Link>

            <Link
              to="/help"
              className="flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-secondary)")
              }
            >
              <HelpCircle className="w-5 h-5" />
              Help Center
            </Link>

            {/* User section */}
            <div
              className="pt-4 border-t"
              style={{ borderColor: "var(--border-primary)" }}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {user?.name || "User"}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header
          className="border-b px-4 lg:px-8 py-4"
          style={{
            backgroundColor: "var(--bg-primary)",
            borderColor: "var(--border-primary)",
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="text"
                  placeholder="Search architectural assets..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  style={{
                    backgroundColor: "var(--bg-item)",
                    color: "var(--text-primary)",
                    border: "none",
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="relative p-2.5 rounded-lg transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--bg-item)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <button
                className="p-2.5 rounded-lg transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--bg-item)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <History className="w-5 h-5" />
              </button>

              <button
                className="hidden sm:flex px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
                style={{
                  color: "var(--text-secondary)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--bg-item)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Upload
              </button>

              <button
                className="hidden sm:flex px-4 py-2.5 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors"
                style={{ backgroundColor: "var(--accent)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--accent-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--accent)")
                }
              >
                Generate AI
              </button>

              <ProfileDropdown />

              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2.5 rounded-lg transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--bg-item)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto p-4 lg:p-8"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
