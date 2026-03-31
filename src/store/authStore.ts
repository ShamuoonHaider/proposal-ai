import { create } from 'zustand'

interface User {
  name: string
  email: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  checkAuth: () => void
}

const getStoredAuth = () => {
  try {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      return { token, user: JSON.parse(userStr) }
    }
    return null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  checkAuth: () => {
    const auth = getStoredAuth()
    if (auth) {
      set({ ...auth, isAuthenticated: true, isLoading: false })
    } else {
      set({ token: null, user: null, isAuthenticated: false, isLoading: false })
    }
  },
  login: (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true, isLoading: false })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ token: null, user: null, isAuthenticated: false, isLoading: false })
  },
}))
