import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navigation.css';

const Navigation = ({ isCollapsed = false, onItemClick = null }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState({});

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/cases', label: 'Casos', icon: '⚖️' },
    { path: '/calendar', label: 'Calendario', icon: '📅' },
    { path: '/reports', label: 'Reportes', icon: '📊' },
    { 
      label: 'Administración', 
      icon: '⚙️',
      isParent: true,
      submenu: [
        { path: '/admin/creditors', label: 'Acreedores', icon: '💼' },
        { path: '/admin/lawyers', label: 'Abogados', icon: '👔' },
        { path: '/admin/maestro', label: 'Maestro', icon: '📋' }
      ]
    },
    { path: '/profile', label: 'Mi Perfil', icon: '👤' },
    { path: '/settings', label: 'Configuración', icon: '🔧' }
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

  const toggleSubmenu = (label) => {
    setSubmenuOpen(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
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
        {menuItems.map((item, index) => (
          item.isParent ? (
            <div key={index} className="nav-item-parent">
              <div 
                className={`nav-item ${submenuOpen[item.label] ? 'active' : ''}`}
                onClick={() => toggleSubmenu(item.label)}
              >
                <span className="nav-icon" title={item.label}>
                  {item.icon}
                </span>
                <span className="nav-label">{item.label}</span>
                <span className={`submenu-arrow ${submenuOpen[item.label] ? 'open' : ''}`}>▼</span>
              </div>
              {submenuOpen[item.label] && (
                <div className="nav-submenu">
                  {item.submenu.map((subitem) => (
                    <Link
                      key={subitem.path}
                      to={subitem.path}
                      className={`nav-item nav-subitem ${location.pathname === subitem.path ? 'active' : ''}`}
                      onClick={() => handleItemClick(subitem)}
                    >
                      <span className="nav-icon" title={subitem.label}>
                        {subitem.icon}
                      </span>
                      <span className="nav-label">{subitem.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
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
          )
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
