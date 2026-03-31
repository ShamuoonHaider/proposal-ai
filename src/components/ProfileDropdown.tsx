import { useRef, useState } from "react";
import { useUIStore } from "../store/uiStore";
import { useAuthStore } from "../store/authStore";
import { User, Settings, LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-3 p-2 rounded-lg hover:bg-(var(--bg-item)) transition-colors"
      >
        <div className="w-9 h-9 rounded-full border-2 border-gray-500 flex items-center justify-center text-white text-sm font-medium transition-transform duration-300 ease-in-out hover:scale-110">
          {user?.name?.charAt(0) || "U"}
        </div>
        {/* <div className="text-left hidden md:block">
          <p
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {user?.name || "User"}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {user?.email || "user@example.com"}
          </p>
        </div> */}
        {/* <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          style={{ color: "var(--text-muted)" }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg> */}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 mt-2 w-72 rounded-xl border shadow-lg z-50 overflow-hidden"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border-primary)",
            }}
          >
            {/* User info header */}
            <div
              className="px-4 py-3 border-b"
              style={{ borderColor: "var(--border-primary)" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg--to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>

              {/* Theme toggle */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  {theme === "dark" ? (
                    <Moon
                      className="w-4 h-4"
                      style={{ color: "var(--text-muted)" }}
                    />
                  ) : (
                    <Sun
                      className="w-4 h-4"
                      style={{ color: "var(--text-muted)" }}
                    />
                  )}
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {theme === "dark" ? "Dark" : "Light"} Mode
                  </span>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`w-12 h-6 rounded-full p-1 relative transition-colors ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-transform ${
                      theme === "dark"
                        ? "bg-indigo-100 translate-x-6"
                        : "bg-slate-600 translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-2">
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--bg-item)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--bg-item)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>

            {/* Logout */}
            <div
              className="py-2 border-t"
              style={{ borderColor: "var(--border-primary)" }}
            >
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                style={{ color: "#ef4444" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--bg-item)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
