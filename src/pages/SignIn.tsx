import { useState } from 'react'
import AuthLayout from '../components/AuthLayout'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <AuthLayout
      title="Sign In"
      description="Enter your credentials to access your workspace."
      footerText="Don't have an account?"
      footerLinkText="Sign Up"
      footerLinkPath="/signup"
    >
      <form className="mt-10 space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 tracking-wide">
            CORPORATE EMAIL
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 tracking-wide">
              PASSWORD
            </label>
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Forgot Password?
            </a>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full mt-8 py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
        >
          Sign In
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </form>
    </AuthLayout>
  )
}
