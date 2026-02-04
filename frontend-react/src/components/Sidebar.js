import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navigation from './Navigation';

const Sidebar = ({ isOpen = false, onClose }) => {
  const { user } = useAuth();

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
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

        <Navigation />

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.first_name} {user?.last_name}</p>
              <p className="user-role">{user?.role_id}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
