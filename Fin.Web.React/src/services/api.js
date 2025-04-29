import axios from 'axios';

const API_BASE_URL = 'http://localhost:5110';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/v1/identity/login', { email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao fazer login' };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/v1/identity/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao registrar usuário' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    // window.location.href = '/login';
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Método para obter o usuário atual com fallback
  getCurrentUser: async () => {
    try {
      // Verificar se o endpoint /me existe
      const response = await api.get('/v1/identity/me');
      return response.data;
    } catch (error) {
      // Se o endpoint não existir (404), retornar um usuário padrão ou usar JWT
      if (error.response?.status === 404) {
        console.warn('Endpoint /v1/identity/me não encontrado. Usando token JWT como fallback.');
        
        // Verificar se existe um token
        const token = localStorage.getItem('token');
        if (token) {
          try {
            // Extrair informações básicas do token (JWT)
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              return {
                id: payload.sub || payload.id || 'unknown',
                email: payload.email || 'user@example.com',
                name: payload.name || 'Usuário',
                // Outros campos que podem ser necessários
              };
            }
          } catch (e) {
            console.error('Erro ao decodificar token:', e);
          }
        }
        
        // Se não conseguir extrair do token, retorna usuário genérico
        return {
          id: 'temp-user-id',
          email: 'user@example.com',
          name: 'Usuário'
        };
      }
      
      // Para outros erros, rejeitar normalmente
      throw error.response?.data || { message: 'Erro ao obter dados do usuário' };
    }
  }
};

export default api;