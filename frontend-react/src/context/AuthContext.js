import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = process.env.REACT_APP_API_URL;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay un usuario guardado en localStorage al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/usuarios/login`, {
        email,
        password
      });

      const { token, usuario: userData } = response.data;
      
      setUser(userData);
      localStorage.setItem('usuario', JSON.stringify(userData));
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, data: userData };
    } catch (err) {
      setError(err.response?.data?.error);
      return { success: false, error: err.response?.data?.error };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/usuarios/registro`, userData);

      const { token, usuario: newUser } = response.data;
      
      setUser(newUser);
      localStorage.setItem('usuario', JSON.stringify(newUser));
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true };
    } catch (err) {
      let errorMessage = 'Error al registrarse';
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        switch (status) {
          case 400:
            errorMessage = data?.error || 'Verifica los datos ingresados';
            break;
          case 409:
            errorMessage = 'El email ya está registrado';
            break;
          case 422:
            errorMessage = data?.error || 'Datos inválidos';
            break;
          case 500:
            errorMessage = data?.error || 'Error del servidor. Intenta más tarde';
            break;
          default:
            errorMessage = data?.error || 'Error al registrarse';
        }
      } else if (err.request) {
        errorMessage = 'No se pudo conectar con el servidor';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    localStorage.setItem('usuario', JSON.stringify(updatedUser));
  };

  const logout = async () => {
    try {
      setError(null);
      
      // Llamar al endpoint de logout del servidor si es necesario
      try {
        await axios.post(`${API_URL}/usuarios/logout`);
      } catch (err) {
        // Si el logout falla en el servidor, continuamos con la limpieza local
        console.warn('No se pudo notificar al servidor del logout:', err);
      }
      
      // Limpiar el estado local
      setUser(null);
      localStorage.removeItem('usuario');
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      
      return { success: true };
    } catch (err) {
      const errorMessage = 'Error al cerrar sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
