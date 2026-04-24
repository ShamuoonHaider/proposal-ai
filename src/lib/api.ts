import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const API_ENDPOINTS = {
  // Auth
  SIGN_UP: `${API_BASE_URL}/api/v1/users/signup`,
  SIGNUP: `${API_BASE_URL}/api/v1/users/signup`,
  SIGN_IN: `${API_BASE_URL}/api/v1/users/signin`,
  SIGNIN: `${API_BASE_URL}/api/v1/users/signin`,
  LOGIN: `${API_BASE_URL}/api/v1/users/login`,

  // Documents
  UPLOAD_DOCUMENTS: `${API_BASE_URL}/api/v1/upload-documents`,
  LIST_DOCUMENTS: `${API_BASE_URL}/api/v1/documents`,

  // Memory
  GET_MEMORY: `${API_BASE_URL}/api/v1/memory`,
  UPDATE_MEMORY: `${API_BASE_URL}/api/v1/memory`,
  PATCH_MEMORY_SECTION: (section: string) => `${API_BASE_URL}/api/v1/memory/${section}`,
  GENERATE_MEMORY: `${API_BASE_URL}/api/v1/generate-memory`,
  MEMORY_CONFIDENCE: `${API_BASE_URL}/api/v1/memory/confidence`,

  // Proposals
  GENERATE_PROPOSAL: `${API_BASE_URL}/api/v1/generate-proposal`,
  LIST_PROPOSALS: `${API_BASE_URL}/api/v1/proposals`,
  GET_PROPOSAL: (id: number) => `${API_BASE_URL}/api/v1/proposals/${id}`,
  DELETE_PROPOSAL: (id: number) => `${API_BASE_URL}/api/v1/proposals/${id}`,

  // Sample Proposals
  SAMPLE_PROPOSALS: `${API_BASE_URL}/api/v1/sample-proposals`,
  SAMPLE_PROPOSAL_DETAIL: (id: number) => `${API_BASE_URL}/api/v1/sample-proposals/${id}`,

  // Dashboard
  DASHBOARD: `${API_BASE_URL}/api/v1/dashboard`,
  GET_DASHBOARD: `${API_BASE_URL}/api/v1/dashboard`,
  DASHBOARD_ACTIVITY: `${API_BASE_URL}/api/v1/dashboard/activity`,
  GET_DASHBOARD_ACTIVITY: `${API_BASE_URL}/api/v1/dashboard/activity`,
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the JWT token in every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
