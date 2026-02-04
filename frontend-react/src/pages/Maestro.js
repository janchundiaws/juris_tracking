import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { maestroService } from '../services/api';
import '../styles/Dashboard.css';
import '../styles/Maestro.css';

// Opciones para el código maestro
const CODIGO_MAESTRO_OPTIONS = [
  { value: 'PRODUCTO', label: 'Producto' },
  { value: 'GARANTIA', label: 'Garantía' },
  { value: 'TIPO_DE_PROCESO', label: 'Tipo de Proceso' }
];

const Maestro = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [maestros, setMaestros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterCode, setFilterCode] = useState('todos');
  const [formData, setFormData] = useState({
    value: '',
    code_maestro: '',
    status: 'activo'
  });
  const [errors, setErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, value: '' });
  const [detailsModal, setDetailsModal] = useState({ show: false, maestro: null });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchMaestros();
  }, []);

  const fetchMaestros = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await maestroService.getAll();
      setMaestros(data);
    } catch (err) {
      console.error('Error al cargar maestros:', err);
      setError('Error al cargar los maestros. Por favor, intenta de nuevo.');
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
    
    if (!formData.value.trim()) {
      newErrors.value = 'El valor es requerido';
    }
    
    if (!formData.code_maestro.trim()) {
      newErrors.code_maestro = 'El código maestro es requerido';
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
        // Actualizar maestro existente
        await maestroService.update(editingId, formData);
        setSuccessMessage('Maestro actualizado exitosamente');
      } else {
        // Crear nuevo maestro
        await maestroService.create(formData);
        setSuccessMessage('Maestro creado exitosamente');
      }
      
      await fetchMaestros();
      resetForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error al guardar maestro:', err);
      setError('Error al guardar el maestro. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      value: '',
      code_maestro: '',
      status: 'activo'
    });
    setErrors({});
    setIsCreating(false);
    setEditingId(null);
  };

  const handleEdit = (maestro) => {
    setFormData({
      value: maestro.value,
      code_maestro: maestro.code_maestro,
      status: maestro.status
    });
    setEditingId(maestro.id);
    setIsCreating(true);
  };

  const handleDeleteClick = (maestro) => {
    setDeleteModal({ show: true, id: maestro.id, value: maestro.value });
  };

  const handleViewDetails = (maestro) => {
    setDetailsModal({ show: true, maestro });
  };

  const closeDetailsModal = () => {
    setDetailsModal({ show: false, maestro: null });
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await maestroService.delete(deleteModal.id);
      setDeleteModal({ show: false, id: null, value: '' });
      await fetchMaestros();
      setSuccessMessage('Maestro eliminado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error al eliminar maestro:', err);
      setError('Error al eliminar el maestro. Por favor, intenta de nuevo.');
      setDeleteModal({ show: false, id: null, value: '' });
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, id: null, value: '' });
  };

  const filteredMaestros = maestros.filter(m => {
    const matchesSearch = 
      m.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code_maestro.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'todos' || m.status === filterStatus;
    const matchesCode = filterCode === 'todos' || m.code_maestro === filterCode;
    
    return matchesSearch && matchesStatus && matchesCode;
  });

  // Obtener códigos únicos para el filtro
  const uniqueCodes = [...new Set(maestros.map(m => m.code_maestro))];

  const getStatusLabel = (status) => {
    return status === 'activo' ? 'Activo' : 'Inactivo';
  };

  const getCodigoMaestroLabel = (codeMaestro) => {
    const option = CODIGO_MAESTRO_OPTIONS.find(opt => opt.value === codeMaestro);
    return option ? option.label : codeMaestro;
  };

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
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header 
          title="Gestión de Maestros" 
          userName={user?.first_name}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="maestro-container">
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

          {isCreating && (
            <div className="form-modal-overlay">
              <div className="form-modal-content">
              <div className="form-card-header">
                <h2>{editingId ? 'Editar Maestro' : 'Crear Nuevo Maestro'}</h2>
                <button className="close-btn" onClick={resetForm}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className="maestro-form">
                {errors.general && (
                  <div className="error-message">{errors.general}</div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="value">Valor *</label>
                    <input
                      type="text"
                      id="value"
                      name="value"
                      value={formData.value}
                      onChange={handleChange}
                      placeholder="ej: CONSUMO, VIP, ACTIVO"
                    />
                    {errors.value && <span className="error-text">{errors.value}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="code_maestro">Código Maestro *</label>
                    <select
                      id="code_maestro"
                      name="code_maestro"
                      value={formData.code_maestro}
                      onChange={handleChange}
                    >
                      <option value="">Seleccione un código</option>
                      {CODIGO_MAESTRO_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.code_maestro && <span className="error-text">{errors.code_maestro}</span>}
                  </div>
                </div>

                <div className="form-row">
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
                        color: formData.status === 'activo' ? '#4CAF50' : '#999',
                        minWidth: '60px'
                      }}>
                        Activo
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          status: prev.status === 'activo' ? 'inactivo' : 'activo' 
                        }))}
                        style={{
                          width: '50px',
                          height: '28px',
                          borderRadius: '14px',
                          border: 'none',
                          backgroundColor: formData.status === 'activo' ? '#4CAF50' : '#ccc',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s ease',
                          position: 'relative',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: formData.status === 'activo' ? 'flex-end' : 'flex-start',
                          paddingRight: formData.status === 'activo' ? '4px' : '0px',
                          paddingLeft: formData.status === 'activo' ? '0px' : '4px'
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
                        color: formData.status === 'inactivo' ? '#ff4444' : '#999',
                        minWidth: '70px'
                      }}>
                        Inactivo
                      </span>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Guardando...' : editingId ? 'Actualizar Maestro' : 'Crear Maestro'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={resetForm} disabled={loading}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
            </div>
          )}

          <div className="maestro-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar por valor o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>

            <div className="filter-group">
              <select value={filterCode} onChange={(e) => setFilterCode(e.target.value)}>
                <option value="todos">Todos los Códigos</option>
                {uniqueCodes.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>

            <div className="filter-status">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="todos">Todos los Estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            
            <div className="filter-nuevo">
              {!isCreating && (
                <button className="btn-primary" onClick={() => setIsCreating(true)}>
                  ➕ Nuevo Maestro
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

          <div className="maestro-list">
            {filteredMaestros.length === 0 ? (
              <div className="empty-state">
                <p>No hay maestros que coincidan con tu búsqueda</p>
              </div>
            ) : (
              <table className="maestro-table">
                <thead>
                  <tr>
                    <th>Valor</th>
                    <th>Código Maestro</th>
                    <th>Estado</th>
                    <th>Creado</th>
                    <th>Actualizado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaestros.map((maestro) => (
                    <tr key={maestro.id}>
                      <td className="maestro-value">{maestro.value}</td>
                      <td>
                        <span className="code-badge">{getCodigoMaestroLabel(maestro.code_maestro)}</span>
                      </td>
                      <td>
                        <span className={`status-badge status-${maestro.status}`}>
                          {getStatusLabel(maestro.status)}
                        </span>
                      </td>
                      <td className="date-cell">{formatDate(maestro.created_at)}</td>
                      <td className="date-cell">{formatDate(maestro.updated_at)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon" 
                            title="Ver detalles"
                            onClick={() => handleViewDetails(maestro)}
                          >
                            👁️
                          </button>
                          <button 
                            className="btn-icon" 
                            title="Editar"
                            onClick={() => handleEdit(maestro)}
                            disabled={loading}
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-icon btn-delete" 
                            title="Eliminar"
                            onClick={() => handleDeleteClick(maestro)}
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
            )}
          </div>
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
                  ¿Estás seguro de que deseas eliminar el maestro:
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
                  "{deleteModal.value}"
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
        {detailsModal.show && detailsModal.maestro && (
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
              maxWidth: '450px',
              width: '90%',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <h2 style={{ color: '#1a1a1a', marginBottom: '10px' }}>Detalles del Maestro</h2>
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
                  }}>Valor</label>
                  <p style={{ 
                    fontSize: '16px', 
                    color: '#1a1a1a', 
                    fontWeight: '500',
                    margin: 0
                  }}>{detailsModal.maestro.value}</p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block',
                    fontSize: '12px',
                    color: '#666',
                    fontWeight: '600',
                    marginBottom: '6px',
                    textTransform: 'uppercase'
                  }}>Código Maestro</label>
                  <p style={{ 
                    fontSize: '16px', 
                    color: '#1a1a1a', 
                    fontWeight: '500',
                    margin: 0
                  }}>{detailsModal.maestro.code_maestro}</p>
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
                      backgroundColor: detailsModal.maestro.status === 'activo' ? '#d4edda' : '#f8d7da',
                      color: detailsModal.maestro.status === 'activo' ? '#155724' : '#721c24'
                    }}>
                      {getStatusLabel(detailsModal.maestro.status)}
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
                  }}>Creado</label>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#1a1a1a', 
                    margin: 0
                  }}>{formatDate(detailsModal.maestro.created_at)}</p>
                </div>

                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: '12px',
                    color: '#666',
                    fontWeight: '600',
                    marginBottom: '6px',
                    textTransform: 'uppercase'
                  }}>Actualizado</label>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#1a1a1a', 
                    margin: 0
                  }}>{formatDate(detailsModal.maestro.updated_at)}</p>
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

export default Maestro;
