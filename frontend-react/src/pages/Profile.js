import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { usersService } from '../services/api';
import '../styles/Dashboard.css';
import '../styles/Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    phone: '',
    status: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.phone || '',
        status: user.status || 'activo'
      });
    }
  }, [user]);

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
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }
    
    if (!formData.email) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo no es válido';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'El usuario es requerido';
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

    try {
      setLoading(true);
      setErrors({});
      
      // Llamar al servicio para actualizar el perfil
      const response = await usersService.updateProfile(user.id, formData);
      
      // Actualizar el usuario en el contexto AuthContext
      updateUser(formData);

      setSuccessMessage(response.message || 'Perfil actualizado exitosamente');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      setErrors({ 
        general: err.response?.data?.message || 'Error al actualizar el perfil. Por favor, intenta de nuevo.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header 
          title="Mi Perfil" 
          userName={user?.first_name}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="profile-container">

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {formData?.first_name?.[0]?.toUpperCase()}{formData?.last_name?.[0]?.toUpperCase()}
            </div>
            <h2>{formData?.first_name} {formData?.last_name}</h2>
            <p className="profile-email">{formData?.email}</p>
            <span className={`profile-status status-${formData?.status}`}>
              {formData?.status?.charAt(0).toUpperCase() + formData?.status?.slice(1)}
            </span>
          </div>

          <div className="profile-info-card">
            <h3>Información Rápida</h3>
            <div className="info-item">
              <span className="info-label">Usuario:</span>
              <span className="info-value">{formData?.username}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{formData?.email}</span>
            </div>
          </div>
        </div>

        <div className="profile-main">
          {successMessage && (
            <div className="success-message">
              ✓ {successMessage}
            </div>
          )}

          {!isEditing ? (
            <div className="profile-view">
              <div className="section-header">
                <h2>Información Personal</h2>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn-edit-profile"
                >
                  ✎ Editar Perfil
                </button>
              </div>

              <div className="profile-grid">
                <div className="profile-field">
                  <label>Nombre</label>
                  <p>{formData.first_name}</p>
                </div>
                <div className="profile-field">
                  <label>Apellido</label>
                  <p>{formData.last_name}</p>
                </div>
                <div className="profile-field">
                  <label>Correo Electrónico</label>
                  <p>{formData.email}</p>
                </div>
                <div className="profile-field">
                  <label>Usuario</label>
                  <p>{formData.username}</p>
                </div>
                <div className="profile-field">
                  <label>Estado</label>
                  <p className="status-badge">{formData.status}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="profile-edit">
              <div className="section-header">
                <h2>Editar Información Personal</h2>
              </div>

              <form onSubmit={handleSubmit} className="profile-form">
                {errors.general && (
                  <div className="error-message">{errors.general}</div>
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
                    />
                    {errors.last_name && <span className="error-text">{errors.last_name}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Correo Electrónico</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="username">Usuario</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={errors.username ? 'error' : ''}
                    />
                    {errors.username && <span className="error-text">{errors.username}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Teléfono</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+593 999 999 999"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">Estado</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={loading}
                    onClick={() => {
                      setIsEditing(false);
                      setErrors({});
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
</div>
  );
};

export default Profile;
