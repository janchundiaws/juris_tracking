import axios from 'axios';

// Configuración base de axios
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jurisTracking_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jurisTracking_token');
      localStorage.removeItem('jurisTracking_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },
  
  logout: async () => {
    await apiClient.post('/auth/logout');
  },
};

// Servicios de casos
export const casesService = {
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/cases', { params: filters });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await apiClient.get(`/cases/${id}`);
    return response.data;
  },
  
  create: async (caseData) => {
    const response = await apiClient.post('/cases', caseData);
    return response.data;
  },
  
  update: async (id, caseData) => {
    const response = await apiClient.put(`/cases/${id}`, caseData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await apiClient.delete(`/cases/${id}`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await apiClient.get('/cases/stats');
    return response.data;
  },
};

// Servicios de clientes
export const clientsService = {
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/clients', { params: filters });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data;
  },
  
  create: async (clientData) => {
    const response = await apiClient.post('/clients', clientData);
    return response.data;
  },
  
  update: async (id, clientData) => {
    const response = await apiClient.put(`/clients/${id}`, clientData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await apiClient.delete(`/clients/${id}`);
    return response.data;
  },
};

// Servicios de documentos
export const documentsService = {
  getAll: async (caseId) => {
    const response = await apiClient.get(`/cases/${caseId}/documents`);
    return response.data;
  },
  
  upload: async (caseId, formData) => {
    const response = await apiClient.post(`/cases/${caseId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  download: async (documentId) => {
    const response = await apiClient.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  delete: async (documentId) => {
    const response = await apiClient.delete(`/documents/${documentId}`);
    return response.data;
  },
};

// Servicios de tareas
export const tasksService = {
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/tasks', { params: filters });
    return response.data;
  },
  
  create: async (taskData) => {
    const response = await apiClient.post('/tasks', taskData);
    return response.data;
  },
  
  update: async (id, taskData) => {
    const response = await apiClient.put(`/tasks/${id}`, taskData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  },
  
  toggleComplete: async (id) => {
    const response = await apiClient.patch(`/tasks/${id}/toggle`);
    return response.data;
  },
};

// Servicios de audiencias
export const hearingsService = {
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/hearings', { params: filters });
    return response.data;
  },
  
  create: async (hearingData) => {
    const response = await apiClient.post('/hearings', hearingData);
    return response.data;
  },
  
  update: async (id, hearingData) => {
    const response = await apiClient.put(`/hearings/${id}`, hearingData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await apiClient.delete(`/hearings/${id}`);
    return response.data;
  },
};

export default apiClient;
