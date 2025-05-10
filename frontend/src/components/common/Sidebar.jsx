import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import './Common.css';

const Sidebar = () => {
  const { user } = useAuthContext();
  
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
              Dashboard
            </NavLink>
          </li>
          
          {user && (user.role === 'admin' || user.role === 'editor') && (
            <>
              <li>
                <NavLink to="/news/create" className={({ isActive }) => isActive ? 'active' : ''}>
                  Add News
                </NavLink>
              </li>
              
              <li>
                <NavLink to="/bots" className={({ isActive }) => isActive ? 'active' : ''}>
                  Bot Management
                </NavLink>
              </li>
            </>
          )}
          
          {user && user.role === 'admin' && (
            <li>
              <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''}>
                User Management
              </NavLink>
            </li>
          )}
          
          <li>
            <NavLink to="/analytics" className={({ isActive }) => isActive ? 'active' : ''}>
              Analytics
            </NavLink>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <p>© {new Date().getFullYear()} News Spreader</p>
      </div>
    </aside>
  );
};

export default Sidebar;