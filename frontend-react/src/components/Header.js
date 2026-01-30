import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ title }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
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
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <span>{user?.firstName}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            <div className="user-dropdown">
              <a href="/profile">Mi Perfil</a>
              <a href="/settings">Configuración</a>
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
