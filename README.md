# Proposal AI

An AI-powered proposal generation platform built for architectural firms. Upload professional documents, generate tailored proposals from job postings, and manage your proposal history — all powered by a backend AI engine with real-time streaming.

## 🚀 Features

- **AI-Powered Proposal Generation** — Paste a job posting and get a tailored proposal streamed in real-time via Server-Sent Events (SSE)
- **Document Management** — Upload and categorize PDFs (CVs, portfolios, cover letters, LinkedIn PDFs, certificates) to build your firm's expertise memory
- **Proposal History** — Browse, view, copy, and delete previously generated proposals with pagination support
- **Authentication** — Secure sign-in/sign-up with JWT token-based auth
- **Dark/Light Mode** — Theme toggle with preference persistence in localStorage
- **Responsive Design** — Collapsible sidebar, mobile-friendly layout

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 19 |
| **Language** | TypeScript 5.9 (strict mode) |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS 4 |
| **Routing** | React Router DOM 7 |
| **State Management** | Zustand 5 |
| **Form Validation** | Zod 4 |
| **Icons** | Lucide React |
| **Notifications** | React Toastify |
| **Package Manager** | Bun |

## 📁 Project Structure

```
proposal-ai/
├── public/                     # Static assets
├── src/
│   ├── assets/                 # Images and media
│   ├── components/             # Reusable UI components
│   │   ├── AuthLayout.tsx      # Two-panel layout for auth pages
│   │   ├── DashboardLayout.tsx # Main app shell with sidebar & header
│   │   ├── DeleteConfirmModal.tsx
│   │   ├── FileUpload.tsx      # Drag-and-drop PDF uploader
│   │   ├── ProfileDropdown.tsx
│   │   ├── ProposalModal.tsx
│   │   ├── ToastContainer.tsx
│   │   └── ToggleThemeBtn.tsx
│   ├── lib/                    # Utilities and configuration
│   │   ├── api.ts              # API base URL and endpoint constants
│   │   └── validations.ts      # Zod schemas for form validation
│   ├── pages/                  # Route-level components
│   │   ├── Dashboard.tsx
│   │   ├── Documents.tsx       # Document upload & management
│   │   ├── NewProposal.tsx     # AI proposal generation with SSE
│   │   ├── Proposals.tsx       # Proposal history with pagination
│   │   ├── Settings.tsx
│   │   ├── SignIn.tsx
│   │   └── SignUp.tsx
│   ├── store/                  # Zustand state stores
│   │   ├── authStore.ts        # Auth state (user, token, login/logout)
│   │   ├── toastStore.ts       # Notification wrapper
│   │   └── uiStore.ts          # UI state (sidebar, theme)
│   ├── types/                  # TypeScript type definitions
│   │   └── proposal.ts
│   ├── App.tsx                 # Root component with route definitions
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles and theme variables
├── .env.example                # Environment variable template
├── vite.config.ts              # Vite configuration
└── package.json
```

## 📋 Prerequisites

- **Node.js** 18+ or **Bun** 1.0+
- A running instance of the backend API server (FastAPI-based)

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and configure the following:

```env
VITE_API_BASE_URL=http://localhost:8000
```

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API server |

## 🏃 Getting Started

### 1. Install Dependencies

```bash
bun install
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your backend API URL
```

### 3. Start Development Server

```bash
bun run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

## 📜 Available Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start Vite dev server with Hot Module Replacement (HMR) |
| `bun run build` | Type-check and build for production |
| `bun run lint` | Run ESLint |
| `bun run preview` | Preview the production build locally |

## 🔌 API Endpoints

This frontend connects to a backend API. The following endpoints are expected:

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/users/signin` | POST | User login (returns `data.data.access_token`) |
| `/api/v1/users/signup` | POST | User registration (returns `data.data.access_token`) |
| `/api/v1/upload-documents` | POST | Upload PDFs (multipart/form-data) |
| `/api/v1/proposals` | GET | List proposals (paginated) |
| `/api/v1/proposals/:id` | GET | Get single proposal details |
| `/api/v1/proposals/:id` | DELETE | Delete a proposal |
| `/api/v1/generate-proposal` | POST | Generate proposal via SSE streaming |

## 🧭 Routes

| Route | Description | Status |
|---|---|---|
| `/` | Redirects to `/signin` | ✅ |
| `/signin` | Login page | ✅ |
| `/signup` | Registration page | ✅ |
| `/dashboard` | Dashboard | 🚧 Stub |
| `/documents` | Document upload & management | ✅ |
| `/proposals` | Proposal history | ✅ |
| `/proposals/new` | Generate new proposal | ✅ |
| `/settings` | Settings | 🚧 Stub |

## 🎨 Theming

The app supports light and dark modes using CSS custom properties. Theme preference is stored in `localStorage` under the `theme` key.

- **Light mode**: Dark slate accent (`#0f172a`)
- **Dark mode**: Purple accent (`#8d4fff`)

Toggle theme via the profile dropdown in the header.

## 🔐 Authentication

- JWT tokens are stored in `localStorage` under the `token` key
- User info is stored under the `user` key
- Unauthenticated users are redirected to `/signin`
- Password requirements: 8+ characters, uppercase, lowercase, and number

## 📤 Document Upload

Documents are categorized into 5 types, each mapping to a specific backend field name:

| Category | Field Name |
|---|---|
| CV/Resume | `cv` |
| Portfolio | `portfolio` |
| Cover Letter | `cover_letter` |
| LinkedIn PDF | `linkedin` |
| Certificate | `certificate` |

Only PDF files are accepted.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.
