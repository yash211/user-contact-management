import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
};

export const contactsApi = {
  getContacts: (params) => api.get('/contacts', { params }),
  getAllContactsForAdmin: (params) => api.get('/contacts/admin/all', { params }),
  createContact: (contactData) => {
    // If there's a photo file, create FormData for multipart upload
    if (contactData.photo && contactData.photo instanceof File) {
      const formData = new FormData();
      formData.append('name', contactData.name);
      formData.append('email', contactData.email);
      formData.append('phone', contactData.phone);
      formData.append('photo', contactData.photo);
      
      return api.post('/contacts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    
    // Otherwise, send as JSON
    return api.post('/contacts', contactData);
  },
  updateContact: (id, contactData, targetUserId = null) => {
    // Build query parameters
    const params = {};
    if (targetUserId) {
      params.userId = targetUserId;
    }
    
    // If there's a photo file, create FormData for multipart upload
    if (contactData.photo && contactData.photo instanceof File) {
      const formData = new FormData();
      formData.append('name', contactData.name);
      formData.append('email', contactData.email);
      formData.append('phone', contactData.phone);
      formData.append('photo', contactData.photo);
      
      return api.put(`/contacts/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params,
      });
    }
    
    // Otherwise, send as JSON
    return api.put(`/contacts/${id}`, contactData, { params });
  },
  deleteContact: (id, targetUserId = null) => {
    // Build query parameters
    const params = {};
    if (targetUserId) {
      params.userId = targetUserId;
    }
    
    return api.delete(`/contacts/${id}`, { params });
  },
  exportContacts: (params) => api.get('/contacts/export/csv', { 
    params,
    responseType: 'blob' // Important for file download
  }),
};



export const tokenService = {
  setToken: (token) => {
    Cookies.set('token', token, { expires: 7, secure: false, sameSite: 'lax' });
  },
  getToken: () => Cookies.get('token'),
  removeToken: () => Cookies.remove('token'),
  isTokenValid: () => {
    const token = Cookies.get('token');
    return !!token;
  },
};

export default api;
