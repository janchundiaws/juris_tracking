import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { casesService, lawyersService, creditorsService, provinciesService, maestroService } from '../services/api';
import '../styles/Dashboard.css';
import '../styles/Cases.css';

const Cases = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cases, setCases] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [creditors, setCreditors] = useState([]);
  const [provincies, setProvincies] = useState([]);
  const [maestro, setMaestro] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [formData, setFormData] = useState({
    internal_lawyer_id: '',
    external_lawyer_id: '',
    provincie_id: '',
    creditor_id: '',
    product: '',
    guarantee: '',
    identification: '',
    full_name: '',
    operation: '',
    area_assignment_date: '',
    internal_assignment_date: '',
    external_assignment_date: '',
    process_type: '',
    case_number: '',
    procedural_summary: '',
    procedural_progress: '',
    demand_date: '',
    status: 'activo'
  });
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar casos
      try {
        const casesData = await casesService.getAll();
        setCases(casesData || []);
      } catch (err) {
        console.error('Error al cargar casos:', err);
        setCases([]);
      }

      // Cargar abogados
      try {
        const lawyersData = await lawyersService.getAll();
        setLawyers(lawyersData || []);
      } catch (err) {
        console.error('Error al cargar abogados:', err);
        setLawyers([]);
      }

      // Cargar acreedores
      try {
        const creditorsData = await creditorsService.getAll();
        setCreditors(creditorsData || []);
      } catch (err) {
        console.error('Error al cargar acreedores:', err);
        setCreditors([]);
      }

      // Cargar provincias
      try {
        const provinciesData = await provinciesService.getAll();
        setProvincies(provinciesData || []);
      } catch (err) {
        console.error('Error al cargar provincias:', err);
        setProvincies([]);
      }

      // Cargar maestro (productos, garantías, tipos de proceso)
      try {
        const maestroData = await maestroService.getAll();
        setMaestro(maestroData || []);
      } catch (err) {
        console.error('Error al cargar maestro:', err);
        setMaestro([]);
      }
    } catch (err) {
      console.error('Error general al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!formData.case_number.trim()) {
      newErrors.case_number = 'El número de caso es requerido';
    }
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre completo es requerido';
    }
    
    if (!formData.identification.trim()) {
      newErrors.identification = 'La identificación es requerida';
    }

    if (!formData.internal_lawyer_id) {
      newErrors.internal_lawyer_id = 'El abogado interno es requerido';
    }

    if (!formData.creditor_id) {
      newErrors.creditor_id = 'El acreedor es requerido';
    }

    if (!formData.product) {
      newErrors.product = 'El producto es requerido';
    }

    if (!formData.guarantee) {
      newErrors.guarantee = 'La garantía es requerida';
    }

    // Validación de fechas - Campos requeridos
    if (!formData.area_assignment_date) {
      newErrors.area_assignment_date = 'La fecha de asignación de área es requerida';
    } else {
      const areaDate = new Date(formData.area_assignment_date);
      if (areaDate > today) {
        newErrors.area_assignment_date = 'La fecha de asignación de área no puede ser futura';
      }
    }

    if (!formData.internal_assignment_date) {
      newErrors.internal_assignment_date = 'La fecha de asignación interna es requerida';
    } else {
      const internalDate = new Date(formData.internal_assignment_date);
      if (internalDate > today) {
        newErrors.internal_assignment_date = 'La fecha de asignación interna no puede ser futura';
      }
      
      if (formData.area_assignment_date) {
        const areaDate = new Date(formData.area_assignment_date);
        if (internalDate < areaDate) {
          newErrors.internal_assignment_date = 'La fecha de asignación interna no puede ser anterior a la fecha de asignación de área';
        }
      }
    }

    if (!formData.demand_date) {
      newErrors.demand_date = 'La fecha de demanda es requerida';
    } else {
      const demandDate = new Date(formData.demand_date);
      if (demandDate > today) {
        newErrors.demand_date = 'La fecha de demanda no puede ser futura';
      }
    }

    if (formData.external_assignment_date) {
      const externalDate = new Date(formData.external_assignment_date);
      if (externalDate > today) {
        newErrors.external_assignment_date = 'La fecha de asignación externa no puede ser futura';
      }

      if (formData.internal_assignment_date) {
        const internalDate = new Date(formData.internal_assignment_date);
        if (externalDate < internalDate) {
          newErrors.external_assignment_date = 'La fecha de asignación externa no puede ser anterior a la fecha de asignación interna';
        }
      }
    }

    // Validar que si hay abogado externo, debe haber fecha de asignación externa
    if (formData.external_lawyer_id && !formData.external_assignment_date) {
      newErrors.external_assignment_date = 'Debe indicar la fecha de asignación del abogado externo';
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
        await casesService.update(editingId, formData);
        setSuccessMessage('Caso actualizado exitosamente');
        setEditingId(null);
      } else {
        await casesService.create(formData);
        setSuccessMessage('Caso creado exitosamente');
      }
      
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.data.error || 'Error al guardar el caso');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      internal_lawyer_id: '',
      external_lawyer_id: '',
      provincie_id: '',
      creditor_id: '',
      product: '',
      guarantee: '',
      identification: '',
      full_name: '',
      operation: '',
      area_assignment_date: '',
      internal_assignment_date: '',
      external_assignment_date: '',
      process_type: '',
      case_number: '',
      procedural_summary: '',
      procedural_progress: '',
      demand_date: '',
      status: 'activo'
    });
    setIsCreating(false);
    setEditingId(null);
    setErrors({});
  };

  const handleEdit = (caseItem) => {
    setFormData(caseItem);
    setEditingId(caseItem.id);
    setIsCreating(true);
  };

  // Funciones para filtrar datos de los abogados
  const getInternalLawyers = () => {
    return lawyers.filter(l => l.lawyer_type === 'internal') || [];
  };
  
  const getExternalLawyers = () => {
    return lawyers.filter(l => l.lawyer_type === 'external') || [];
  };

  // Funciones para filtrar datos del maestro
  const getProductos = () => {
    return maestro.filter(m => m.code_maestro === 'PRODUCTO') || [];
  };

  const getGarantias = () => {
    return maestro.filter(m => m.code_maestro === 'GARANTIA') || [];
  };

  const getTiposProceso = () => {
    return maestro.filter(m => m.code_maestro === 'TIPO_DE_PROCESO') || [];
  };


  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'todos' || c.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Paginación
  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCases = filteredCases.slice(startIndex, endIndex);

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
    const labels = {
      'activo': 'Activo',
      'inactive': 'Inactivo',
      'pendiente': 'Pendiente',
      'closed': 'Cerrado'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'activo':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'pendiente':
        return 'status-pending';
      case 'closed':
        return 'status-closed';
      default:
        return '';
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header 
          title="Gestión de Casos" 
          userName={user?.first_name}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
    <div className="cases-container">

        {isCreating && (
          <div className="form-modal-overlay">
            <div className="form-modal-content">
              <div className="form-card-header">
                <h3>{editingId ? 'Editar Caso' : 'Crear Nuevo Caso'}</h3>
                <button className="close-btn" onClick={resetForm}>✕</button>
              </div>

              <div className="form-modal-body">
              {error && (
                <div className="error-banner" style={{ 
                  backgroundColor: '#ff4444', 
                  color: '#fff', 
                  padding: '12px 20px', 
                  borderRadius: '8px', 
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  margin: '12px'
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

              <form onSubmit={handleSubmit} className="cases-form">
                {/* Información Personal */}
                <div >
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#1a1a1a' }}>Información Personal</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="full_name">Nombre Completo *</label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="Juan Pérez García"
                        disabled={loading}
                      />
                      {errors.full_name && <span className="error-text">{errors.full_name}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="identification">Identificación *</label>
                      <input
                        type="text"
                        id="identification"
                        name="identification"
                        value={formData.identification}
                        onChange={handleChange}
                        placeholder="Cédula o Pasaporte"
                        disabled={loading}
                      />
                      {errors.identification && <span className="error-text">{errors.identification}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="operation">Operación</label>
                      <input
                        type="text"
                        id="operation"
                        name="operation"
                        value={formData.operation}
                        onChange={handleChange}
                        placeholder="Número de operación"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Información del Caso */}
                <div >
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#1a1a1a' }}>Información del Caso</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="case_number">Número de Caso *</label>
                      <input
                        type="text"
                        id="case_number"
                        name="case_number"
                        value={formData.case_number}
                        onChange={handleChange}
                        placeholder="CASO-2026-001"
                        disabled={loading}
                      />
                      {errors.case_number && <span className="error-text">{errors.case_number}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="process_type">Tipo de Proceso</label>
                      <select
                        id="process_type"
                        name="process_type"
                        value={formData.process_type}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="">Seleccionar tipo de proceso</option>
                        {getTiposProceso().map(tp => (
                          <option key={tp.id} value={tp.id}>
                            {tp.value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="procedural_summary">Resumen de lo Actuado</label>
                      <textarea
                        id="procedural_summary"
                        name="procedural_summary"
                        value={formData.procedural_summary}
                        onChange={handleChange}
                        placeholder="Resumen del procedimiento..."
                        rows="3"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="procedural_progress">Avance Procesal</label>
                      <textarea
                        id="procedural_progress"
                        name="procedural_progress"
                        value={formData.procedural_progress}
                        onChange={handleChange}
                        placeholder="Progreso del caso..."
                        rows="3"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Asignaciones */}
                <div >
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#1a1a1a' }}>Asignaciones</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="internal_lawyer_id">Abogado Interno *</label>
                      <select
                        id="internal_lawyer_id"
                        name="internal_lawyer_id"
                        value={formData.internal_lawyer_id}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="">Seleccionar abogado interno</option>
                        {getInternalLawyers().map(lawyer => (
                          <option key={lawyer.id} value={lawyer.id}>
                            {lawyer.first_name} {lawyer.last_name}
                          </option>
                        ))}
                      </select>
                      {errors.internal_lawyer_id && <span className="error-text">{errors.internal_lawyer_id}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="external_lawyer_id">Abogado Externo *</label>
                      <select
                        id="external_lawyer_id"
                        name="external_lawyer_id"
                        value={formData.external_lawyer_id}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="">Seleccionar abogado externo</option>
                        {getExternalLawyers().map(lawyer => (
                          <option key={lawyer.id} value={lawyer.id}>
                            {lawyer.first_name} {lawyer.last_name}
                          </option>
                        ))}
                      </select>
                      {errors.external_lawyer_id && <span className="error-text">{errors.external_lawyer_id}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="area_assignment_date">Fecha de Asignación de Área *</label>
                      <input
                        type="date"
                        id="area_assignment_date"
                        name="area_assignment_date"
                        value={formData.area_assignment_date}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      {errors.area_assignment_date && <span className="error-text">{errors.area_assignment_date}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="internal_assignment_date">Fecha de Asignación Interna *</label>
                      <input
                        type="date"
                        id="internal_assignment_date"
                        name="internal_assignment_date"
                        value={formData.internal_assignment_date}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      {errors.internal_assignment_date && <span className="error-text">{errors.internal_assignment_date}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="external_assignment_date">Fecha de Asignación Externa{formData.external_lawyer_id && ' *'}</label>
                      <input
                        type="date"
                        id="external_assignment_date"
                        name="external_assignment_date"
                        value={formData.external_assignment_date}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      {errors.external_assignment_date && <span className="error-text">{errors.external_assignment_date}</span>}
                    </div>
                  </div>
                </div>

                {/* Detalles Adicionales */}
                <div >
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#1a1a1a' }}>Detalles Adicionales</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="creditor_id">Acreedor *</label>
                      <select
                        id="creditor_id"
                        name="creditor_id"
                        value={formData.creditor_id}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="">Seleccionar acreedor</option>
                        {creditors.map(creditor => (
                          <option key={creditor.id} value={creditor.id}>
                            {creditor.name}
                          </option>
                        ))}
                      </select>
                      {errors.creditor_id && <span className="error-text">{errors.creditor_id}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="provincie_id">Provincia *</label>
                      <select
                        id="provincie_id"
                        name="provincie_id"
                        value={formData.provincie_id}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="">Seleccionar provincia</option>
                        {provincies.map(province => (
                          <option key={province.id} value={province.id}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                      {errors.provincie_id && <span className="error-text">{errors.provincie_id}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="product">Producto *</label>
                      <select
                        id="product"
                        name="product"
                        value={formData.product}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="">Seleccionar producto</option>
                        {getProductos().map(p => (
                          <option key={p.id} value={p.id}>
                            {p.value}
                          </option>
                        ))}
                      </select>
                      {errors.product && <span className="error-text">{errors.product}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="guarantee">Garantía *</label>
                      <select
                        id="guarantee"
                        name="guarantee"
                        value={formData.guarantee}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="">Seleccionar garantía</option>
                        {getGarantias().map(g => (
                          <option key={g.id} value={g.id}>
                            {g.value}
                          </option>
                        ))}
                      </select>
                      {errors.guarantee && <span className="error-text">{errors.guarantee}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="demand_date">Fecha de Demanda *</label>
                      <input
                        type="date"
                        id="demand_date"
                        name="demand_date"
                        value={formData.demand_date}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      {errors.demand_date && <span className="error-text">{errors.demand_date}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="status">Estado</label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="suspendido">Suspendido</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Guardando...' : editingId ? 'Actualizar Caso' : 'Crear Caso'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={resetForm} disabled={loading}>
                    Cancelar
                  </button>
                </div>
              </form>
              </div>
            </div>
          </div>
        )}

      <div className="cases-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por número de caso o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-status">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="todos">Todos los Estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="suspendido">Suspendido</option>
          </select>
        </div>

          <div className="filter-nuevo">
            {!isCreating && (
              <button className="btn-primary" onClick={() => setIsCreating(true)}>
                ➕ Nuevo Caso
              </button>
            )}
          </div>

      </div>

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

      {loading && (
        <div className="loading-overlay" style={{
          padding: '20px',
          textAlign: 'center',
          color: '#666'
        }}>
          <p>Cargando...</p>
        </div>
      )}

      <div className="cases-list">
        {filteredCases.length === 0 ? (
          <div className="empty-state">
            <p>No hay casos que coincidan con tu búsqueda</p>
          </div>
        ) : (
          <table className="cases-table">
            <thead>
              <tr>
                <th>Número de Caso</th>
                <th>Cliente</th>
                <th>Identificación</th>
                <th>Acreedor</th>
                <th>Abogado Interno</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCases.map((caseItem) => (
                <tr key={caseItem.id}>
                  <td className="case-number">{caseItem.case_number}</td>
                  <td>{caseItem.full_name}</td>
                  <td>{caseItem.identification}</td>
                  <td>
                    {creditors.find(c => c.id === caseItem.creditor_id)?.name || 'N/A'}
                  </td>
                  <td>
                    {lawyers.find(l => l.id === caseItem.internal_lawyer_id)?.first_name} {lawyers.find(l => l.id === caseItem.internal_lawyer_id)?.last_name}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(caseItem.status)}`}>
                      {getStatusLabel(caseItem.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon" 
                        title="Ver detalles"
                        onClick={() => navigate(`/cases/${caseItem.id}`)}
                      >
                        👁️
                      </button>
                      <button 
                        className="btn-icon" 
                        title="Editar"
                        onClick={() => handleEdit(caseItem)}
                        disabled={loading}
                      >
                        ✏️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Controles de paginación */}
        {filteredCases.length > 0 && totalPages > 1 && (
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
              Página {currentPage} de {totalPages} ({filteredCases.length} registros)
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
</div>
  );
};

export default Cases;
