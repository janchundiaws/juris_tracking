import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';
import '../styles/Calendar.css';

const Calendar = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 30)); // 30 de enero de 2026
  const [events, setEvents] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    eventType: 'audiencia',
    caseId: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Datos de ejemplo
    const mockEvents = [
      {
        id: 1,
        title: 'Audiencia - Caso CASO-2026-001',
        description: 'Audiencia de primera instancia',
        eventDate: '2026-02-15',
        startTime: '09:00',
        endTime: '10:30',
        eventType: 'audiencia',
        caseId: 'CASO-2026-001'
      },
      {
        id: 2,
        title: 'Presentación de documentos',
        description: 'Entrega de pruebas para CASO-2026-002',
        eventDate: '2026-02-10',
        startTime: '14:00',
        endTime: '15:00',
        eventType: 'documento',
        caseId: 'CASO-2026-002'
      },
      {
        id: 3,
        title: 'Audiencia de apelación',
        description: 'Revisión de sentencia',
        eventDate: '2026-02-20',
        startTime: '11:00',
        endTime: '12:30',
        eventType: 'audiencia',
        caseId: 'CASO-2026-003'
      }
    ];
    setEvents(mockEvents);
  }, []);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 0, 30));
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
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }
    
    if (!formData.eventDate) {
      newErrors.eventDate = 'La fecha es requerida';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'La hora de inicio es requerida';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'La hora de fin es requerida';
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'La hora de fin debe ser posterior a la de inicio';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    if (editingId) {
      setEvents(events.map(e => 
        e.id === editingId 
          ? { ...e, ...formData }
          : e
      ));
      setEditingId(null);
    } else {
      const newEvent = {
        id: Math.max(...events.map(e => e.id), 0) + 1,
        ...formData
      };
      setEvents([...events, newEvent]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      eventDate: '',
      startTime: '',
      endTime: '',
      eventType: 'audiencia',
      caseId: ''
    });
    setErrors({});
    setIsCreating(false);
    setEditingId(null);
  };

  const handleEdit = (event) => {
    setFormData(event);
    setEditingId(event.id);
    setIsCreating(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  const getEventsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(e => e.eventDate === dateString);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Días vacíos del mes anterior
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateEvents = getEventsForDate(date);
      const isToday = date.toDateString() === new Date(2026, 0, 30).toDateString();

      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isToday ? 'today' : ''} ${dateEvents.length > 0 ? 'has-events' : ''}`}
        >
          <div className="day-number">{day}</div>
          <div className="day-events">
            {dateEvents.slice(0, 2).map(event => (
              <div key={event.id} className={`event-dot type-${event.eventType}`} title={event.title}></div>
            ))}
            {dateEvents.length > 2 && <div className="event-more">+{dateEvents.length - 2}</div>}
          </div>
        </div>
      );
    }

    return days;
  };

  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const upcomingEvents = events
    .filter(e => new Date(e.eventDate) >= new Date(2026, 0, 30))
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
    .slice(0, 5);

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header 
          title="Calendario" 
          userName={user?.first_name}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="calendar-container">
          <div className="calendar-wrapper">
            <div className="calendar-section">
              {/* Mini Calendario */}
              <div className="mini-calendar">
                <div className="calendar-header">
                  <button onClick={handlePrevMonth}>◀</button>
                  <h2>{monthName}</h2>
                  <button onClick={handleNextMonth}>▶</button>
                </div>

                <div className="calendar-weekdays">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="weekday">{day}</div>
                  ))}
                </div>

                <div className="calendar-grid">
                  {renderCalendarDays()}
                </div>

                <button className="btn-today" onClick={handleToday}>Hoy</button>
              </div>

              {/* Próximos Eventos */}
              <div className="upcoming-events">
                <h3>Próximos Eventos</h3>
                {upcomingEvents.length === 0 ? (
                  <p className="no-events">No hay eventos próximos</p>
                ) : (
                  <div className="events-list">
                    {upcomingEvents.map(event => (
                      <div key={event.id} className={`event-item type-${event.eventType}`}>
                        <div className="event-date">
                          {new Date(event.eventDate).toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </div>
                        <div className="event-details">
                          <div className="event-title">{event.title}</div>
                          <div className="event-time">{event.startTime} - {event.endTime}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Formulario de Eventos */}
            <div className="events-section">
              <div className="section-header">
                <h2>Eventos</h2>
                {!isCreating && (
                  <button className="btn-primary" onClick={() => setIsCreating(true)}>
                    ➕ Nuevo Evento
                  </button>
                )}
              </div>

              {isCreating && (
                <div className="event-form-card">
                  <div className="form-card-header">
                    <h3>{editingId ? 'Editar Evento' : 'Crear Nuevo Evento'}</h3>
                    <button className="close-btn" onClick={resetForm}>✕</button>
                  </div>

                  <form onSubmit={handleSubmit} className="event-form">
                    {errors.general && (
                      <div className="error-message">{errors.general}</div>
                    )}

                    <div className="form-group">
                      <label htmlFor="title">Título del Evento *</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Audiencia..."
                      />
                      {errors.title && <span className="error-text">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="description">Descripción</label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Detalles del evento..."
                        rows="3"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="eventDate">Fecha *</label>
                        <input
                          type="date"
                          id="eventDate"
                          name="eventDate"
                          value={formData.eventDate}
                          onChange={handleChange}
                        />
                        {errors.eventDate && <span className="error-text">{errors.eventDate}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="eventType">Tipo de Evento</label>
                        <select
                          id="eventType"
                          name="eventType"
                          value={formData.eventType}
                          onChange={handleChange}
                        >
                          <option value="audiencia">Audiencia</option>
                          <option value="documento">Documento</option>
                          <option value="reunion">Reunión</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="startTime">Hora de Inicio *</label>
                        <input
                          type="time"
                          id="startTime"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleChange}
                        />
                        {errors.startTime && <span className="error-text">{errors.startTime}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="endTime">Hora de Fin *</label>
                        <input
                          type="time"
                          id="endTime"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleChange}
                        />
                        {errors.endTime && <span className="error-text">{errors.endTime}</span>}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="caseId">ID del Caso (Opcional)</label>
                      <input
                        type="text"
                        id="caseId"
                        name="caseId"
                        value={formData.caseId}
                        onChange={handleChange}
                        placeholder="CASO-2026-001"
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn-primary">
                        {editingId ? 'Actualizar Evento' : 'Crear Evento'}
                      </button>
                      <button type="button" className="btn-secondary" onClick={resetForm}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="events-grid">
                {events.length === 0 ? (
                  <div className="empty-state">
                    <p>No hay eventos registrados</p>
                  </div>
                ) : (
                  <div className="events-list-detail">
                    {events
                      .sort((a, b) => new Date(`${a.eventDate}T${a.startTime}`) - new Date(`${b.eventDate}T${b.startTime}`))
                      .map(event => (
                        <div key={event.id} className={`event-card type-${event.eventType}`}>
                          <div className="event-card-header">
                            <h4>{event.title}</h4>
                            <div className="event-actions">
                              <button 
                                className="btn-icon"
                                onClick={() => handleEdit(event)}
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button 
                                className="btn-icon btn-delete"
                                onClick={() => handleDelete(event.id)}
                                title="Eliminar"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          <div className="event-card-body">
                            <div className="event-info">
                              <span className="label">Fecha:</span>
                              <span>{new Date(event.eventDate).toLocaleDateString('es-ES')}</span>
                            </div>
                            <div className="event-info">
                              <span className="label">Hora:</span>
                              <span>{event.startTime} - {event.endTime}</span>
                            </div>
                            <div className="event-info">
                              <span className="label">Tipo:</span>
                              <span className={`type-badge type-${event.eventType}`}>
                                {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                              </span>
                            </div>
                            {event.description && (
                              <div className="event-info">
                                <span className="label">Descripción:</span>
                                <span className="description">{event.description}</span>
                              </div>
                            )}
                            {event.caseId && (
                              <div className="event-info">
                                <span className="label">Caso:</span>
                                <span>{event.caseId}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
