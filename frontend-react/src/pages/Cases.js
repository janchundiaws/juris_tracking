import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';
import '../styles/Cases.css';

const Cases = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cases, setCases] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [formData, setFormData] = useState({
    caseNumber: '',
    clientName: '',
    caseType: 'Civil',
    status: 'Pendiente',
    priority: 'Media',
    nextHearing: '',
    description: ''
  });

  useEffect(() => {
    // Aquí iría la petición para obtener casos del backend
    const mockCases = [
      {
        id: 1,
        caseNumber: 'CASO-2026-001',
        clientName: 'María González',
        caseType: 'Laboral',
        status: 'En Proceso',
        priority: 'Alta',
        nextHearing: '2026-02-15',
        description: 'Caso de despido injustificado'
      },
      {
        id: 2,
        caseNumber: 'CASO-2026-002',
        clientName: 'Pedro Martínez',
        caseType: 'Civil',
        status: 'Pendiente',
        priority: 'Media',
        nextHearing: '2026-02-20',
        description: 'Demanda por daños y perjuicios'
      },
      {
        id: 3,
        caseNumber: 'CASO-2026-003',
        clientName: 'Ana López',
        caseType: 'Familia',
        status: 'En Proceso',
        priority: 'Baja',
        nextHearing: '2026-02-25',
        description: 'Custodia de menores'
      }
    ];
    setCases(mockCases);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      // Actualizar caso existente
      setCases(cases.map(c => 
        c.id === editingId 
          ? { ...c, ...formData }
          : c
      ));
      setEditingId(null);
    } else {
      // Crear nuevo caso
      const newCase = {
        id: Math.max(...cases.map(c => c.id), 0) + 1,
        ...formData
      };
      setCases([...cases, newCase]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      caseNumber: '',
      clientName: '',
      caseType: 'Civil',
      status: 'Pendiente',
      priority: 'Media',
      nextHearing: '',
      description: ''
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleEdit = (caseItem) => {
    setFormData(caseItem);
    setEditingId(caseItem.id);
    setIsCreating(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este caso?')) {
      setCases(cases.filter(c => c.id !== id));
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'todos' || c.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'En Proceso':
        return 'status-active';
      case 'Pendiente':
        return 'status-pending';
      case 'Cerrado':
        return 'status-closed';
      default:
        return '';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Alta':
        return 'priority-high';
      case 'Media':
        return 'priority-medium';
      case 'Baja':
        return 'priority-low';
      default:
        return '';
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} />
      <div className="main-content">
        <Header 
          title="Gestión de Casos" 
          userName={user?.first_name}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="cases-container">
          <div className="cases-actions">
            {!isCreating && (
              <button className="btn-primary" onClick={() => setIsCreating(true)}>
                ➕ Nuevo Caso
              </button>
            )}
          </div>

      {isCreating && (
        <div className="cases-form-card">
          <div className="form-card-header">
            <h2>{editingId ? 'Editar Caso' : 'Crear Nuevo Caso'}</h2>
            <button className="close-btn" onClick={resetForm}>✕</button>
          </div>

          <form onSubmit={handleSubmit} className="cases-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="caseNumber">Número de Caso</label>
                <input
                  type="text"
                  id="caseNumber"
                  name="caseNumber"
                  value={formData.caseNumber}
                  onChange={handleChange}
                  placeholder="CASO-2026-001"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="clientName">Nombre del Cliente</label>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="caseType">Tipo de Caso</label>
                <select
                  id="caseType"
                  name="caseType"
                  value={formData.caseType}
                  onChange={handleChange}
                >
                  <option value="Civil">Civil</option>
                  <option value="Laboral">Laboral</option>
                  <option value="Familia">Familia</option>
                  <option value="Penal">Penal</option>
                  <option value="Mercantil">Mercantil</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Estado</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Cerrado">Cerrado</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Prioridad</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nextHearing">Próxima Audiencia</label>
                <input
                  type="date"
                  id="nextHearing"
                  name="nextHearing"
                  value={formData.nextHearing}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detalles del caso..."
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? 'Actualizar Caso' : 'Crear Caso'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="cases-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por número de caso o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-status">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="todos">Todos los Estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Cerrado">Cerrado</option>
          </select>
        </div>
      </div>

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
                <th>Tipo</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Próxima Audiencia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((caseItem) => (
                <tr key={caseItem.id}>
                  <td className="case-number">{caseItem.caseNumber}</td>
                  <td>{caseItem.clientName}</td>
                  <td>
                    <span className="case-type-badge">{caseItem.caseType}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(caseItem.status)}`}>
                      {caseItem.status}
                    </span>
                  </td>
                  <td>
                    <span className={`priority-badge ${getPriorityClass(caseItem.priority)}`}>
                      {caseItem.priority}
                    </span>
                  </td>
                  <td>{new Date(caseItem.nextHearing).toLocaleDateString('es-ES')}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon" 
                        title="Ver detalles"
                        onClick={() => alert(`Detalles: ${caseItem.description}`)}
                      >
                        👁️
                      </button>
                      <button 
                        className="btn-icon" 
                        title="Editar"
                        onClick={() => handleEdit(caseItem)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon btn-delete" 
                        title="Eliminar"
                        onClick={() => handleDelete(caseItem.id)}
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
  </div>
</div>
  );
};

export default Cases;
