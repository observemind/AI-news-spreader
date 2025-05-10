import React from 'react';
import { useAuthContext } from '../../context/AuthContext';
import './Common.css';

const Header = () => {
  const { user, logout } = useAuthContext();
  
  return (
    <header className="app-header">
      <div className="header-logo">
        <h1>AI News Spreader</h1>
      </div>
      
      <div className="header-controls">
        {user && (
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <span className="user-role">{user.role}</span>
            <button className="logout-button" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
