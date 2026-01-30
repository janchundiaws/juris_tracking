import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Header = ({ title, onMenuToggle = null }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuToggle = () => {
    if (onMenuToggle) {
      onMenuToggle();
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="menu-toggle-btn" onClick={handleMenuToggle} aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h1>{title}</h1>
      </div>
      
      <div className="header-right">
        <div className="header-search">
          <input type="text" placeholder="Buscar casos, clientes..." />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="header-notifications">
          <button className="notification-btn">
            🔔
            <span className="notification-badge">3</span>
          </button>
        </div>

        <div className="header-user">
          <div className="user-menu">
            <button className="user-menu-btn">
              <div className="user-avatar-small">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <span>{user?.first_name}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            <div className="user-dropdown">
              <Link to="/profile">Mi Perfil</Link>
              <Link to="/settings">Configuración</Link>
              <hr />
              <button onClick={handleLogout}>Cerrar Sesión</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
