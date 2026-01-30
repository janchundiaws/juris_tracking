// Utilidad para formatear fechas
export const formatDate = (date, locale = 'es-ES') => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (date, locale = 'es-ES') => {
  if (!date) return '';
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Utilidad para formatear nombres
export const formatFullName = (firstName, lastName) => {
  return `${firstName || ''} ${lastName || ''}`.trim();
};

// Utilidad para validar email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Utilidad para capitalizar texto
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Utilidad para truncar texto
export const truncate = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Utilidad para obtener iniciales
export const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}`;
};

// Utilidad para generar colores basados en texto
export const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = Math.floor(Math.abs((Math.sin(hash) * 16777215) % 1) * 16777215);
  return '#' + color.toString(16).padStart(6, '0');
};

// Utilidad para debounce
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Utilidad para formatear números de teléfono
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

// Utilidad para validar número de teléfono
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

// Utilidad para obtener el estado del caso con color
export const getCaseStatusInfo = (status) => {
  const statusMap = {
    'En Proceso': { color: 'green', label: 'En Proceso', icon: '⚖️' },
    'Pendiente': { color: 'orange', label: 'Pendiente', icon: '⏳' },
    'Cerrado': { color: 'gray', label: 'Cerrado', icon: '✓' },
    'Archivado': { color: 'blue', label: 'Archivado', icon: '📦' },
  };
  return statusMap[status] || { color: 'gray', label: status, icon: '?' };
};

// Utilidad para obtener prioridad con color
export const getPriorityInfo = (priority) => {
  const priorityMap = {
    'Alta': { color: 'red', label: 'Alta', icon: '🔴' },
    'Media': { color: 'yellow', label: 'Media', icon: '🟡' },
    'Baja': { color: 'blue', label: 'Baja', icon: '🔵' },
  };
  return priorityMap[priority] || { color: 'gray', label: priority, icon: '⚪' };
};

// Utilidad para calcular días restantes
export const getDaysRemaining = (date) => {
  if (!date) return null;
  const today = new Date();
  const targetDate = new Date(date);
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Utilidad para formatear días restantes
export const formatDaysRemaining = (date) => {
  const days = getDaysRemaining(date);
  if (days === null) return '';
  if (days < 0) return `Vencido hace ${Math.abs(days)} días`;
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  return `En ${days} días`;
};

// Utilidad para ordenar array de objetos
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

// Utilidad para filtrar array de objetos
export const filterBy = (array, filters) => {
  return array.filter(item => {
    return Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      const itemValue = String(item[key]).toLowerCase();
      const filterValue = String(filters[key]).toLowerCase();
      return itemValue.includes(filterValue);
    });
  });
};

// Utilidad para agrupar array por propiedad
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};
