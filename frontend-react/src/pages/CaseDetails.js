import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { casesService, lawyersService, creditorsService, provinciesService, maestroService, documentsService, activitiesService } from '../services/api';
import '../styles/Dashboard.css';
import '../styles/CaseDetails.css';

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [caseData, setCaseData] = useState(null);
  const [lawyers, setLawyers] = useState([]);
  const [creditors, setCreditors] = useState([]);
  const [provincies, setProvincies] = useState([]);
  const [maestro, setMaestro] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [showDeleteActivityModal, setShowDeleteActivityModal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [activityForm, setActivityForm] = useState({
    activity_type: 'audiencia',
    probable_activity_date: '',
    completed_date: '',
    priority: 'media',
    assigned_to: '',
    notes: ''
  });
  const [creatingActivity, setCreatingActivity] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchCaseDetails();
    fetchRelatedData();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'documents' && id) {
      fetchDocuments();
    } else if (activeTab === 'activities' && id) {
      fetchActivities();
    }
  }, [activeTab, id]);

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      const data = await casesService.getById(id);
      setCaseData(data);
    } catch (err) {
      console.error('Error al cargar el caso:', err);
      setError('Error al cargar el caso');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    try {
      const [lawyersData, creditorsData, provinciesData, maestroData] = await Promise.all([
        lawyersService.getAll(),
        creditorsService.getAll(),
        provinciesService.getAll(),
        maestroService.getAll()
      ]);
      
      setLawyers(lawyersData || []);
      setCreditors(creditorsData || []);
      setProvincies(provinciesData || []);
      setMaestro(maestroData || []);
    } catch (err) {
      console.error('Error al cargar datos relacionados:', err);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const docs = await documentsService.getByProcessId(id);
      setDocuments(docs || []);
    } catch (err) {
      console.error('Error al cargar documentos:', err);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleUploadDocument = async () => {
    if (!uploadFile) {
      alert('Por favor selecciona un archivo');
      return;
    }

    try {
      setUploadingFile(true);
      
      // Convertir archivo a base64
      const reader = new FileReader();
      reader.readAsDataURL(uploadFile);
      
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1];
        
        const documentData = {
          judicial_process_id: id,
          file_name: uploadFile.name,
          file_type: uploadFile.type,
          file_size: uploadFile.size,
          file_data: base64,
          description: uploadDescription
        };

        await documentsService.upload(documentData);
        
        // Cerrar modal y limpiar
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadDescription('');
        
        // Recargar documentos
        await fetchDocuments();
      };

      reader.onerror = () => {
        alert('Error al leer el archivo');
        setUploadingFile(false);
      };
    } catch (err) {
      console.error('Error al subir documento:', err);
      alert('Error al subir el documento');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      const blob = await documentsService.download(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error al descargar documento:', err);
      alert('Error al descargar el documento');
    }
  };

  const handleDeleteDocument = async (docId) => {
    setDocumentToDelete(docId);
    setShowDeleteModal(true);
  };

  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      await documentsService.delete(documentToDelete);
      setShowDeleteModal(false);
      setDocumentToDelete(null);
      await fetchDocuments();
    } catch (err) {
      console.error('Error al eliminar documento:', err);
      alert('Error al eliminar el documento');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      const acts = await activitiesService.getByProcessId(id);
      setActivities(acts || []);
    } catch (err) {
      console.error('Error al cargar actividades:', err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleActivityFormChange = (field, value) => {
    setActivityForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOpenActivityModal = () => {
    setEditingActivity(null);
    setActivityForm({
      activity_type: 'audiencia',
      probable_activity_date: '',
      completed_date: '',
      priority: 'media',
      assigned_to: '',
      notes: ''
    });
    setShowActivityModal(true);
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setActivityForm({
      activity_type: activity.activity_type,
      probable_activity_date: activity.probable_activity_date ? activity.probable_activity_date.slice(0, 16) : '',
      completed_date: activity.completed_date ? activity.completed_date.slice(0, 16) : '',
      priority: activity.priority,
      assigned_to: activity.assigned_to || '',
      notes: activity.notes || ''
    });
    setShowActivityModal(true);
  };

  const handleSaveActivity = async () => {
    try {
      setCreatingActivity(true);
      
      const activityData = {
        activity_type: activityForm.activity_type,
        probable_activity_date: activityForm.probable_activity_date || null,
        completed_date: activityForm.completed_date || null,
        priority: activityForm.priority,
        assigned_to: activityForm.assigned_to || null,
        notes: activityForm.notes || ''
      };

      if (editingActivity) {
        // Actualizar actividad existente
        await activitiesService.update(editingActivity.id, activityData);
      } else {
        // Crear nueva actividad
        activityData.judicial_process_id = id;
        await activitiesService.create(activityData);
      }
      
      // Resetear formulario
      setActivityForm({
        activity_type: 'audiencia',
        probable_activity_date: '',
        completed_date: '',
        priority: 'media',
        assigned_to: '',
        notes: ''
      });
      setEditingActivity(null);
      setShowActivityModal(false);
      await fetchActivities();
    } catch (err) {
      console.error('Error al guardar actividad:', err);
      alert(editingActivity ? 'Error al actualizar la actividad' : 'Error al crear la actividad');
    } finally {
      setCreatingActivity(false);
    }
  };

  const handleDeleteActivity = (activity) => {
    setActivityToDelete(activity);
    setShowDeleteActivityModal(true);
  };

  const confirmDeleteActivity = async () => {
    if (!activityToDelete) return;

    try {
      await activitiesService.delete(activityToDelete.id);
      setShowDeleteActivityModal(false);
      setActivityToDelete(null);
      await fetchActivities();
    } catch (err) {
      console.error('Error al eliminar actividad:', err);
      alert('Error al eliminar la actividad');
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'baja': '#10b981',
      'media': '#f59e0b',
      'alta': '#ef4444',
      'urgente': '#dc2626'
    };
    return colors[priority] || '#6b7280';
  };

  const getActivityTypeLabel = (type) => {
    const labels = {
      'audiencia': '⚖️ Audiencia',
      'diligencia': '📋 Diligencia',
      'presentacion': '📄 Presentación',
      'notificacion': '🔔 Notificación',
      'reunion': '👥 Reunión',
      'otro': '📌 Otro'
    };
    return labels[type] || type;
  };

  const getLawyer = (id) => {
    const lawyer = lawyers.find(l => l.id === id);
    return lawyer ? `${lawyer.first_name} ${lawyer.last_name}` : 'N/A';
  };

  const getCreditor = (id) => {
    const creditor = creditors.find(c => c.id === id);
    return creditor ? creditor.name : 'N/A';
  };

  const getProvince = (id) => {
    const province = provincies.find(p => p.id === id);
    return province ? province.name : 'N/A';
  };

  const getMaestroValue = (id) => {
    const item = maestro.find(m => m.id === id);
    return item ? item.value : 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      'activo': 'Activo',
      'inactivo': 'Inactivo',
      'suspendido': 'Suspendido',
      'cerrado': 'Cerrado'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'activo':
        return 'status-active';
      case 'inactivo':
        return 'status-inactive';
      case 'suspendido':
        return 'status-suspended';
      case 'cerrado':
        return 'status-closed';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main-content">
          <Header 
            title="Detalles del Caso" 
            userName={user?.first_name}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="dashboard-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main-content">
          <Header 
            title="Detalles del Caso" 
            userName={user?.first_name}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: '#ff4444' }}>{error || 'Caso no encontrado'}</p>
            <button 
              onClick={() => navigate('/cases')}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Volver a Casos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header 
          title="Detalles del Caso" 
          userName={user?.first_name}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className="case-details-container">
          {/* Header del Caso */}
          <div className="case-details-header">
            <div className="case-header-content">
              <button 
                className="btn-back"
                onClick={() => navigate('/cases')}
              >
                ← Volver
              </button>
              <div className="case-title-section">
                <h1>{caseData.case_number}</h1>
                <span className={`status-badge ${getStatusClass(caseData.status)}`}>
                  {getStatusLabel(caseData.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="case-tabs">
            <button 
              className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              Información General
            </button>
            <button 
              className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              Documentos Adjuntos
            </button>
            <button 
              className={`tab-button ${activeTab === 'activities' ? 'active' : ''}`}
              onClick={() => setActiveTab('activities')}
            >
              Actividades
            </button>
            <button 
              className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              Línea de Tiempo
            </button>
          </div>

          {/* Contenido de las Tabs */}
          <div className="case-content">
            {activeTab === 'general' && (
              <div className="tab-content">
                {/* Hero Section - Información Principal */}
                <div className="hero-info">
                  <div className="hero-main">
                    <div className="hero-badge">
                      <span className="badge-icon">⚖️</span>
                      <div className="badge-content">
                        <span className="badge-label">Número de Caso</span>
                        <span className="badge-number">{caseData.case_number}</span>
                      </div>
                    </div>
                    <div className="hero-details">
                      <div className="hero-item">
                        <span className="hero-icon">👤</span>
                        <div>
                          <div className="hero-label">Demandado</div>
                          <div className="hero-value">{caseData.full_name}</div>
                        </div>
                      </div>
                      <div className="hero-item">
                        <span className="hero-icon">🆔</span>
                        <div>
                          <div className="hero-label">Identificación</div>
                          <div className="hero-value">{caseData.identification}</div>
                        </div>
                      </div>
                      <div className="hero-item">
                        <span className="hero-icon">📅</span>
                        <div>
                          <div className="hero-label">Fecha de Demanda</div>
                          <div className="hero-value">{formatDate(caseData.demand_date)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid de 2 columnas */}
                <div className="info-layout">
                  <div className="info-column">
                    {/* Información del Proceso */}
                    <div className="info-block">
                      <div className="block-title">
                        <span className="title-icon">⚖️</span>
                        <h3>Información del Proceso</h3>
                      </div>
                      <div className="block-content">
                        <div className="info-field">
                          <label>Tipo de Proceso</label>
                          <p>{getMaestroValue(caseData.process_type)}</p>
                        </div>
                        <div className="info-field">
                          <label>Operación</label>
                          <p>{caseData.operation || 'N/A'}</p>
                        </div>
                        <div className="info-field">
                          <label>Producto</label>
                          <p>{getMaestroValue(caseData.product)}</p>
                        </div>
                        <div className="info-field">
                          <label>Garantía</label>
                          <p>{getMaestroValue(caseData.guarantee)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Información Territorial */}
                    <div className="info-block">
                      <div className="block-title">
                        <span className="title-icon">📍</span>
                        <h3>Información Territorial</h3>
                      </div>
                      <div className="block-content">
                        <div className="info-field">
                          <label>Provincia</label>
                          <p>{getProvince(caseData.provincie_id)}</p>
                        </div>
                        <div className="info-field">
                          <label>Acreedor</label>
                          <p>{getCreditor(caseData.creditor_id)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Resumen Procesal */}
                    <div className="info-block">
                      <div className="block-title">
                        <span className="title-icon">📝</span>
                        <h3>Resumen de lo Actuado</h3>
                      </div>
                      <div className="block-content">
                        <div className="text-box">
                          {caseData.procedural_summary || 'No hay resumen disponible'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="info-column">
                    {/* Asignaciones de Abogados */}
                    <div className="info-block">
                      <div className="block-title">
                        <span className="title-icon">👥</span>
                        <h3>Asignaciones de Abogados</h3>
                      </div>
                      <div className="block-content">
                        <div className="lawyer-card">
                          <div className="lawyer-type">Abogado Interno</div>
                          <div className="lawyer-name">{getLawyer(caseData.internal_lawyer_id)}</div>
                          <div className="lawyer-date">
                            Asignado: {formatDate(caseData.internal_assignment_date)}
                          </div>
                        </div>
                        {caseData.external_lawyer_id && (
                          <div className="lawyer-card external">
                            <div className="lawyer-type">Abogado Externo</div>
                            <div className="lawyer-name">{getLawyer(caseData.external_lawyer_id)}</div>
                            <div className="lawyer-date">
                              Asignado: {formatDate(caseData.external_assignment_date)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fechas Importantes */}
                    <div className="info-block">
                      <div className="block-title">
                        <span className="title-icon">📆</span>
                        <h3>Fechas Importantes</h3>
                      </div>
                      <div className="block-content">
                        <div className="date-item">
                          <div className="date-label">Asignación de Área</div>
                          <div className="date-value">{formatDate(caseData.area_assignment_date)}</div>
                        </div>
                        <div className="date-item">
                          <div className="date-label">Asignación Interna</div>
                          <div className="date-value">{formatDate(caseData.internal_assignment_date)}</div>
                        </div>
                        <div className="date-item">
                          <div className="date-label">Asignación Externa</div>
                          <div className="date-value">{formatDate(caseData.external_assignment_date)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Avance Procesal */}
                    <div className="info-block">
                      <div className="block-title">
                        <span className="title-icon">📊</span>
                        <h3>Avance Procesal</h3>
                      </div>
                      <div className="block-content">
                        <div className="text-box">
                          {caseData.procedural_progress || 'No hay avance registrado'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="tab-content">
                <div className="documents-section">
                  <div className="section-header">
                    <h3 className="section-title">Documentos Adjuntos</h3>
                    <button className="btn-upload-doc" onClick={() => setShowUploadModal(true)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <span>Subir Documento</span>
                    </button>
                  </div>
                  
                  {loadingDocuments ? (
                    <div className="empty-state">
                      <p>⏳ Cargando documentos...</p>
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="empty-state">
                      <p>📄 No hay documentos adjuntos</p>
                      <p style={{ fontSize: '14px', color: '#999' }}>Los documentos subidos aparecerán aquí</p>
                    </div>
                  ) : (
                    <div className="documents-grid">
                      {documents.map(doc => (
                        <div key={doc.id} className="document-card">
                          <div className="document-icon">
                            📄
                          </div>
                          <div className="document-info">
                            <h4>{doc.file_name}</h4>
                            <p className="document-meta">
                              {formatFileSize(doc.file_size)} • {formatDate(doc.created_at)}
                            </p>
                            {doc.description && (
                              <p className="document-description">{doc.description}</p>
                            )}
                          </div>
                          <div className="document-actions">
                            <button 
                              className="btn-icon" 
                              onClick={() => handleDownloadDocument(doc)}
                              title="Descargar"
                            >
                              ⬇️
                            </button>
                            <button 
                              className="btn-icon btn-delete" 
                              onClick={() => handleDeleteDocument(doc.id)}
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modal de Subir Documento */}
                {showUploadModal && (
                  <div className="modal-overlay" onClick={() => !uploadingFile && setShowUploadModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                      <div className="modal-header">
                        <h2>Subir Documento</h2>
                        <button 
                          className="modal-close"
                          onClick={() => setShowUploadModal(false)}
                          disabled={uploadingFile}
                        >
                          ✕
                        </button>
                      </div>
                      <div className="modal-body">
                        <div className="form-group">
                          <label>Archivo</label>
                          <input
                            type="file"
                            onChange={handleFileSelect}
                            disabled={uploadingFile}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                          {uploadFile && (
                            <p className="file-selected">📎 {uploadFile.name} ({formatFileSize(uploadFile.size)})</p>
                          )}
                        </div>
                        <div className="form-group">
                          <label>Descripción (opcional)</label>
                          <textarea
                            value={uploadDescription}
                            onChange={(e) => setUploadDescription(e.target.value)}
                            placeholder="Describe el documento..."
                            rows="3"
                            disabled={uploadingFile}
                          />
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button 
                          className="btn-secondary"
                          onClick={() => setShowUploadModal(false)}
                          disabled={uploadingFile}
                        >
                          Cancelar
                        </button>
                        <button 
                          className="btn-primary"
                          onClick={handleUploadDocument}
                          disabled={!uploadFile || uploadingFile}
                        >
                          {uploadingFile ? 'Subiendo...' : 'Subir Documento'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal de Confirmación de Eliminación */}
                {showDeleteModal && (
                  <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
                      <div className="modal-header">
                        <div className="delete-icon">⚠️</div>
                        <h2>Eliminar Documento</h2>
                      </div>
                      <div className="modal-body">
                        <p className="delete-warning">
                          ¿Estás seguro de que deseas eliminar este documento?
                        </p>
                        <p className="delete-description">
                          Esta acción no se puede deshacer. El documento será marcado como eliminado.
                        </p>
                      </div>
                      <div className="modal-footer">
                        <button 
                          className="btn-secondary"
                          onClick={() => setShowDeleteModal(false)}
                        >
                          Cancelar
                        </button>
                        <button 
                          className="btn-danger"
                          onClick={confirmDeleteDocument}
                        >
                          Eliminar Documento
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="tab-content">
                <div className="activities-section">
                  <div className="section-header">
                    <h3 className="section-title">Actividades</h3>
                    <button 
                      className="btn-upload-doc"
                      onClick={handleOpenActivityModal}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14"></path>
                      </svg>
                      <span>Nueva Actividad</span>
                    </button>
                  </div>
                  
                  {loadingActivities ? (
                    <div className="loading-state">
                      <p>Cargando actividades...</p>
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="empty-state">
                      <p>📋 No hay actividades registradas</p>
                      <p style={{ fontSize: '14px', color: '#999' }}>Las actividades y tareas aparecerán aquí</p>
                    </div>
                  ) : (
                    <div className="activities-list">
                      {activities.map(activity => (
                        <div key={activity.id} className="activity-card">
                          <div className="activity-header">
                            <div className="activity-type">
                              {getActivityTypeLabel(activity.activity_type)}
                            </div>
                            <div className="activity-actions">
                              <span 
                                className="priority-badge" 
                                style={{ backgroundColor: getPriorityColor(activity.priority) }}
                              >
                                {activity.priority}
                              </span>
                              <button
                                className="btn-edit-activity"
                                onClick={() => handleEditActivity(activity)}
                                title="Editar actividad"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn-delete-activity"
                                onClick={() => handleDeleteActivity(activity)}
                                title="Eliminar actividad"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          
                          <div className="activity-details">
                            {activity.probable_activity_date && (
                              <div className="activity-date">
                                <strong>📅 Fecha probable:</strong> {formatDateTime(activity.probable_activity_date)}
                              </div>
                            )}
                            
                            {activity.completed_date && (
                              <div className="activity-date completed">
                                <strong>✅ Completada:</strong> {formatDateTime(activity.completed_date)}
                              </div>
                            )}
                            
                            {activity.assigned_lawyer && (
                              <div className="activity-assignee">
                                <strong>👤 Asignado a:</strong> {activity.assigned_lawyer.first_name} {activity.assigned_lawyer.last_name}
                              </div>
                            )}
                            
                            {activity.notes && (
                              <div className="activity-notes">
                                <strong>📝 Notas:</strong>
                                <p>{activity.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="tab-content">
                <div className="timeline-section">
                  <h3 className="section-title">Línea de Tiempo</h3>
                  <div className="timeline">
                    <div className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="timeline-date">{formatDate(caseData.created_at)}</div>
                        <div className="timeline-title">Caso Creado</div>
                        <div className="timeline-description">El caso fue registrado en el sistema</div>
                      </div>
                    </div>
                    {caseData.area_assignment_date && (
                      <div className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-date">{formatDate(caseData.area_assignment_date)}</div>
                          <div className="timeline-title">Asignación de Área</div>
                          <div className="timeline-description">El caso fue asignado al área legal</div>
                        </div>
                      </div>
                    )}
                    {caseData.internal_assignment_date && (
                      <div className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-date">{formatDate(caseData.internal_assignment_date)}</div>
                          <div className="timeline-title">Asignación Interna</div>
                          <div className="timeline-description">Asignado a: {getLawyer(caseData.internal_lawyer_id)}</div>
                        </div>
                      </div>
                    )}
                    {caseData.external_assignment_date && (
                      <div className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-date">{formatDate(caseData.external_assignment_date)}</div>
                          <div className="timeline-title">Asignación Externa</div>
                          <div className="timeline-description">Asignado a: {getLawyer(caseData.external_lawyer_id)}</div>
                        </div>
                      </div>
                    )}
                    {caseData.demand_date && (
                      <div className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-date">{formatDate(caseData.demand_date)}</div>
                          <div className="timeline-title">Demanda Presentada</div>
                          <div className="timeline-description">Se presentó la demanda formal</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Nueva Actividad */}
        {showActivityModal && (
          <div className="modal-overlay" onClick={() => setShowActivityModal(false)}>
            <div className="modal-content activity-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowActivityModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Tipo de Actividad *</label>
                    <select
                      value={activityForm.activity_type}
                      onChange={(e) => handleActivityFormChange('activity_type', e.target.value)}
                      disabled={creatingActivity}
                    >
                      <option value="audiencia">⚖️ Audiencia</option>
                      <option value="diligencia">📋 Diligencia</option>
                      <option value="presentacion">📄 Presentación</option>
                      <option value="notificacion">🔔 Notificación</option>
                      <option value="reunion">👥 Reunión</option>
                      <option value="otro">📌 Otro</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Prioridad</label>
                    <select
                      value={activityForm.priority}
                      onChange={(e) => handleActivityFormChange('priority', e.target.value)}
                      disabled={creatingActivity}
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Fecha Probable</label>
                    <input
                      type="datetime-local"
                      value={activityForm.probable_activity_date}
                      onChange={(e) => handleActivityFormChange('probable_activity_date', e.target.value)}
                      disabled={creatingActivity}
                    />
                  </div>

                  <div className="form-group">
                    <label>Fecha de Completado</label>
                    <input
                      type="datetime-local"
                      value={activityForm.completed_date}
                      onChange={(e) => handleActivityFormChange('completed_date', e.target.value)}
                      disabled={creatingActivity}
                    />
                  </div>

                  <div className="form-group">
                    <label>Asignar a</label>
                    <select
                      value={activityForm.assigned_to}
                      onChange={(e) => handleActivityFormChange('assigned_to', e.target.value)}
                      disabled={creatingActivity}
                    >
                      <option value="">Sin asignar</option>
                      {lawyers.map(lawyer => (
                        <option key={lawyer.id} value={lawyer.id}>
                          {lawyer.first_name} {lawyer.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Notas</label>
                    <textarea
                      value={activityForm.notes}
                      onChange={(e) => handleActivityFormChange('notes', e.target.value)}
                      placeholder="Agrega notas o comentarios sobre esta actividad..."
                      rows="4"
                      disabled={creatingActivity}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowActivityModal(false)}
                  disabled={creatingActivity}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleSaveActivity}
                  disabled={creatingActivity}
                >
                  {creatingActivity ? (editingActivity ? 'Actualizando...' : 'Creando...') : (editingActivity ? 'Actualizar Actividad' : 'Crear Actividad')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmación de Eliminación de Actividad */}
        {showDeleteActivityModal && (
          <div className="modal-overlay" onClick={() => setShowDeleteActivityModal(false)}>
            <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="delete-icon">⚠️</div>
                <h2>Eliminar Actividad</h2>
              </div>
              <div className="modal-body">
                <p className="delete-warning">
                  ¿Estás seguro de que deseas eliminar esta actividad?
                </p>
                {activityToDelete && (
                  <div className="delete-details">
                    <p><strong>Tipo:</strong> {getActivityTypeLabel(activityToDelete.activity_type)}</p>
                    {activityToDelete.probable_activity_date && (
                      <p><strong>Fecha:</strong> {formatDateTime(activityToDelete.probable_activity_date)}</p>
                    )}
                  </div>
                )}
                <p className="delete-description">
                  Esta acción no se puede deshacer. La actividad será eliminada permanentemente.
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowDeleteActivityModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-danger"
                  onClick={confirmDeleteActivity}
                >
                  Eliminar Actividad
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseDetails;
