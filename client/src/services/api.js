import axios from 'axios';

// Use environment variable if provided, or default to Vite proxy / relative path
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach JWT bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expiration gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config && (error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register'));
    if (error.response && error.response.status === 401 && !isAuthRoute) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  setupAdmin: (adminData) => api.post('/auth/setup-admin', adminData),
  getMe: () => api.get('/auth/me'),
  updatePassword: (passwordData) => api.put('/auth/update-password', passwordData),
};

// Dashboard Services
export const dashboardService = {
  getHRStats: () => api.get('/dashboard/hr'),
  getManagerStats: () => api.get('/dashboard/manager'),
  getEmployeeStats: () => api.get('/dashboard/employee'),
};

// Employee Services
export const employeeService = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  toggleStatus: (id) => api.patch(`/employees/${id}/status`),
  updateMyProfile: (data) => api.put('/employees/me/profile', data),
};

// Manager Services
export const managerService = {
  getAll: () => api.get('/managers'),
  assignTeam: (id, employeeUserIds) => api.post(`/managers/${id}/assign`, { employeeUserIds }),
  removeTeamMember: (id, employeeUserId) => api.post(`/managers/${id}/remove`, { employeeUserId }),
  getMyTeam: () => api.get('/managers/my-team'),
};

// Attendance Services
export const attendanceService = {
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: (data) => api.post('/attendance/check-out', data),
  getMyAttendance: (params) => api.get('/attendance/me', { params }),
  getTeamAttendance: (params) => api.get('/attendance/team', { params }),
  getAllAttendance: (params) => api.get('/attendance', { params }),
};

// Leave Services
export const leaveService = {
  apply: (data) => api.post('/leaves', data),
  getMyLeaves: () => api.get('/leaves/me'),
  getTeamLeaves: (params) => api.get('/leaves/team', { params }),
  getAllLeaves: (params) => api.get('/leaves', { params }),
  review: (id, data) => api.patch(`/leaves/${id}/status`, data),
  cancel: (id) => api.delete(`/leaves/${id}`),
};

// Announcement Services
export const announcementService = {
  getAll: () => api.get('/announcements'),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

// Training Services
export const trainingService = {
  getAll: (params) => api.get('/trainings', { params }),
  getById: (id) => api.get(`/trainings/${id}`),
  create: (data) => api.post('/trainings', data),
  update: (id, data) => api.put(`/trainings/${id}`, data),
  enroll: (id) => api.post(`/trainings/${id}/enroll`),
  updateEnrollment: (id, userId, data) => api.patch(`/trainings/${id}/enrollment/${userId}`, data),
};

// Performance Services
export const performanceService = {
  create: (data) => api.post('/performance', data),
  getMyPerformance: () => api.get('/performance/me'),
  getTeamPerformance: () => api.get('/performance/team'),
  getAllPerformance: () => api.get('/performance'),
};

// Notification Services
export const notificationService = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export default api;
