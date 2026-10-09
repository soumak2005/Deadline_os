import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('deadlinesos_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired and not on login page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('deadlinesos_token');
        localStorage.removeItem('deadlinesos_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put('/auth/profile', data);
    return res.data;
  }
};

// Task Services
export const taskService = {
  getTasks: async () => {
    const res = await api.get('/tasks');
    return res.data;
  },
  createTask: async (taskData) => {
    const res = await api.post('/tasks', taskData);
    return res.data;
  },
  getTaskById: async (id) => {
    const res = await api.get(`/tasks/${id}`);
    return res.data;
  },
  updateProgress: async (id, progressData) => {
    const res = await api.patch(`/tasks/${id}/progress`, progressData);
    return res.data;
  },
  updateTask: async (id, taskData) => {
    const res = await api.put(`/tasks/${id}`, taskData);
    return res.data;
  },
  deleteTask: async (id) => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  }
};

// Planner Services
export const plannerService = {
  getSchedule: async () => {
    const res = await api.get('/planner/generate');
    return res.data;
  },
  rebalance: async (data = {}) => {
    const res = await api.post('/planner/rebalance', data);
    return res.data;
  }
};

// Analytics Services
export const analyticsService = {
  getAnalytics: async () => {
    const res = await api.get('/analytics');
    return res.data;
  }
};

export default api;
