// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios-like functionality using fetch
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      credentials: 'include', // Include cookies for auth
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add body for POST/PUT requests
    if (options.data) {
      config.body = JSON.stringify(options.data);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // HTTP methods
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', data });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', data });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create instance
const api = new ApiService();

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
};

// Notes API
export const notesAPI = {
  getAllNotes: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return api.get(`/notes?${searchParams}`);
  },
  getNoteById: (id) => api.get(`/notes/${id}`),
  createNote: (noteData) => api.post('/notes', noteData),
  updateNote: (id, noteData) => api.put(`/notes/${id}`, noteData),
  deleteNote: (id) => api.delete(`/notes/${id}`),
  likeNote: (id) => api.post(`/notes/${id}/like`),
  unlikeNote: (id) => api.delete(`/notes/${id}/like`),
};

export default api;
