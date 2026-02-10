import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { lawyersService } from '../services/api';
import '../styles/Dashboard.css';
import '../styles/Lawyers.css';

const Lawyers = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    lawyer_type: 'internal',
    status: 'active',
    user_id: ''
  });
  const [errors, setErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  const [detailsModal, setDetailsModal] = useState({ show: false, lawyer: null });

  useEffect(() => {
    fetchLawyers();
  }, []);

  // Resetear página cuando los filtros cambian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const fetchLawyers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await lawyersService.getAll();
      setLawyers(data);
    } catch (err) {
      console.error('Error al cargar abogados:', err);
      setError('Error al cargar los abogados. Por favor, intenta de nuevo.');
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

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
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
        // Actualizar abogado existente
        await lawyersService.update(editingId, formData);
        setSuccessMessage('Abogado actualizado exitosamente');
      } else {
        // Crear nuevo abogado
        await lawyersService.create(formData);
        setSuccessMessage('Abogado creado exitosamente');
      }
      
      await fetchLawyers();
      resetForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error al guardar abogado:', err);
      setError('Error al guardar el abogado. Por favor, intenta de nuevo. ' + err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      lawyer_type: 'internal',
      status: 'active',
      user_id: ''
    });
    setErrors({});
    setIsCreating(false);
    setEditingId(null);
  };

  const handleEdit = (lawyer) => {
    setFormData(lawyer);
    setEditingId(lawyer.id);
    setIsCreating(true);
  };

  const handleDeleteClick = (lawyer) => {
    setDeleteModal({ show: true, id: lawyer.id, name: `${lawyer.first_name} ${lawyer.last_name}` });
  };

  const handleViewDetails = (lawyer) => {
    setDetailsModal({ show: true, lawyer });
  };

  const closeDetailsModal = () => {
    setDetailsModal({ show: false, lawyer: null });
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await lawyersService.delete(deleteModal.id);
      setDeleteModal({ show: false, id: null, name: '' });
      await fetchLawyers();
      setSuccessMessage('Abogado eliminado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error al eliminar abogado:', err);
      setError('Error al eliminar el abogado. Por favor, intenta de nuevo.');
      setDeleteModal({ show: false, id: null, name: '' });
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, id: null, name: '' });
  };

  const filteredLawyers = lawyers.filter(l => {
    const matchesSearch = 
      l.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'todos' || l.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Lógica de paginación
  const totalPages = Math.ceil(filteredLawyers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLawyers = filteredLawyers.slice(startIndex, endIndex);

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

  const getStatusLabel = (status) => {
    return status === 'active' ? 'Activo' : 'Inactivo';
  };

  const getTypeLabel = (type) => {
    return type === 'internal' ? 'Interno' : 'Externo';
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header 
          title="Gestión de Abogados" 
          userName={user?.first_name}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="lawyers-container">
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

          {/*Modal para crear nuevo abogado o editar existente */}
          {isCreating && (
            <div className="form-modal-overlay">
              <div className="form-modal-content">
                  <div className="form-card-header">
                    <h2>{editingId ? 'Editar Abogado' : 'Crear Nuevo Abogado'}</h2>
                    <button className="close-btn" onClick={resetForm}>✕</button>
                  </div>

                  <form onSubmit={handleSubmit} className="lawyers-form">
                    {errors.general && (
                      <div className="error-message">{errors.general}</div>
                    )}

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="first_name">Nombre *</label>
                        <input
                          type="text"
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          placeholder="Carlos"
                        />
                        {errors.first_name && <span className="error-text">{errors.first_name}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="last_name">Apellido *</label>
                        <input
                          type="text"
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          placeholder="Mendoza"
                        />
                        {errors.last_name && <span className="error-text">{errors.last_name}</span>}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="email">Correo Electrónico *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="abogado@example.com"
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="phone">Teléfono *</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+593 999 999 999"
                        />
                        {errors.phone && <span className="error-text">{errors.phone}</span>}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="lawyer_type">Tipo de Abogado</label>
                        <select
                          id="lawyer_type"
                          name="lawyer_type"
                          value={formData.lawyer_type}
                          onChange={handleChange}
                        >
                          <option value="internal">Interno</option>
                          <option value="external">Externo</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Estado</label>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginTop: '8px'
                        }}>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: formData.status === 'active' ? '#4CAF50' : '#999',
                            minWidth: '60px'
                          }}>
                            Activo
                          </span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ 
                              ...prev, 
                              status: prev.status === 'active' ? 'inactive' : 'active' 
                            }))}
                            style={{
                              width: '50px',
                              height: '28px',
                              borderRadius: '14px',
                              border: 'none',
                              backgroundColor: formData.status === 'active' ? '#4CAF50' : '#ccc',
                              cursor: 'pointer',
                              transition: 'background-color 0.3s ease',
                              position: 'relative',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: formData.status === 'active' ? 'flex-end' : 'flex-start',
                              paddingRight: formData.status === 'active' ? '4px' : '0px',
                              paddingLeft: formData.status === 'active' ? '0px' : '4px'
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
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: formData.status === 'inactive' ? '#ff4444' : '#999',
                            minWidth: '70px'
                          }}>
                            Inactivo
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Guardando...' : editingId ? 'Actualizar Abogado' : 'Crear Abogado'}
                      </button>
                      <button type="button" className="btn-secondary" onClick={resetForm} disabled={loading}>
                        Cancelar
                      </button>
                    </div>
                  </form>
              </div>
            </div>
          )}

          <div className="lawyers-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>

            <div className="filter-status">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="todos">Todos los Estados</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            <div className="filter-nuevo">
              {!isCreating && (
                <button className="btn-primary" onClick={() => setIsCreating(true)} disabled={loading}>
                  ➕ Nuevo Abogado
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

          <div className="lawyers-list">
            {filteredLawyers.length === 0 ? (
              <div className="empty-state">
                <p>No hay abogados que coincidan con tu búsqueda</p>
              </div>
            ) : (
              <div className="general-table">
              <table>
                <thead>
                  <tr>
                    <th>Nombre Completo</th>
                    <th>Correo Electrónico</th>
                    <th>Teléfono</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLawyers.map((lawyer) => (
                    <tr key={lawyer.id}>
                      <td className="lawyer-name">
                        {lawyer.first_name} {lawyer.last_name}
                      </td>
                      <td>{lawyer.email}</td>
                      <td>{lawyer.phone}</td>
                      <td>
                        <span className={`type-badge type-${lawyer.lawyer_type}`}>
                          {getTypeLabel(lawyer.lawyer_type)}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${lawyer.status}`}>
                          {getStatusLabel(lawyer.status)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon" 
                            title="Ver detalles"
                            onClick={() => handleViewDetails(lawyer)}
                          >
                            👁️
                          </button>
                          <button 
                            className="btn-icon" 
                            title="Editar"
                            onClick={() => handleEdit(lawyer)}
                            disabled={loading}
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-icon btn-delete" 
                            title="Eliminar"
                            onClick={() => handleDeleteClick(lawyer)}
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
          {filteredLawyers.length > 0 && totalPages > 1 && (
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
                Página {currentPage} de {totalPages} ({filteredLawyers.length} registros)
              </span>
            </div>
          )}
        </div>

        {/* Modal de confirmación de eliminación */}
        {deleteModal.show && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>⚠️</div>
                <h2 style={{ color: '#1a1a1a', marginBottom: '10px' }}>Confirmar Eliminación</h2>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  ¿Estás seguro de que deseas eliminar este abogado:
                </p>
                <p style={{ 
                  color: '#1a1a1a', 
                  fontWeight: 'bold', 
                  fontSize: '16px',
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '6px'
                }}>
                  "{deleteModal.name}"
                </p>
                <p style={{ color: '#ff4444', fontSize: '13px', marginTop: '10px' }}>
                  Esta acción no se puede deshacer.
                </p>
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                justifyContent: 'center',
                marginTop: '25px'
              }}>
                <button 
                  onClick={cancelDelete}
                  disabled={loading}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#666',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#555'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#666'}
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={loading}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#ff4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s',
                    opacity: loading ? 0.6 : 1
                  }}
                  onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#cc0000')}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#ff4444'}
                >
                  {loading ? 'Eliminando...' : 'Sí, Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalles */}
        {detailsModal.show && detailsModal.lawyer && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <h2 style={{ color: '#1a1a1a', marginBottom: '10px' }}>Detalles del Abogado</h2>
              </div>

              <div style={{ 
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block',
                    fontSize: '12px',
                    color: '#666',
                    fontWeight: '600',
                    marginBottom: '6px',
                    textTransform: 'uppercase'
                  }}>Nombre Completo</label>
                  <p style={{ 
                    fontSize: '16px', 
                    color: '#1a1a1a', 
                    fontWeight: '500',
                    margin: 0
                  }}>{detailsModal.lawyer.first_name} {detailsModal.lawyer.last_name}</p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block',
                    fontSize: '12px',
                    color: '#666',
                    fontWeight: '600',
                    marginBottom: '6px',
                    textTransform: 'uppercase'
                  }}>Correo Electrónico</label>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#1a1a1a', 
                    margin: 0
                  }}>{detailsModal.lawyer.email}</p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block',
                    fontSize: '12px',
                    color: '#666',
                    fontWeight: '600',
                    marginBottom: '6px',
                    textTransform: 'uppercase'
                  }}>Teléfono</label>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#1a1a1a', 
                    margin: 0
                  }}>{detailsModal.lawyer.phone}</p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block',
                    fontSize: '12px',
                    color: '#666',
                    fontWeight: '600',
                    marginBottom: '6px',
                    textTransform: 'uppercase'
                  }}>Tipo de Abogado</label>
                  <p style={{ margin: 0 }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: '500',
                      backgroundColor: detailsModal.lawyer.lawyer_type === 'internal' ? '#e3f2fd' : '#fff3e0',
                      color: detailsModal.lawyer.lawyer_type === 'internal' ? '#1565c0' : '#e65100'
                    }}>
                      {getTypeLabel(detailsModal.lawyer.lawyer_type)}
                    </span>
                  </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block',
                    fontSize: '12px',
                    color: '#666',
                    fontWeight: '600',
                    marginBottom: '6px',
                    textTransform: 'uppercase'
                  }}>Estado</label>
                  <p style={{ margin: 0 }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: '500',
                      backgroundColor: detailsModal.lawyer.status === 'active' ? '#d4edda' : '#f8d7da',
                      color: detailsModal.lawyer.status === 'active' ? '#155724' : '#721c24'
                    }}>
                      {getStatusLabel(detailsModal.lawyer.status)}
                    </span>
                  </p>
                </div>

                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: '12px',
                    color: '#666',
                    fontWeight: '600',
                    marginBottom: '6px',
                    textTransform: 'uppercase'
                  }}>ID de Usuario</label>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#999', 
                    fontFamily: 'monospace',
                    margin: 0,
                    wordBreak: 'break-all'
                  }}>{detailsModal.lawyer.user_id || 'N/A'}</p>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                justifyContent: 'flex-end'
              }}>
                <button 
                  onClick={closeDetailsModal}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lawyers;
