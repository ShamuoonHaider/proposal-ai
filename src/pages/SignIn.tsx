import { useState } from "react";
import { Link } from "react-router-dom";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sign in with:", { email, password });
  };

  return (
    <div className="h-screen flex">
      {/* Left Panel - Marketing */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 bg-gradient-to-br from-slate-50 via-blue-50 to-white flex-col justify-center p-12 xl:p-16">
        <div className="max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L12 22" />
                <path d="M12 6L8 22" />
                <path d="M12 6L16 22" />
              </svg>
            </div>
            <span className="text-slate-900 text-xl font-semibold">
              Proposal Ai
            </span>
          </div>

          {/* Hero Content */}
          <div className="mt-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium tracking-wide">
              THE DIGITAL CURATOR
            </div>

            <h1 className="mt-6 text-4xl xl:text-5xl font-semibold text-slate-900 leading-tight">
              Intelligent Proposals from Professional Memories.
            </h1>

            <p className="mt-6 text-base text-slate-600 leading-relaxed">
              Leverage your firm's collective expertise to generate precise,
              winning documents in minutes, not days.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-white">
        <div className="w-full max-w-md">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Sign In</h2>
            <p className="mt-2 text-slate-600">
              Enter your credentials to access your workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 tracking-wide"
              >
                CORPORATE EMAIL
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 tracking-wide"
                >
                  PASSWORD
                </label>
                <a
                  href="#"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Forgot Password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                required
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full mt-8 py-3.5 px-6 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              Sign In
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-slate-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
