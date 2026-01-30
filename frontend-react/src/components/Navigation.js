import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navigation.css';

const Navigation = ({ isCollapsed = false, onItemClick = null }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/cases', label: 'Casos', icon: '⚖️' },
    { path: '/clients', label: 'Clientes', icon: '👥' },
    { path: '/calendar', label: 'Calendario', icon: '📅' },
    { path: '/documents', label: 'Documentos', icon: '📄' },
    { path: '/tasks', label: 'Tareas', icon: '✓' },
    { path: '/reports', label: 'Reportes', icon: '📊' },
    { path: '/profile', label: 'Mi Perfil', icon: '👤' },
    { path: '/settings', label: 'Configuración', icon: '⚙️' }
  ];

  const handleItemClick = (item) => {
    if (onItemClick) {
      onItemClick(item);
    }
    // Cerrar menú móvil después de hacer clic
    setIsOpen(false);
  };

  const handleToggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={`navigation ${isCollapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`}>
      <div className="nav-mobile-header">
        <button className="nav-toggle" onClick={handleToggleMenu} aria-label="Toggle navigation">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`nav-items-container ${isOpen ? 'show' : ''}`}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => handleItemClick(item)}
          >
            <span className="nav-icon" title={item.label}>
              {item.icon}
            </span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
