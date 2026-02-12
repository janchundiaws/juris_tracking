import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Header = ({ title, onMenuToggle = null }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleMenuToggle = () => {
    if (onMenuToggle) {
      onMenuToggle();
    }
  };

  return (
    <>
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

      {/* Modal de confirmación de cierre de sesión */}
      {showLogoutModal && (
        <div className="logout-modal-overlay" onClick={cancelLogout}>
          <div className="logout-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3>Cerrar Sesión</h3>
            <p>¿Estás seguro de que deseas cerrar sesión?</p>
            <div className="logout-modal-actions">
              <button className="logout-modal-cancel" onClick={cancelLogout}>
                Cancelar
              </button>
              <button className="logout-modal-confirm" onClick={confirmLogout}>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
