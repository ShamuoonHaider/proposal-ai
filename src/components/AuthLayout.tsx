import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  title: string
  description: string
  children: ReactNode
  footerText: string
  footerLinkText: string
  footerLinkPath: string
}

export default function AuthLayout({
  title,
  description,
  children,
  footerText,
  footerLinkText,
  footerLinkPath,
}: AuthLayoutProps) {
  return (
    <div className="h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 bg-gradient-to-br from-slate-50 via-blue-50 to-white flex-col justify-center p-12 xl:p-16">
        <div className="max-w-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L12 22M12 6L8 22M12 6L16 22" />
              </svg>
            </div>
            <span className="text-slate-900 text-xl font-semibold">Architectural Intelligence</span>
          </div>

          <div className="mt-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium tracking-wide">
              THE DIGITAL CURATOR
            </div>
            <h1 className="mt-6 text-4xl xl:text-5xl font-semibold text-slate-900 leading-tight">
              Intelligent Proposals from Professional Memories.
            </h1>
            <p className="mt-6 text-base text-slate-600 leading-relaxed">
              Leverage your firm's collective expertise to generate precise, winning documents in minutes, not days.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-2 text-slate-600">{description}</p>

          {children}

          <p className="mt-8 text-center text-slate-600">
            {footerText}{' '}
            <Link to={footerLinkPath} className="font-medium text-blue-600 hover:text-blue-700">
              {footerLinkText}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
