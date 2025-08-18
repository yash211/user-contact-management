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

const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
};

const contactsApi = {
  getContacts: (params) => api.get('/contacts', { params }),
  getAllContactsForAdmin: (params) => api.get('/contacts/admin/all', { params }),
  getContact: (id) => api.get(`/contacts/${id}`),
  createContact: (contactData) => {
    const formData = new FormData();
    Object.keys(contactData).forEach(key => {
      if (contactData[key] !== null && contactData[key] !== undefined && contactData[key] !== '') {
        formData.append(key, contactData[key]);
      }
    });
    return api.post('/contacts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateContact: (id, contactData, targetUserId = null) => {
    const params = {};
    if (targetUserId) { params.userId = targetUserId; }
    const formData = new FormData();
    Object.keys(contactData).forEach(key => {
      if (contactData[key] !== null && contactData[key] !== undefined && contactData[key] !== '') {
        formData.append(key, contactData[key]);
      }
    });
    return api.put(`/contacts/${id}`, formData, { 
      params,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteContact: (id, targetUserId = null) => {
    const params = {};
    if (targetUserId) { params.userId = targetUserId; }
    return api.delete(`/contacts/${id}`, { params });
  },
  exportContacts: (params) => api.get('/contacts/export', { params, responseType: 'blob' }),
};

const usersApi = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export { authApi, contactsApi, usersApi };


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
