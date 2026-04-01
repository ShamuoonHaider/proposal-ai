export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
  // Auth
  SIGNIN: `${API_BASE_URL}/api/v1/users/signin`,
  SIGNUP: `${API_BASE_URL}/api/v1/users/signup`,
  
  // Documents
  UPLOAD_DOCUMENTS: `${API_BASE_URL}/api/v1/upload-documents`,
  
  // Proposals
  PROPOSALS: `${API_BASE_URL}/api/v1/proposals`,
  GENERATE_PROPOSAL: `${API_BASE_URL}/api/v1/generate-proposal`,
} as const;
