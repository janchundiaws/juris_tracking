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
        <Header 
            title="Gestión de Configuración"
            toggleSidebar={toggleSidebar} 
            />
        
        <div className="content-wrapper">
          <div className="settings-container">

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


          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
