import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/uiStore";
import { signUpSchema, type SignUpFormData } from "../lib/validations";
import { API_ENDPOINTS } from "../lib/api";
import AuthLayout from "../components/AuthLayout";

export default function SignUp() {
  const navigate = useNavigate();
  const { login, isAuthenticated, checkAuth } = useAuthStore();
  const { setSidebarOpen } = useUIStore();
  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<SignUpFormData>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear error when user starts typing
    if (id === "name" || id === "email" || id === "password") {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
    setServerError("");
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setServerError("");

    // Validate with Zod
    const result = signUpSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<SignUpFormData> = {};
      result.error.issues.forEach((error) => {
        const field = error.path[0] as keyof SignUpFormData;
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(API_ENDPOINTS.SIGNUP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle specific error messages from server
        if (res.status === 409 || res.status === 400) {
          if (data.message?.includes("email")) {
            setServerError("This email is already registered. Please sign in instead.");
          } else if (data.message) {
            setServerError(data.message);
          } else {
            setServerError("Sign up failed. Please try again.");
          }
        } else if (data.message) {
          setServerError(data.message);
        } else {
          setServerError("Sign up failed. Please try again.");
        }
        return;
      }

      // Token is in data.data.access_token
      const token = data.data?.access_token || data.token || data.accessToken;
      
      if (!token) {
        setServerError("Server did not return authentication token. Check console for response details.");
        return;
      }

      const user = data.data || data.user || { name: formData.name, email: formData.email };

      login(token, user);
      setSidebarOpen(false);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("Failed to fetch")) {
          setServerError("Unable to connect to server. Please check your connection.");
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign Up"
      description="Create your account to get started."
      footerText="Already have an account?"
      footerLinkText="Sign In"
      footerLinkPath="/signin"
    >
      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium tracking-wide"
            style={{ color: errors.name ? "#ef4444" : "var(--text-secondary)" }}
          >
            FULL NAME
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className={`mt-2 w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
              errors.name
                ? "border-red-500 focus:ring-red-500/20"
                : "focus:ring-blue-500/20"
            }`}
            style={{
              backgroundColor: "var(--bg-item)",
              borderColor: errors.name ? "#ef4444" : "var(--border-primary)",
              color: "var(--text-primary)",
            }}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium tracking-wide"
            style={{ color: errors.email ? "#ef4444" : "var(--text-secondary)" }}
          >
            CORPORATE EMAIL
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@company.com"
            className={`mt-2 w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
              errors.email
                ? "border-red-500 focus:ring-red-500/20"
                : "focus:ring-blue-500/20"
            }`}
            style={{
              backgroundColor: "var(--bg-item)",
              borderColor: errors.email ? "#ef4444" : "var(--border-primary)",
              color: "var(--text-primary)",
            }}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium tracking-wide"
            style={{ color: errors.password ? "#ef4444" : "var(--text-secondary)" }}
          >
            PASSWORD
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className={`mt-2 w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
              errors.password
                ? "border-red-500 focus:ring-red-500/20"
                : "focus:ring-blue-500/20"
            }`}
            style={{
              backgroundColor: "var(--bg-item)",
              borderColor: errors.password ? "#ef4444" : "var(--border-primary)",
              color: "var(--text-primary)",
            }}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
          <p
            className="mt-2 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Must be 8+ characters with uppercase, lowercase, and number
          </p>
        </div>

        {/* Server Error */}
        {serverError && (
          <div
            className="p-4 rounded-lg border flex items-start gap-3"
            style={{
              backgroundColor: "#fef2f2",
              borderColor: "#fecaca",
            }}
          >
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-8 py-3.5 px-6 text-white font-medium rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--accent)" }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "var(--accent-hover)";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "var(--accent)";
          }}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating account...
            </>
          ) : (
            <>
              Sign Up
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
