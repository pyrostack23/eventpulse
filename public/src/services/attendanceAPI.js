import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const attendanceAPI = {
  // Mark attendance using QR code
  markAttendance: async (registrationId) => {
    return axios.post(
      `${API_URL}/attendance/mark`,
      { registrationId },
      { headers: getAuthHeader() }
    );
  },

  // Get attendance list for an event
  getEventAttendance: async (eventId) => {
    return axios.get(
      `${API_URL}/attendance/event/${eventId}`,
      { headers: getAuthHeader() }
    );
  },

  // Get user's attendance history
  getUserAttendance: async (userId) => {
    return axios.get(
      `${API_URL}/attendance/user/${userId}`,
      { headers: getAuthHeader() }
    );
  }
};

export default attendanceAPI;
