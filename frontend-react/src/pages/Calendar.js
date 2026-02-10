import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { eventsService } from '../services/api';
import '../styles/Dashboard.css';
import '../styles/Calendar.css';

const Calendar = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDateEvents, setShowDateEvents] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    event_date: '',
    location: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsService.getAll();
      setEvents(data);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      setErrors({ general: 'Error al cargar los eventos' });
    } finally {
      setLoading(false);
    }
  };

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
    setCurrentDate(new Date());
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowDateEvents(true);
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
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    
    if (!formData.event_date) {
      newErrors.event_date = 'La fecha y hora son requeridas';
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
      const eventData = {
        user_id: user.id,
        event_date: formData.event_date,
        description: formData.description,
        location: formData.location || null
      };

      if (editingId) {
        await eventsService.update(editingId, eventData);
      } else {
        await eventsService.create(eventData);
      }
      
      await loadEvents();
      resetForm();
    } catch (error) {
      console.error('Error al guardar evento:', error);
      setErrors({ general: error.response?.data?.error || 'Error al guardar el evento' });
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      event_date: '',
      location: ''
    });
    setErrors({});
    setIsCreating(false);
    setEditingId(null);
  };

  const handleEdit = (event) => {
    setFormData({
      description: event.description,
      event_date: event.event_date,
      location: event.location || ''
    });
    setEditingId(event.id);
    setIsCreating(true);
    setShowDateEvents(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      try {
        await eventsService.delete(id);
        await loadEvents();
        setShowDateEvents(false);
      } catch (error) {
        console.error('Error al eliminar evento:', error);
        alert('Error al eliminar el evento');
      }
    }
  };

  const getEventsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(e => {
      const eventDate = new Date(e.event_date).toISOString().split('T')[0];
      return eventDate === dateString;
    });
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
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isToday ? 'today' : ''} ${dateEvents.length > 0 ? 'has-events' : ''}`}
          onClick={() => handleDateClick(date)}
          style={{ cursor: 'pointer' }}
        >
          <div className="day-number">{day}</div>
          <div className="day-events">
            {dateEvents.slice(0, 2).map(event => (
              <div key={event.id} className="event-dot" title={event.description}></div>
            ))}
            {dateEvents.length > 2 && <div className="event-more">+{dateEvents.length - 2}</div>}
          </div>
        </div>
      );
    }

    return days;
  };

  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const today = new Date();
  const upcomingEvents = events
    .filter(e => new Date(e.event_date) >= today)
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
    .slice(0, 10);

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
                <button className="btn-primary" onClick={() => setIsCreating(true)}>
                  ➕ Nuevo Evento
                </button>
              </div>
            </div>

              {/* Próximos Eventos */}
              <div className="upcoming-events">
                <h3>Próximos 10 Eventos</h3>
                {loading ? (
                  <p className="no-events">Cargando eventos...</p>
                ) : upcomingEvents.length === 0 ? (
                  <p className="no-events">No hay eventos próximos</p>
                ) : (
                  <div className="events-list">
                    {upcomingEvents.map(event => (
                      <div key={event.id} className="event-item">
                        <div className="event-date">
                          {new Date(event.event_date).toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </div>
                        <div className="event-details">
                          <div className="event-title">{event.description}</div>
                          <div className="event-time">
                            {new Date(event.event_date).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          {event.location && (
                            <div className="event-location">📍 {event.location}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Modal de Crear/Editar Evento */}
          {isCreating && (
            <div className="modal-overlay" onClick={resetForm}>
              <div className="modal-content modal-form" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{editingId ? '✏️ Editar Evento' : 'Crear Nuevo Evento'}</h3>
                  <button className="close-btn" onClick={resetForm}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="event-form modal-form-body">
                  {errors.general && (
                    <div className="error-message">{errors.general}</div>
                  )}

                  <div className="form-group">
                    <label htmlFor="description">📝 Descripción del Evento *</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Ej: Reunión con el cliente, Audiencia judicial..."
                      rows="4"
                    />
                    {errors.description && <span className="error-text">{errors.description}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="event_date">📅 Fecha y Hora *</label>
                    <input
                      type="datetime-local"
                      id="event_date"
                      name="event_date"
                      value={formData.event_date}
                      onChange={handleChange}
                    />
                    {errors.event_date && <span className="error-text">{errors.event_date}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="location">📍 Lugar del Evento</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Ej: Sala de Audiencias #3, Oficina Principal..."
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
            </div>
          )}

          {/* Modal de Eventos por Fecha */}
          {showDateEvents && selectedDate && (
            <div className="modal-overlay" onClick={() => setShowDateEvents(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>
                    Eventos del {selectedDate.toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h3>
                  <button className="close-btn" onClick={() => setShowDateEvents(false)}>✕</button>
                </div>
                <div className="modal-body">
                  {getEventsForDate(selectedDate).length === 0 ? (
                    <p className="no-events">No hay eventos para esta fecha</p>
                  ) : (
                    <div className="date-events-list">
                      {getEventsForDate(selectedDate).map(event => (
                        <div key={event.id} className="event-card">
                          <div className="event-card-header">
                            <h4>{event.description}</h4>
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
                              <span className="label">Hora:</span>
                              <span>
                                {new Date(event.event_date).toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            {event.location && (
                              <div className="event-info">
                                <span className="label">Lugar:</span>
                                <span>{event.location}</span>
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
          )}
        </div>
      </div>
  );
};

export default Calendar;
