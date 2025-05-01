import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';
import api from '../services/api';

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
      console.log('🔄 Iniciando verificação de autenticação');
      setLoading(true);
      
      try {
        // Verificar se há um token no localStorage
        if (authService.isAuthenticated()) {
          console.log('🔑 Usuário tem token, verificando dados');
          // Como não temos o endpoint /me, vamos usar dados básicos
          const userData = {
            email: 'unknown@email.com',
            name: 'Usuário',
            id: 'unknown'
          };
          console.log('✅ Dados do usuário obtidos:', userData);
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          console.log('❌ Usuário não autenticado');
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('❌ Erro ao verificar autenticação:', err);
        setError("Ocorreu um erro ao verificar autenticação.");
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
        console.log('✅ Verificação de autenticação concluída');
      }
    };

    checkAuth();
  }, []);

  // Função de login
  const login = async (email, password) => {
    console.log('🔑 AuthContext: Iniciando processo de login');
    setError(null);
    setLoading(true);
    
    try {
      const response = await api.post('/v1/identity/login', { email, password });
      console.log('✅ AuthContext: Resposta completa do servidor:', response.data);
      
      // Verificar se o token está em response.data ou em alguma propriedade aninhada
      const token = response.data?.token || response.data?.accessToken || response.data?.data?.token;
      
      if (token) {
        console.log('🔒 AuthContext: Token recebido, armazenando no localStorage');
        localStorage.setItem('token', token);
        console.log('✅ AuthContext: Token armazenado com sucesso');
        
        // Como não temos o endpoint /me, vamos usar os dados do login
        const userData = {
          email: email,
          name: email.split('@')[0], // Nome básico baseado no email
          id: 'unknown'
        };
        
        // Atualizar o estado de autenticação
        setIsAuthenticated(true);
        setUser(userData);
        
        console.log('✅ AuthContext: Estado de autenticação atualizado');
        return response.data;
      } else {
        console.error('❌ AuthContext: Token não encontrado na resposta. Resposta completa:', response.data);
        throw new Error('Token não recebido do servidor');
      }
    } catch (error) {
      console.error('❌ AuthContext: Erro durante o login:', error);
      setError(error.message || 'Erro ao fazer login');
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
      console.log('✅ AuthContext: Processo de login concluído');
    }
  };

  // Função de registro
  const register = async (userData) => {
    console.log('👤 Iniciando processo de registro');
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/v1/identity/register', userData);
      console.log('✅ Registro realizado com sucesso');
      return response;
    } catch (err) {
      console.error('❌ Erro no processo de registro:', err);
      setError(err.message || "Não foi possível registrar o usuário.");
      throw err;
    } finally {
      setLoading(false);
      console.log('✅ Processo de registro concluído');
    }
  };

  // Função de logout
  const logout = () => {
    console.log('🚪 Iniciando processo de logout');
    authService.logout(); // Limpa token no localStorage
    setUser(null);
    setIsAuthenticated(false);
    console.log('✅ Logout concluído');
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