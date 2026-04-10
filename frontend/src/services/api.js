import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const authAPI = {
  login: async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    return response.data;
  },
  register: async (email, password, role = 'viewer') => {
    const response = await axios.post(`${API}/auth/register`, { email, password, role }, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  getMe: async () => {
    const response = await axios.get(`${API}/auth/me`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

export const blogAPI = {
  getPosts: async (publishedOnly = true) => {
    const response = await axios.get(`${API}/blog/posts?published_only=${publishedOnly}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  getPost: async (id) => {
    const response = await axios.get(`${API}/blog/posts/${id}`);
    return response.data;
  },
  createPost: async (postData) => {
    const response = await axios.post(`${API}/blog/posts`, postData, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  updatePost: async (id, postData) => {
    const response = await axios.put(`${API}/blog/posts/${id}`, postData, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  deletePost: async (id) => {
    const response = await axios.delete(`${API}/blog/posts/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

export const usersAPI = {
  getUsers: async () => {
    const response = await axios.get(`${API}/users`, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  createUser: async (email, password, role = 'viewer') => {
    const response = await axios.post(`${API}/users`, { email, password, role }, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await axios.delete(`${API}/users/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  resetPassword: async (id, new_password) => {
    const response = await axios.put(`${API}/users/${id}/password`, { new_password }, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  changeMyPassword: async (current_password, new_password) => {
    const response = await axios.put(`${API}/auth/change-password`, { current_password, new_password }, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

export const toolsAPI = {
  calculateSubnet: async (ip_address, cidr) => {
    const response = await axios.post(`${API}/tools/subnet-calculator`, { ip_address, cidr });
    return response.data;
  },
  generateQR: async (text, size = 300) => {
    const response = await axios.post(`${API}/tools/qr-generator`, { text, size });
    return response.data;
  },
  generatePassword: async (length, use_uppercase, use_lowercase, use_digits, use_symbols) => {
    const response = await axios.post(`${API}/tools/password-generator`, {
      length, use_uppercase, use_lowercase, use_digits, use_symbols
    });
    return response.data;
  },
  convertBase64: async (text, encode) => {
    const response = await axios.post(`${API}/tools/base64`, { text, encode });
    return response.data;
  },
  generateHash: async (text, algorithm) => {
    const response = await axios.post(`${API}/tools/hash`, { text, algorithm });
    return response.data;
  },
  validateJSON: async (json_string) => {
    const response = await axios.post(`${API}/tools/json-validator`, { json_string });
    return response.data;
  },
  convertUnits: async (value, from_unit, to_unit) => {
    const response = await axios.post(`${API}/tools/unit-converter`, { value, from_unit, to_unit });
    return response.data;
  },
  generateUUID: async () => {
    const response = await axios.get(`${API}/tools/uuid-generator`);
    return response.data;
  },
  encodeURL: async (text, encode) => {
    const response = await axios.post(`${API}/tools/url-encoder`, { text, encode });
    return response.data;
  },
  analyzePort: async (port) => {
    const response = await axios.post(`${API}/tools/port-analyzer`, { port });
    return response.data;
  }
};
