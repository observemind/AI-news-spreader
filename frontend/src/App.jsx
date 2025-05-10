import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './context/AuthContext';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import './App.css';

const App = () => {
  const { isAuthenticated, loading, checkAuthStatus } = useAuthContext();
  
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  return (
    <Router>
      <div className="app">
        {isAuthenticated && (
          <>
            <Header />
            <div className="main-container">
              <Sidebar />
              <main className="content">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          </>
        )}
        
        {!isAuthenticated && (
          <div className="auth-container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;
