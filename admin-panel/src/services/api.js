import axios from 'axios';

// For local testing with backend on port 5000. In production, use nginx proxy or set VITE_API_URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://43.164.192.125/api';
const SERVER_BASE = API_BASE.replace('/api', '') || '';

const api = axios.create({
  baseURL: API_BASE,
});

// Helper to get full image URL from relative path
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${SERVER_BASE}${path}`;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  login: (email, password) => api.post('/admin/login', { email, password }),
  getDashboard: () => api.get('/admin/dashboard'),

  getUsers: (params) => api.get('/admin/users', { params }),
  banUser: (id) => api.put(`/admin/users/${id}/ban`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  getCharacters: () => api.get('/admin/characters'),
  createCharacter: (data) => api.post('/admin/characters', data),
  updateCharacter: (id, data) => api.put(`/admin/characters/${id}`, data),
  deleteCharacter: (id) => api.delete(`/admin/characters/${id}`),

  getChats: (params) => api.get('/admin/chats', { params }),
  getChatMessages: (sessionId) => api.get(`/admin/chats/${sessionId}/messages`),
  deleteChat: (sessionId) => api.delete(`/admin/chats/${sessionId}`),

  // Analytics
  getAnalytics: (range) => api.get('/admin/analytics', { params: { range } }),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),

  // Admin password
  changeAdminPassword: (currentPassword, newPassword) =>
    api.put('/admin/change-password', { currentPassword, newPassword }),

  // SMS Management
  getSMS: (params) => api.get('/admin/sms', { params }),
  getSMSStats: (params) => api.get('/admin/sms/stats', { params }),
  getUserSMS: (userId, params) => api.get(`/admin/sms/user/${userId}`, { params }),
  markSMSRead: (id) => api.put(`/admin/sms/${id}/read`),
  deleteSMS: (id) => api.delete(`/admin/sms/${id}`),
  deleteOrphanSMS: () => api.delete('/admin/sms-orphans'),

  // Notifications
  getNotifications: (params) => api.get('/admin/notifications', { params }),
  sendNotification: (data) => api.post('/admin/notifications/send', data),
  deleteNotification: (id) => api.delete(`/admin/notifications/${id}`),

  // System Settings (OpenAI, MongoDB, etc.)
  getSystemSettings: () => api.get('/admin/system-settings'),
  updateSystemSetting: (key, value) => api.put(`/admin/system-settings/${key}`, { value }),
  testOpenAI: () => api.post('/admin/system-settings/test-openai'),
  testMongoDB: () => api.post('/admin/system-settings/test-mongodb'),
};

export default api;
