import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { tenantsService } from '../services/api';
import '../styles/Dashboard.css';
import '../styles/Tenants.css';

const Tenants = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [formData, setFormData] = useState({
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
  const [errors, setErrors] = useState({});
  const [detailsModal, setDetailsModal] = useState({ show: false, tenant: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tenantsService.getAll();
      setTenants(response.data || response);
    } catch (err) {
      console.error('Error al cargar tenants:', err);
      setError('Error al cargar los tenants. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
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

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.subdomain.trim()) {
      newErrors.subdomain = 'El subdominio es requerido';
    } else if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
      newErrors.subdomain = 'Solo letras minúsculas, números y guiones';
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
      setError(null);
      
      if (editingId) {
        await tenantsService.update(editingId, formData);
        setSuccessMessage('Tenant actualizado exitosamente');
        setEditingId(null);
      } else {
        await tenantsService.create(formData);
        setSuccessMessage('Tenant creado exitosamente');
      }
      
      setFormData({
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
      setIsCreating(false);
      fetchTenants();
    } catch (err) {
      console.error('Error al guardar tenant:', err);
      setError(err.response?.data?.error || 'Error al guardar tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tenant) => {
    setFormData({
      name: tenant.name,
      company_name: tenant.company_name || '',
      company_description: tenant.company_description || '',
      subdomain: tenant.subdomain,
      domain: tenant.domain || '',
      status: tenant.status,
      settings: tenant.settings || {
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
    setEditingId(tenant.id);
    setIsCreating(true);
    setErrors({});
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({
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
    setErrors({});
  };

  const handleViewDetails = (tenant) => {
    setDetailsModal({ show: true, tenant });
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = 
      tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.subdomain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'todos' || tenant.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTenants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="main-content">
        <Header 
        title="Gestión de Tenants"
        userName={user?.first_name}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="content-wrapper">
          <div className="tenants-container">

            {successMessage && (
              <div className="alert alert-success">
                ✓ {successMessage}
              </div>
            )}

            {error && (
              <div className="alert alert-error">
                ✕ {error}
              </div>
            )}

            {isCreating ? (
              <div className="tenant-form-card">
                <div className="form-card-header">
                  <h2>{editingId ? '✏️ Editar Tenant' : '➕ Nuevo Tenant'}</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="tenant-form">
                  <div className="form-section">
                    <h3>Información Básica</h3>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label htmlFor="name">Nombre del Tenant *</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Ej: Mi Empresa Legal"
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="subdomain">Subdominio *</label>
                        <input
                          type="text"
                          id="subdomain"
                          name="subdomain"
                          value={formData.subdomain}
                          onChange={handleChange}
                          placeholder="miempresa"
                        />
                        {errors.subdomain && <span className="error-message">{errors.subdomain}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="domain">Dominio</label>
                        <input
                          type="text"
                          id="domain"
                          name="domain"
                          value={formData.domain}
                          onChange={handleChange}
                          placeholder="miempresa.juridico.com"
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
                          <option value="active">Activo</option>
                          <option value="inactive">Inactivo</option>
                          <option value="suspended">Suspendido</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Información de la Empresa</h3>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label htmlFor="company_name">Nombre de la Empresa</label>
                        <input
                          type="text"
                          id="company_name"
                          name="company_name"
                          value={formData.company_name}
                          onChange={handleChange}
                          placeholder="Mi Empresa Legal S.A.S"
                        />
                      </div>

                      <div className="form-group full-width">
                        <label htmlFor="company_description">Descripción</label>
                        <textarea
                          id="company_description"
                          name="company_description"
                          value={formData.company_description}
                          onChange={handleChange}
                          rows="3"
                          placeholder="Describe la empresa..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Configuración General</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="theme">Tema</label>
                        <select
                          id="theme"
                          name="theme"
                          value={formData.settings.theme}
                          onChange={handleSettingsChange}
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
                          value={formData.settings.language}
                          onChange={handleSettingsChange}
                        >
                          <option value="es">Español</option>
                          <option value="en">English</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="max_users">Máx. Usuarios</label>
                        <input
                          type="number"
                          id="max_users"
                          name="max_users"
                          value={formData.settings.max_users}
                          onChange={handleSettingsChange}
                          min="1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Tenant'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <div className="filters-section">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Buscar por nombre, subdominio o empresa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="search-icon">🔍</span>
                  </div>
                  
                  <div className="filter-group">
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="todos">Todos</option>
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                      <option value="suspended">Suspendido</option>
                    </select>
                  </div>
                  <div>
                    {!isCreating && (
                        <button 
                        className="btn-primary"
                        onClick={() => setIsCreating(true)}
                        >
                        ➕ Nuevo Tenant
                        </button>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Cargando tenants...</p>
                  </div>
                ) : currentItems.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🏢</div>
                    <h3>No se encontraron tenants</h3>
                    <p>
                      {searchTerm || filterStatus !== 'todos' 
                        ? 'No hay resultados que coincidan con tu búsqueda.'
                        : 'Comienza creando tu primer tenant.'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="general-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Empresa</th>
                            <th>Subdominio</th>
                            <th>Dominio</th>
                            <th>Estado</th>
                            <th>Usuarios Máx</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map(tenant => (
                            <tr key={tenant.id}>
                              <td>
                                <div className="general-name">
                                  <strong>{tenant.name}</strong>
                                </div>
                              </td>
                              <td>{tenant.company_name || '-'}</td>
                              <td>
                                <code className="subdomain-badge">{tenant.subdomain}</code>
                              </td>
                              <td>{tenant.domain || '-'}</td>
                              <td>
                                <span className={`status-badge status-${tenant.status}`}>
                                  {tenant.status === 'active' ? 'Activo' : 
                                   tenant.status === 'inactive' ? 'Inactivo' : 'Suspendido'}
                                </span>
                              </td>
                              <td className="text-center">{tenant.settings?.max_users || 10}</td>
                              <td>
                                <div className="actions-group">
                                  <button
                                    className="btn-icon btn-view"
                                    onClick={() => handleViewDetails(tenant)}
                                    title="Ver detalles"
                                  >
                                    👁️
                                  </button>
                                  <button
                                    className="btn-icon btn-edit"
                                    onClick={() => handleEdit(tenant)}
                                    title="Editar"
                                  >
                                    ✏️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {totalPages > 1 && (
                      <div className="pagination">
                        <button 
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="pagination-btn"
                        >
                          ← Anterior
                        </button>
                        
                        <div className="pagination-info">
                          Página {currentPage} de {totalPages}
                        </div>
                        
                        <button 
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="pagination-btn"
                        >
                          Siguiente →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      {detailsModal.show && (
        <div className="details-modal-overlay">
            <div className="details-modal-content">
              <div className="details-modal-header">
                <h2>Detalles del Tenant</h2>
              </div>
              <div className="details-info-container">
                 <div className="details-info-item">
                   <label className='details-info-label'>ID:</label>
                   <span className='details-info-value'>{detailsModal.tenant?.id}</span>
                 </div>
                 <div className="details-info-item">
                   <label className='details-info-label'>Nombre:</label>
                   <span className='details-info-value'>{detailsModal.tenant?.name}</span>
                 </div>
                 <div className="details-info-item">
                   <label className='details-info-label'>Empresa:</label>
                   <span className='details-info-value'>{detailsModal.tenant?.company_name || '-'}</span>
                 </div>
                 <div className="details-info-item">
                   <label className='details-info-label'>Descripción:</label>
                   <span className='details-info-value'>{detailsModal.tenant?.company_description || '-'}</span>
                 </div>
                 <div className="details-info-item">
                   <label className='details-info-label'>Subdominio:</label>
                   <span><code>{detailsModal.tenant?.subdomain}</code></span>
                 </div>
                 <div className="details-info-item">
                   <label className='details-info-label'>Dominio:</label>
                   <span className='details-info-value'>{detailsModal.tenant?.domain || '-'}</span>
                 </div>
                 <div className="details-info-item">
                   <label className='details-info-label'>Estado:</label>
                   <span className={`status-badge status-${detailsModal.tenant?.status}`}>
                     {detailsModal.tenant?.status}
                   </span>
                 </div>
                 <div className="details-info-item">
                   <label className='details-info-label'>Tema:</label>
                   <span className='details-info-value'>{detailsModal.tenant?.settings?.theme || 'light'}</span>
                 </div>
                 <div className="details-info-item">
                   <label className='details-info-label'>Idioma:</label>
                   <span className='details-info-value'>{detailsModal.tenant?.settings?.language || 'es'}</span>
                 </div>
                 <div className="details-info-item">
                   <label className='details-info-label'>Máx. Usuarios:</label>
                   <span className='details-info-value'>{detailsModal.tenant?.settings?.max_users || 10}</span>
                 </div>
                 <div className="details-info-item">
                   <label className='details-info-label'>Creado:</label>
                   <span className='details-info-value'>{formatDate(detailsModal.tenant?.created_at)}</span>
                 </div>
                 <div className="details-info-item">
                   <label className='details-info-label'>Actualizado:</label>
                   <span className='details-info-value'>{formatDate(detailsModal.tenant?.updated_at)}</span>
                 </div>
              </div>
              <div className="details-modal-footer">
                <button 
                  onClick={() => setDetailsModal({ show: false, tenant: null })}
                  className="details-modal-close-btn"
                >
                  Cerrar
                </button>
              </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Tenants;
