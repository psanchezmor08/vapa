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
  },
  scanPorts: async (host, ports = "common") => {
    const response = await axios.post(`${API}/tools/port-scan`, { host, ports });
    return response.data;
  },
  ping: async (host, count = 4) => {
    const response = await axios.post(`${API}/tools/ping`, { host, count });
    return response.data;
  },
  ipv4ToIpv6: async (ip) => {
    const response = await axios.post(`${API}/tools/ipv4-to-ipv6`, { ip });
    return response.data;
  },
  dnsLookup: async (domain, record_type = "A") => {
    const response = await axios.post(`${API}/tools/dns-lookup`, { domain, record_type });
    return response.data;
  },
  vlsm: async (network, subnets) => {
    const response = await axios.post(`${API}/tools/vlsm`, { network, subnets });
    return response.data;
  }
};

export const projectsAPI = {
  getProjects: async () => {
    const response = await axios.get(`${API}/projects`, { headers: getAuthHeader() });
    return response.data;
  },
  createProject: async (data) => {
    const response = await axios.post(`${API}/projects`, data, { headers: getAuthHeader() });
    return response.data;
  },
  getProject: async (id) => {
    const response = await axios.get(`${API}/projects/${id}`, { headers: getAuthHeader() });
    return response.data;
  },
  updateProject: async (id, data) => {
    const response = await axios.put(`${API}/projects/${id}`, data, { headers: getAuthHeader() });
    return response.data;
  },
  deleteProject: async (id) => {
    const response = await axios.delete(`${API}/projects/${id}`, { headers: getAuthHeader() });
    return response.data;
  },
  getTasks: async (projectId) => {
    const response = await axios.get(`${API}/projects/${projectId}/tasks`, { headers: getAuthHeader() });
    return response.data;
  },
  createTask: async (projectId, data) => {
    const response = await axios.post(`${API}/projects/${projectId}/tasks`, data, { headers: getAuthHeader() });
    return response.data;
  },
  updateTask: async (projectId, taskId, data) => {
    const response = await axios.put(`${API}/projects/${projectId}/tasks/${taskId}`, data, { headers: getAuthHeader() });
    return response.data;
  },
  deleteTask: async (projectId, taskId) => {
    const response = await axios.delete(`${API}/projects/${projectId}/tasks/${taskId}`, { headers: getAuthHeader() });
    return response.data;
  },
  getErrors: async (projectId) => {
    const response = await axios.get(`${API}/projects/${projectId}/errors`, { headers: getAuthHeader() });
    return response.data;
  },
  createError: async (projectId, data) => {
    const response = await axios.post(`${API}/projects/${projectId}/errors`, data, { headers: getAuthHeader() });
    return response.data;
  },
  updateError: async (projectId, errorId, data) => {
    const response = await axios.put(`${API}/projects/${projectId}/errors/${errorId}`, data, { headers: getAuthHeader() });
    return response.data;
  },
  deleteError: async (projectId, errorId) => {
    const response = await axios.delete(`${API}/projects/${projectId}/errors/${errorId}`, { headers: getAuthHeader() });
    return response.data;
  },
  getDocs: async (projectId) => {
    const response = await axios.get(`${API}/projects/${projectId}/docs`, { headers: getAuthHeader() });
    return response.data;
  },
  createDoc: async (projectId, data) => {
    const response = await axios.post(`${API}/projects/${projectId}/docs`, data, { headers: getAuthHeader() });
    return response.data;
  },
  updateDoc: async (projectId, docId, data) => {
    const response = await axios.put(`${API}/projects/${projectId}/docs/${docId}`, data, { headers: getAuthHeader() });
    return response.data;
  },
  deleteDoc: async (projectId, docId) => {
    const response = await axios.delete(`${API}/projects/${projectId}/docs/${docId}`, { headers: getAuthHeader() });
    return response.data;
  },
  getReports: async (projectId) => {
    const response = await axios.get(`${API}/projects/${projectId}/reports`, { headers: getAuthHeader() });
    return response.data;
  },
  createReport: async (projectId, data) => {
    const response = await axios.post(`${API}/projects/${projectId}/reports`, data, { headers: getAuthHeader() });
    return response.data;
  },
  deleteReport: async (projectId, reportId) => {
    const response = await axios.delete(`${API}/projects/${projectId}/reports/${reportId}`, { headers: getAuthHeader() });
    return response.data;
  },
  downloadReport: (projectId, reportId, format) => {
    const token = localStorage.getItem('token');
    window.open(`${API}/projects/${projectId}/reports/${reportId}/download/${format}?token=${token}`, '_blank');
  },
  getFiles: async (projectId) => {
    const response = await axios.get(`${API}/projects/${projectId}/files`, { headers: getAuthHeader() });
    return response.data;
  },
  uploadFile: async (projectId, file, category = "other") => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API}/projects/${projectId}/files?category=${category}`, formData, {
      headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  getMembers: async (projectId) => {
    const response = await axios.get(`${API}/projects/${projectId}/members`, { headers: getAuthHeader() });
    return response.data;
  },
  addMember: async (projectId, user_id, role = "member") => {
    const response = await axios.post(`${API}/projects/${projectId}/members`, { user_id, role }, { headers: getAuthHeader() });
    return response.data;
  },
  updateMemberRole: async (projectId, userId, role) => {
    const response = await axios.put(`${API}/projects/${projectId}/members/${userId}`, { role }, { headers: getAuthHeader() });
    return response.data;
  },
  removeMember: async (projectId, userId) => {
    const response = await axios.delete(`${API}/projects/${projectId}/members/${userId}`, { headers: getAuthHeader() });
    return response.data;
  },
  getAvailableUsers: async (projectId) => {
    const response = await axios.get(`${API}/projects/${projectId}/available-users`, { headers: getAuthHeader() });
    return response.data;
  },
  deleteFile: async (projectId, fileId) => {
    const response = await axios.delete(`${API}/projects/${projectId}/files/${fileId}`, { headers: getAuthHeader() });
    return response.data;
  },
  downloadFile: (projectId, fileId) => {
    const token = localStorage.getItem('token');
    window.open(`${API}/projects/${projectId}/files/${fileId}/download?token=${token}`, '_blank');
  }
};
