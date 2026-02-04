import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rolesService } from '../services/api';
import '../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role_id: '',
    status: 'activo'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      const response = await rolesService.getAll();
      setRoles(response || []);
      // Establecer el primer rol como valor por defecto si existe
      if (response && response.length > 0) {
        setFormData(prev => ({ ...prev, role_id: response[0].id }));
      }
    } catch (error) {
      console.error('Error al cargar roles:', error);
      setErrors(prev => ({ ...prev, roles: 'No se pudieron cargar los roles' }));
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    }
    
    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }

    if (!formData.username?.trim()) {
      newErrors.username = 'El usuario es requerido';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmar contraseña es requerido';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.role_id) {
      newErrors.role_id = 'El rol es requerido';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    setIsLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors({ general: result.error });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="logo">
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
              <rect x="10" y="5" width="30" height="40" rx="2" stroke="#2563eb" strokeWidth="2"/>
              <path d="M20 15 L30 15" stroke="#2563eb" strokeWidth="2"/>
              <path d="M20 22 L30 22" stroke="#2563eb" strokeWidth="2"/>
              <path d="M20 29 L30 29" stroke="#2563eb" strokeWidth="2"/>
            </svg>
          </div>
          <h1>JurisTracking</h1>
          <p className="subtitle">Crear Nueva Cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="error-message general">
              {errors.general}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">Nombre</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={errors.first_name ? 'error' : ''}
                placeholder="Juan"
              />
              {errors.first_name && <span className="error-text">{errors.first_name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="last_name">Apellido</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={errors.last_name ? 'error' : ''}
                placeholder="Pérez"
              />
              {errors.last_name && <span className="error-text">{errors.last_name}</span>}
            </div>
          </div>

          <div className="form-row"> 
            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? 'error' : ''}
                placeholder="ejemploUsuario"
              />
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="ejemplo@bufete.com"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role">Rol</label>
              <select
                id="role_id"
                name="role_id"
                value={formData.role_id}
                onChange={handleChange}
                disabled={loadingRoles}
              >
                {loadingRoles ? (
                  <option value="">Cargando roles...</option>
                ) : roles.length > 0 ? (
                  roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))
                ) : (
                  <option value="">No hay roles disponibles</option>
                )}
              </select>
              {errors.role_id && <span className="error-text">{errors.role_id}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder="••••••••"
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>

          <div className="auth-footer">
            <p>¿Ya tienes una cuenta? <Link to="/login" className="link">Inicia sesión aquí</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
