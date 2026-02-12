import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { creditorsService } from '../services/api';
import '../styles/Dashboard.css';
import '../styles/Creditors.css';

const Creditors = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [creditors, setCreditors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [formData, setFormData] = useState({
    name: '',
    ruc: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  const [detailsModal, setDetailsModal] = useState({ show: false, creditor: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchCreditors();
  }, []);

  // Resetear página cuando los filtros cambian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Auto-dismiss success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchCreditors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await creditorsService.getAll();
      setCreditors(data);
    } catch (err) {
      console.error('Error al cargar acreedores:', err);
      setError('Error al cargar los acreedores. Por favor, intenta de nuevo.');
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del acreedor es requerido';
    }
    
    if (!formData.ruc.trim()) {
      newErrors.ruc = 'El RUC es requerido';
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
        // Actualizar acreedor existente
        await creditorsService.update(editingId, formData);
        setSuccessMessage('Acreedor actualizado exitosamente');
        setEditingId(null);
      } else {
        // Crear nuevo acreedor
        await creditorsService.create(formData);
        setSuccessMessage('Acreedor creado exitosamente');
      }
      
      // Limpiar formulario
      setFormData({
        name: '',
        ruc: '',
        status: 'active'
      });
      setIsCreating(false);
      
      // Recargar lista
      fetchCreditors();
    } catch (err) {
      console.error('Error al guardar acreedor:', err);
      setError('Error al guardar acreedor: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (creditor) => {
    setFormData({
      name: creditor.name,
      ruc: creditor.ruc,
      status: creditor.status
    });
    setEditingId(creditor.id);
    setIsCreating(true);
    setErrors({});
  };

  const handleDeleteClick = (creditor) => {
    setDeleteModal({
      show: true,
      id: creditor.id,
      name: creditor.name
    });
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await creditorsService.delete(deleteModal.id);
      setSuccessMessage('Acreedor eliminado exitosamente');
      setDeleteModal({ show: false, id: null, name: '' });
      fetchCreditors();
    } catch (err) {
      console.error('Error al eliminar acreedor:', err);
      setError('Error al eliminar el acreedor');
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, id: null, name: '' });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({
      name: '',
      ruc: '',
      status: 'active'
    });
    setErrors({});
  };

  const handleViewDetails = (creditor) => {
    setDetailsModal({
      show: true,
      creditor: creditor
    });
  };

  const closeDetailsModal = () => {
    setDetailsModal({
      show: false,
      creditor: null
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Activo',
      inactive: 'Inactivo'
    };
    return labels[status] || status;
  };

  // Filtrar acreedores
  const filteredCreditors = creditors.filter(creditor => {
    const matchesSearch = creditor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creditor.ruc.includes(searchTerm);
    const matchesStatus = filterStatus === 'todos' || creditor.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Paginación
  const totalPages = Math.ceil(filteredCreditors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCreditors = filteredCreditors.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header 
          title="Gestión de Acreedores" 
          userName={user?.first_name}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="creditors-container">
          {error && (
            <div className="error-banner" style={{ 
              backgroundColor: '#ff4444', 
              color: '#fff', 
              padding: '12px 20px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>❌ {error}</span>
              <button 
                onClick={() => setError(null)} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#fff', 
                  cursor: 'pointer',
                  fontSize: '18px' 
                }}
              >✕</button>
            </div>
          )}

          {successMessage && (
            <div className="success-banner" style={{ 
              backgroundColor: '#4CAF50', 
              color: '#fff', 
              padding: '12px 20px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'slideIn 0.3s ease-out'
            }}>
              <span>✅ {successMessage}</span>
              <button 
                onClick={() => setSuccessMessage('')} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#fff', 
                  cursor: 'pointer',
                  fontSize: '18px' 
                }}
              >✕</button>
            </div>
          )}

          {/* Modal de Formulario */}
          {isCreating && (
            <div className="form-modal-overlay">
              <div className="form-modal-content">
                <div className="form-card-header">
                  <h2>{editingId ? 'Editar Acreedor' : 'Nuevo Acreedor'}</h2>
                  <button className="close-btn" onClick={handleCancel}>✕</button>
                </div>
                <form className="creditors-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Nombre del Acreedor *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ej: Banco Pacífico"
                        disabled={loading}
                      />
                      {errors.name && <span className="error-text">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="ruc">RUC *</label>
                      <input
                        type="text"
                        id="ruc"
                        name="ruc"
                        value={formData.ruc}
                        onChange={handleChange}
                        placeholder="Ej: 1212312312313"
                        disabled={loading}
                      />
                      {errors.ruc && <span className="error-text">{errors.ruc}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Estado</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '14px', color: '#666' }}>Inactivo</span>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            status: prev.status === 'active' ? 'inactive' : 'active' 
                          }))}
                          disabled={loading}
                          style={{
                            width: '50px',
                            height: '28px',
                            borderRadius: '14px',
                            border: 'none',
                            backgroundColor: formData.status === 'active' ? '#4CAF50' : '#ccc',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: formData.status === 'active' ? 'flex-end' : 'flex-start',
                            padding: '2px'
                          }}
                        >
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#fff',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                          }} />
                        </button>
                        <span style={{ fontSize: '14px', color: '#666' }}>Activo</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">  
                   <button type="submit" disabled={loading} className="btn-primary" >
                      {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Acreedor'}
                    </button>                  
                    <button type="button" className="btn-secondary" onClick={handleCancel} disabled={loading} >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Acciones y búsqueda */}
          <div className="creditors-filters">
            <div className="search-box">
                <input
                  type="text"
                  placeholder="Buscar por nombre o RUC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="search-icon">🔍</span>
            </div>
            <div className="filter-status">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
            </div>
            <div className="filter-nuevo">
              {!isCreating && (
              <button className="btn-primary" onClick={() => {setIsCreating(true);}} disabled={isCreating || loading}>
                ➕  Nuevo Acreedor
              </button>
              )}
            </div>
          </div>

          {loading && (
            <div className="loading-overlay" style={{
              padding: '20px',
              textAlign: 'center',
              color: '#666'
            }}>
              <p>Cargando...</p>
            </div>
          )}

          <div className="creditors-list">
            {filteredCreditors.length === 0 ? (
              <div className="empty-state">
                <p>No hay acreedores que coincidan con tu búsqueda</p>
              </div>
            ) : (
              <div className="general-table">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>RUC</th>
                    <th>Estado</th>
                    <th>Creado</th>
                    <th>Actualizado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCreditors.map((creditor) => (
                    <tr key={creditor.id}>
                      <td className="creditor-name">
                        {creditor.name}
                      </td>
                      <td>{creditor.ruc}</td>
                      <td>
                        <span className={`status-badge status-${creditor.status}`}>
                          {getStatusLabel(creditor.status)}
                        </span>
                      </td>
                      <td>{new Date(creditor.created_at).toLocaleDateString('es-ES')}</td>
                      <td>{new Date(creditor.updated_at).toLocaleDateString('es-ES')}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon" 
                            title="Ver detalles"
                            onClick={() => handleViewDetails(creditor)}
                          >
                            👁️
                          </button>
                          <button 
                            className="btn-icon" 
                            title="Editar"
                            onClick={() => handleEdit(creditor)}
                            disabled={loading}
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-icon btn-delete" 
                            title="Eliminar"
                            onClick={() => handleDeleteClick(creditor)}
                            disabled={loading}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>

          {/* Controles de paginación */}
          {filteredCreditors.length > 0 && totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              marginTop: '20px',
              padding: '20px',
              backgroundColor: '#fff',
              borderRadius: '8px'
            }}>
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage === 1 ? '#ddd' : '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ← Anterior
              </button>

              <div style={{ display: 'flex', gap: '5px' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: currentPage === page ? '#007bff' : '#f0f0f0',
                      color: currentPage === page ? '#fff' : '#333',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: currentPage === page ? '600' : '500',
                      minWidth: '40px'
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage === totalPages ? '#ddd' : '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Siguiente →
              </button>

              <span style={{
                marginLeft: '20px',
                fontSize: '14px',
                color: '#666'
              }}>
                Página {currentPage} de {totalPages} ({filteredCreditors.length} registros)
              </span>
            </div>
          )}

        {/* Modal de confirmación de eliminación */}
        {deleteModal.show && (
          <div className="delete-modal-overlay">
            <div className="delete-modal-content">
              <div className="delete-modal-icon">⚠️</div>
              <h2>Confirmar eliminación</h2>
              <p>
                ¿Está seguro de que desea eliminar el acreedor <strong>{deleteModal.name}</strong>? Esta acción no se puede deshacer.
              </p>
              <div className="delete-modal-actions">
                <button 
                  onClick={cancelDelete}
                  disabled={loading}
                  className="delete-modal-cancel"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={loading}
                  className="delete-modal-confirm"
                >
                  {loading ? 'Eliminando...' : 'Sí, Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalles */}
        {detailsModal.show && detailsModal.creditor && (
          <div className="details-modal-overlay">
            <div className="details-modal-content">
              <div className="details-modal-header">
                <h2>Detalles del Acreedor</h2>
              </div>

              <div className="details-info-container">
                <div className="details-info-item">
                  <label className="details-info-label">Nombre</label>
                  <p className="details-info-value">{detailsModal.creditor.name}</p>
                </div>

                <div className="details-info-item">
                  <label className="details-info-label">RUC</label>
                  <p className="details-info-value-normal">{detailsModal.creditor.ruc}</p>
                </div>

                <div className="details-info-item">
                  <label className="details-info-label">Estado</label>
                  <p>
                    <span className={`details-status-badge ${detailsModal.creditor.status}`}>
                      {getStatusLabel(detailsModal.creditor.status)}
                    </span>
                  </p>
                </div>

                <div className="details-info-item">
                  <label className="details-info-label">Creado</label>
                  <p className="details-info-value-small">
                    {new Date(detailsModal.creditor.created_at).toLocaleString('es-ES')}
                  </p>
                </div>

                <div className="details-info-item">
                  <label className="details-info-label">Actualizado</label>
                  <p className="details-info-value-small">
                    {new Date(detailsModal.creditor.updated_at).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>

              <div className="details-modal-footer">
                <button 
                  onClick={closeDetailsModal}
                  className="details-modal-close-btn"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Creditors;
