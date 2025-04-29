import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     // Verificar autenticação ao carregar a aplicação
     const checkAuth = async () => {
      const hasToken = authService.isAuthenticated();
      setIsAuthenticated(hasToken);
      
      if (hasToken) {
        try {
          // Tenta carregar os dados do usuário se houver token
          const userData = await authService.getCurrentUser();
          setCurrentUser(userData);
        } catch (error) {
          console.error('Erro ao obter dados do usuário:', error);
          // Se falhar em obter os dados do usuário, provavelmente o token é inválido
          setIsAuthenticated(false);
          authService.logout();
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setIsAuthenticated(true);
      
      // Após o login bem-sucedido, obtenha os dados do usuário
      try {
        const userData = await authService.getCurrentUser();
        setCurrentUser(userData);
      } catch (userError) {
        console.error('Erro ao obter dados do usuário após login:', userError);
      }
      
      return response;
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    // A navegação deverá ser feita no componente que chama logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 