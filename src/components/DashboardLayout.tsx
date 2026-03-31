import { type ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BrainCircuit,
  FileText,
  Settings,
  Plus,
  HelpCircle,
  Search,
  Bell,
  History,
  Menu,
  Copy,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Memory Builder", href: "/memory", icon: BrainCircuit },
    { name: "Templates", href: "/templates", icon: Copy },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-slate-200
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-slate-200">
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
                <h1 className="text-slate-900 font-semibold text-lg leading-tight">
                  The Curator
                </h1>
                <p className="text-xs text-slate-500 font-medium tracking-wide">
                  AI ENGINE: ACTIVE
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive(item.href)
                        ? "bg-slate-50 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive(item.href) ? "text-slate-900" : "text-slate-400"}`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-slate-200 space-y-4">
            <Link
              to="/new-proposal"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Proposal
            </Link>

            <Link
              to="/help"
              className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              Help Center
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-6 h-6 text-slate-700" />
            </button>
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search architectural assets..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button className="relative p-2.5 rounded-lg hover:bg-slate-100 transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* History */}
              <button className="p-2.5 rounded-lg hover:bg-slate-100 transition-colors">
                <History className="w-5 h-5 text-slate-600" />
              </button>

              {/* Upload button */}
              <button className="hidden sm:flex px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                Upload
              </button>

              {/* Generate AI button */}
              <button className="hidden sm:flex px-4 py-2.5 bg-blue-900 cursor-pointer hover:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors">
                Generate AI
              </button>

              {/* User avatar */}
              <button className="ml-2 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                JD
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
