import axios from 'axios';

// Configuración base de axios
const API_URL = process.env.REACT_APP_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('jurisTracking_token');
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
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
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
    const response = await apiClient.get(`${API_URL}/judicial-processes`, { params: filters });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await apiClient.get(`${API_URL}/judicial-processes/${id}`);
    return response.data;
  },
  
  create: async (caseData) => {
    try {
    const response = await apiClient.post(`${API_URL}/judicial-processes`, caseData);
    return response.data;
    } catch (error) {
      throw error.response;
    }
  },
  
  update: async (id, caseData) => {
    try {
    const response = await apiClient.put(`${API_URL}/judicial-processes/${id}`, caseData);
    return response.data;
    } catch (error) {
      throw error.response;
    }
  },
  
  delete: async (id) => {
    try {
    const response = await apiClient.delete(`${API_URL}/judicial-processes/${id}`);
    return response.data;
    } catch (error) {
      throw error.response;
    }
  },
  
  getStats: async () => {
    const response = await apiClient.get(`${API_URL}/judicial-processes/stats`);
    return response.data;
  },
};

// Servicios de clientes
export const clientsService = {
  getAll: async (filters = {}) => {
    const response = await apiClient.get(`${API_URL}/clients`, { params: filters });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await apiClient.get(`${API_URL}/clients/${id}`);
    return response.data;
  },
  
  create: async (clientData) => {
    const response = await apiClient.post(`${API_URL}/clients`, clientData);
    return response.data;
  },
  
  update: async (id, clientData) => {
    const response = await apiClient.put(`${API_URL}/clients/${id}`, clientData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await apiClient.delete(`${API_URL}/clients/${id}`);
    return response.data;
  },
};

// Servicios de documentos
export const documentsService = {
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/documents', { params: filters });
    return response.data;
  },

  getByProcessId: async (judicialProcessId) => {
    const response = await apiClient.get('/documents', { 
      params: { judicial_process_id: judicialProcessId } 
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data;
  },
  
  upload: async (documentData) => {
    const response = await apiClient.post('/documents', documentData);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/documents/${id}`, data);
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

// Servicios de maestros
export const maestroService = {
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/maestro', { params: filters });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await apiClient.get(`/maestro/${id}`);
    return response.data;
  },
  
  create: async (maestroData) => {
    const response = await apiClient.post('/maestro', maestroData);
    return response.data;
  },
  
  update: async (id, maestroData) => {
    const response = await apiClient.put(`/maestro/${id}`, maestroData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await apiClient.delete(`/maestro/${id}`);
    return response.data;
  },
};

// Servicios de abogados
export const lawyersService = {
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/lawyers', { params: filters });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await apiClient.get(`/lawyers/${id}`);
    return response.data;
  },
  
  create: async (lawyerData) => {
    const response = await apiClient.post('/lawyers', lawyerData);
    return response.data;
  },
  
  update: async (id, lawyerData) => {
    const response = await apiClient.put(`/lawyers/${id}`, lawyerData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await apiClient.delete(`/lawyers/${id}`);
    return response.data;
  },
};

// Servicios de acreedores
export const creditorsService = {
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/creditors', { params: filters });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await apiClient.get(`/creditors/${id}`);
    return response.data;
  },
  
  create: async (creditorData) => {
    const response = await apiClient.post('/creditors', creditorData);
    return response.data;
  },
  
  update: async (id, creditorData) => {
    const response = await apiClient.put(`/creditors/${id}`, creditorData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await apiClient.delete(`/creditors/${id}`);
    return response.data;
  },
};

// Servicios de provincias
export const provinciesService = {
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/provincies', { params: filters });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await apiClient.get(`/provincies/${id}`);
    return response.data;
  },
  
  create: async (provinceData) => {
    const response = await apiClient.post('/provincies', provinceData);
    return response.data;
  },
  
  update: async (id, provinceData) => {
    const response = await apiClient.put(`/provincies/${id}`, provinceData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await apiClient.delete(`/provincies/${id}`);
    return response.data;
  },
};

// Servicios de roles
export const rolesService = {
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/roles', { params: filters });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data;
  },
  
};

// Servicio de usuarios
export const usersService = {
  updateProfile: async (userId, userData) => {
    const response = await apiClient.put(`/usuarios/${userId}`, {
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      username: userData.username,
      phone: userData.phone,
      status: userData.status
    });
    return response.data;
  },
};

// Servicio de actividades
export const activitiesService = {
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/activities', { params: filters });
    return response.data;
  },

  getByProcessId: async (judicialProcessId) => {
    const response = await apiClient.get(`/activities/process/${judicialProcessId}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/activities/${id}`);
    return response.data;
  },

  create: async (activityData) => {
    const response = await apiClient.post('/activities', activityData);
    return response.data;
  },

  update: async (id, activityData) => {
    const response = await apiClient.put(`/activities/${id}`, activityData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/activities/${id}`);
    return response.data;
  },
};

// Servicios de eventos
export const eventsService = {
  getAll: async () => {
    const response = await apiClient.get('/events');
    return response.data;
  },

  getByUser: async (userId) => {
    const response = await apiClient.get(`/events/user/${userId}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  create: async (eventData) => {
    const response = await apiClient.post('/events', eventData);
    return response.data;
  },

  update: async (id, eventData) => {
    const response = await apiClient.put(`/events/${id}`, eventData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  },
};

export default apiClient;
