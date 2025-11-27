import axios from 'axios';

// Get API base URL from environment or window config
const API_BASE_URL = process.env.REACT_APP_API_URL || 
                     (window.EVENTPULSE_CONFIG && window.EVENTPULSE_CONFIG.API_BASE_URL) || 
                     'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - Add auth token to requests
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

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Extract error message from various possible response structures
      const errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          (error.response.data?.errors && error.response.data.errors.length > 0 
                            ? error.response.data.errors[0].message 
                            : null) ||
                          error.response.statusText || 
                          'An error occurred';
      
      // Handle specific error codes
      switch (error.response.status) {
        case 400:
          // Bad Request - validation errors
          console.error('Validation Error:', errorMessage);
          if (error.response.data?.errors) {
            console.error('Field errors:', error.response.data.errors);
          }
          break;
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden:', errorMessage);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', errorMessage);
          break;
        case 429:
          // Too many requests
          console.error('Rate limit exceeded. Please try again later.');
          break;
        case 500:
          // Server error
          console.error('Server error:', errorMessage);
          break;
        default:
          console.error('API Error:', errorMessage);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error: No response from server');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API ENDPOINTS
// ============================================

export const authAPI = {
  // Register new user
  register: (userData) => api.post('/auth/register', userData),
  
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Logout user
  logout: () => api.post('/auth/logout'),
  
  // Get current user profile
  getProfile: () => api.get('/auth/profile'),
  
  // Update user profile
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  
  // Change password
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  
  // Request password reset
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // Reset password with token
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  
  // Verify email
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  
  // Delete account
  deleteAccount: () => api.delete('/auth/account'),
};

// ============================================
// EVENTS API ENDPOINTS
// ============================================

export const eventsAPI = {
  // Get all events (with optional filters)
  getAll: (params) => api.get('/events', { params }),
  
  // Get single event by ID
  getById: (id) => api.get(`/events/${id}`),
  
  // Create new event
  create: (eventData) => api.post('/events', eventData),
  
  // Update event
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  
  // Delete event
  delete: (id) => api.delete(`/events/${id}`),
  
  // Upload event image
  uploadImage: (id, formData) => api.post(`/events/${id}/upload-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Get upcoming events
  getUpcoming: (params) => api.get('/events/upcoming', { params }),
  
  // Get past events
  getPast: (params) => api.get('/events/past', { params }),
  
  // Search events
  search: (query) => api.get('/events/search', { params: { q: query } }),
  
  // Get events by category
  getByCategory: (category) => api.get(`/events/category/${category}`),
  
  // Get featured events
  getFeatured: () => api.get('/events/featured'),
};

// ============================================
// REGISTRATIONS API ENDPOINTS
// ============================================

export const registrationsAPI = {
  // Register for an event
  register: (eventId, registrationData) => api.post(`/registrations/${eventId}`, registrationData),
  
  // Cancel registration
  cancel: (registrationId) => api.delete(`/registrations/${registrationId}`),
  
  // Get user's registrations
  getMyRegistrations: () => api.get('/registrations/my-registrations'),
  
  // Get registrations for an event (admin/teacher)
  getEventRegistrations: (eventId) => api.get(`/registrations/event/${eventId}`),
  
  // Check-in attendee
  checkIn: (registrationId) => api.put(`/registrations/${registrationId}/check-in`),
  
  // Generate QR code for registration
  generateQR: (registrationId) => api.get(`/registrations/${registrationId}/qr-code`),
  
  // Verify QR code
  verifyQR: (qrData) => api.post('/registrations/verify-qr', { qrData }),
  
  // Get registration statistics
  getStats: (eventId) => api.get(`/registrations/stats/${eventId}`),
};

// ============================================
// NOTIFICATIONS API ENDPOINTS
// ============================================

export const notificationsAPI = {
  // Get all notifications for current user
  getAll: () => api.get('/notifications'),
  
  // Get unread notifications count
  getUnreadCount: () => api.get('/notifications/unread-count'),
  
  // Mark notification as read
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  
  // Mark all notifications as read
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  
  // Delete notification
  delete: (notificationId) => api.delete(`/notifications/${notificationId}`),
  
  // Get notification preferences
  getPreferences: () => api.get('/notifications/preferences'),
  
  // Update notification preferences
  updatePreferences: (preferences) => api.put('/notifications/preferences', preferences),
};

// ============================================
// ANALYTICS API ENDPOINTS
// ============================================

export const analyticsAPI = {
  // Get dashboard overview
  getOverview: () => api.get('/analytics/overview'),
  
  // Get dashboard analytics (real-time)
  getDashboard: () => api.get('/analytics/dashboard'),
  
  // Get event analytics
  getEventAnalytics: (eventId) => api.get(`/analytics/event/${eventId}`),
  
  // Get user engagement metrics
  getUserEngagement: (params) => api.get('/analytics/user-engagement', { params }),
  
  // Get registration trends
  getRegistrationTrends: (params) => api.get('/analytics/registration-trends', { params }),
  
  // Get popular events
  getPopularEvents: (params) => api.get('/analytics/popular-events', { params }),
  
  // Get attendance statistics
  getAttendanceStats: (params) => api.get('/analytics/attendance', { params }),
  
  // Export analytics data
  exportData: (params) => api.get('/analytics/export', { 
    params,
    responseType: 'blob'
  }),
};

// ============================================
// ATTENDANCE API
// ============================================

export const attendanceAPI = {
  // Mark attendance using QR code
  markAttendance: (registrationId) => api.post('/attendance/mark', { registrationId }),
  
  // Get attendance list for an event
  getEventAttendance: (eventId) => api.get(`/attendance/event/${eventId}`),
  
  // Get user's attendance history
  getUserAttendance: (userId) => api.get(`/attendance/user/${userId}`)
};

// ============================================
// HEALTH CHECK
// ============================================

export const healthCheck = () => api.get('/health');

// Export the axios instance for custom requests
export default api;
