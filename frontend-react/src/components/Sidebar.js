import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/cases', label: 'Casos', icon: '⚖️' },
    { path: '/clients', label: 'Clientes', icon: '👥' },
    { path: '/calendar', label: 'Calendario', icon: '📅' },
    { path: '/documents', label: 'Documentos', icon: '📄' },
    { path: '/tasks', label: 'Tareas', icon: '✓' },
    { path: '/reports', label: 'Reportes', icon: '📊' },
    { path: '/settings', label: 'Configuración', icon: '⚙️' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <svg width="40" height="40" viewBox="0 0 50 50" fill="none">
            <rect x="10" y="5" width="30" height="40" rx="2" stroke="white" strokeWidth="2"/>
            <path d="M20 15 L30 15" stroke="white" strokeWidth="2"/>
            <path d="M20 22 L30 22" stroke="white" strokeWidth="2"/>
            <path d="M20 29 L30 29" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
        <h2>JurisTracking</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="user-details">
            <p className="user-name">{user?.firstName} {user?.lastName}</p>
            <p className="user-role">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
