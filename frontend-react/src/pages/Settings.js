import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { tenantsService } from '../services/api';
import '../styles/Dashboard.css';
import '../styles/Settings.css';

const Settings = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  
  const [tenantData, setTenantData] = useState({
    id: '',
    name: '',
    company_name: '',
    company_description: '',
    subdomain: '',
    domain: '',
    status: 'active',
    settings: {
      theme: 'light',
      language: 'es',
      timezone: 'America/Bogota',
      notifications_enabled: true,
      max_users: 10,
      features: {
        calendar_enabled: true,
        reports_enabled: true,
        documents_enabled: true
      }
    }
  });

  useEffect(() => {
    loadTenantData();
  }, []);

  const loadTenantData = async () => {
    setLoading(true);
    try {
      const response = await tenantsService.getCurrent();
      setTenantData(response.data || response);
    } catch (error) {
      console.error('Error loading tenant data:', error);
      setErrors({ general: 'Error al cargar la configuración' });
      
      // Datos de ejemplo como fallback
      setTenantData({
        id: '1',
        name: 'Mi Empresa Legal',
        company_name: 'Mi Empresa Legal S.A.S',
        company_description: 'Firma especializada en derecho corporativo y litigios',
        subdomain: 'miempresa',
        domain: 'miempresa.juridico.com',
        status: 'active',
        settings: {
          theme: 'light',
          language: 'es',
          timezone: 'America/Bogota',
          notifications_enabled: true,
          max_users: 10,
          features: {
            calendar_enabled: true,
            reports_enabled: true,
            documents_enabled: true
          }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTenantData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTenantData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleFeatureChange = (e) => {
    const { name, checked } = e.target;
    setTenantData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        features: {
          ...prev.settings.features,
          [name]: checked
        }
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!tenantData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!tenantData.company_name.trim()) {
      newErrors.company_name = 'El nombre de la empresa es requerido';
    }
    
    if (!tenantData.subdomain.trim()) {
      newErrors.subdomain = 'El subdominio es requerido';
    } else if (!/^[a-z0-9-]+$/.test(tenantData.subdomain)) {
      newErrors.subdomain = 'El subdominio solo puede contener letras minúsculas, números y guiones';
    }
    
    if (!tenantData.domain.trim()) {
      newErrors.domain = 'El dominio es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      // Aquí irá la llamada a la API para actualizar el tenant
      
      setSuccessMessage('Configuración actualizada exitosamente');
      setIsEditing(false);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating tenant:', error);
      setErrors({ general: error.response?.data?.message || 'Error al actualizar la configuración' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadTenantData();
    setErrors({});
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="main-content">
        <Header toggleSidebar={toggleSidebar} />
        
        <div className="content-wrapper">
          <div className="settings-container">
            <div className="settings-header">
              <h1>⚙️ Configuración del Sistema</h1>
              <p className="subtitle">Administra la configuración de tu organización</p>
            </div>

            {successMessage && (
              <div className="alert alert-success">
                {successMessage}
              </div>
            )}

            {errors.general && (
              <div className="alert alert-error">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="settings-form">
              {/* Información Básica */}
              <div className="settings-section">
                <div className="section-header">
                  <h2>📋 Información Básica</h2>
                  {!isEditing && (
                    <button 
                      type="button" 
                      className="btn-edit"
                      onClick={() => setIsEditing(true)}
                    >
                      ✏️ Editar
                    </button>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="id">ID del Tenant</label>
                    <input
                      type="text"
                      id="id"
                      name="id"
                      value={tenantData.id}
                      disabled
                      className="input-disabled"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">Estado</label>
                    <select
                      id="status"
                      name="status"
                      value={tenantData.status}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'input-disabled' : ''}
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                      <option value="suspended">Suspendido</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="name">Nombre del Tenant *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={tenantData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'input-disabled' : ''}
                      placeholder="Ej: Mi Empresa Legal"
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                  </div>
                </div>
              </div>

              {/* Información de la Empresa */}
              <div className="settings-section">
                <div className="section-header">
                  <h2>🏢 Información de la Empresa</h2>
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="company_name">Nombre de la Empresa *</label>
                    <input
                      type="text"
                      id="company_name"
                      name="company_name"
                      value={tenantData.company_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'input-disabled' : ''}
                      placeholder="Ej: Mi Empresa Legal S.A.S"
                    />
                    {errors.company_name && <span className="error-message">{errors.company_name}</span>}
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="company_description">Descripción de la Empresa</label>
                    <textarea
                      id="company_description"
                      name="company_description"
                      value={tenantData.company_description}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'input-disabled' : ''}
                      rows="4"
                      placeholder="Describe tu empresa..."
                    />
                  </div>
                </div>
              </div>

              {/* Configuración de Dominio */}
              <div className="settings-section">
                <div className="section-header">
                  <h2>🌐 Configuración de Dominio</h2>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="subdomain">Subdominio *</label>
                    <input
                      type="text"
                      id="subdomain"
                      name="subdomain"
                      value={tenantData.subdomain}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'input-disabled' : ''}
                      placeholder="miempresa"
                    />
                    {errors.subdomain && <span className="error-message">{errors.subdomain}</span>}
                    <small className="field-hint">Solo letras minúsculas, números y guiones</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="domain">Dominio Completo *</label>
                    <input
                      type="text"
                      id="domain"
                      name="domain"
                      value={tenantData.domain}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'input-disabled' : ''}
                      placeholder="miempresa.juridico.com"
                    />
                    {errors.domain && <span className="error-message">{errors.domain}</span>}
                  </div>
                </div>
              </div>

              {/* Configuración General */}
              <div className="settings-section">
                <div className="section-header">
                  <h2>⚡ Configuración General</h2>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="theme">Tema</label>
                    <select
                      id="theme"
                      name="theme"
                      value={tenantData.settings.theme}
                      onChange={handleSettingsChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'input-disabled' : ''}
                    >
                      <option value="light">Claro</option>
                      <option value="dark">Oscuro</option>
                      <option value="auto">Automático</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="language">Idioma</label>
                    <select
                      id="language"
                      name="language"
                      value={tenantData.settings.language}
                      onChange={handleSettingsChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'input-disabled' : ''}
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="timezone">Zona Horaria</label>
                    <select
                      id="timezone"
                      name="timezone"
                      value={tenantData.settings.timezone}
                      onChange={handleSettingsChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'input-disabled' : ''}
                    >
                      <option value="America/Bogota">América/Bogotá (COT)</option>
                      <option value="America/Mexico_City">América/Ciudad de México (CST)</option>
                      <option value="America/New_York">América/Nueva York (EST)</option>
                      <option value="Europe/Madrid">Europa/Madrid (CET)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="max_users">Máximo de Usuarios</label>
                    <input
                      type="number"
                      id="max_users"
                      name="max_users"
                      value={tenantData.settings.max_users}
                      onChange={handleSettingsChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'input-disabled' : ''}
                      min="1"
                      max="1000"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="notifications_enabled"
                        checked={tenantData.settings.notifications_enabled}
                        onChange={handleSettingsChange}
                        disabled={!isEditing}
                      />
                      <span>Habilitar Notificaciones</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Características y Módulos */}
              <div className="settings-section">
                <div className="section-header">
                  <h2>🔧 Módulos Habilitados</h2>
                </div>

                <div className="features-grid">
                  <div className="feature-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="calendar_enabled"
                        checked={tenantData.settings.features.calendar_enabled}
                        onChange={handleFeatureChange}
                        disabled={!isEditing}
                      />
                      <span>📅 Calendario</span>
                    </label>
                  </div>

                  <div className="feature-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="reports_enabled"
                        checked={tenantData.settings.features.reports_enabled}
                        onChange={handleFeatureChange}
                        disabled={!isEditing}
                      />
                      <span>📊 Reportes</span>
                    </label>
                  </div>

                  <div className="feature-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="documents_enabled"
                        checked={tenantData.settings.features.documents_enabled}
                        onChange={handleFeatureChange}
                        disabled={!isEditing}
                      />
                      <span>📄 Documentos</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              {isEditing && (
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
