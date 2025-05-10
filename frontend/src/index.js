import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { NewsProvider } from './context/NewsContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <NewsProvider>
        <App />
      </NewsProvider>
    </AuthProvider>
  </React.StrictMode>
);