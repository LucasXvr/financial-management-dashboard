import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

// Criar o contexto
export const AuthContext = createContext(null);

// Hook personalizado para usar o contexto
export const useAuth = () => useContext(AuthContext);

// Provedor do contexto de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar autenticação ao carregar o componente
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      
      try {
        // Verificar se há um token no localStorage
        if (authService.isAuthenticated()) {
          try {
            // Tentar obter dados do usuário
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
          } catch (err) {
            console.error("Erro ao obter dados do usuário após login:", err);
            
            // Se o erro for 404 (endpoint não existe), ainda considera autenticado
            // mas com dados básicos/genéricos do usuário
            if (err.response?.status === 404) {
              setIsAuthenticated(true);
              // Usar dados mínimos do usuário (pode ser melhorado extraindo info do JWT)
              setUser({ name: 'Usuário' });
            } else {
              // Para outros erros, limpa a autenticação
              setIsAuthenticated(false);
              authService.logout();
              setError("Sessão expirada ou inválida. Por favor, faça login novamente.");
            }
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
        setError("Ocorreu um erro ao verificar autenticação. Por favor, tente novamente.");
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Função de login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(email, password);
      
      try {
        // Tentar obter dados do usuário após login
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        // Se falhar em obter dados do usuário, usar dados básicos
        console.error("Erro ao obter dados do usuário após login:", err);
        setUser({ name: 'Usuário' }); // Dados mínimos
      }
      
      setIsAuthenticated(true);
      return response; // Retorna resposta para componente chamador
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      setError(err.message || "Credenciais inválidas ou servidor indisponível.");
      throw err; // Repassa o erro para tratamento no componente
    } finally {
      setLoading(false);
    }
  };

  // Função de registro
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(userData);
      return response;
    } catch (err) {
      console.error("Erro ao registrar usuário:", err);
      setError(err.message || "Não foi possível registrar o usuário. Por favor, tente novamente.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    authService.logout(); // Limpa token no localStorage
    setUser(null);
    setIsAuthenticated(false);
  };

  // Objeto de contexto com valores e funções
  const authContextValue = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;