import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const announcementService = {
  getAll: () => api.get('/announcements'),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  remove: (id) => api.delete(`/announcements/${id}`),
};

export const leaveService = {
  apply: (data) => api.post('/leaves', data),
  getMyLeaves: () => api.get('/leaves/me'),
  getAll: (params) => api.get('/leaves', { params }),
  getTeam: (params) => api.get('/leaves/team', { params }),
  review: (id, data) => api.patch(`/leaves/${id}/status`, data),
};

export const attendanceService = {
  checkIn: (data = {}) => api.post('/attendance/check-in', data),
  checkOut: (data = {}) => api.post('/attendance/check-out', data),
  getMyAttendance: (params) => api.get('/attendance/me', { params }),
  getAll: (params) => api.get('/attendance', { params }),
};

export const employeeService = {
  getAll: (params) => api.get('/employees', { params }),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  toggleStatus: (id) => api.patch(`/employees/${id}/status`),
};

export const managerService = {
  getAll: () => api.get('/managers'),
  getMyTeam: () => api.get('/managers/my-team'),
  assignTeam: (id, employeeUserIds) => api.post(`/managers/${id}/assign`, { employeeUserIds }),
};

export const trainingService = {
  getAll: () => api.get('/trainings'),
  create: (data) => api.post('/trainings', data),
  update: (id, data) => api.put(`/trainings/${id}`, data),
  updateEnrollment: (id, userId, data) => api.patch(`/trainings/${id}/enrollment/${userId}`, data),
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;