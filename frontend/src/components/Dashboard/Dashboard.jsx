import React, { useState, useEffect } from 'react';
import { useNewsContext } from '../../context/NewsContext';
import { useSocket } from '../../services/socket';
import api from '../../services/api';
import NewsFilter from './NewsFilter';
import NewsList from '../News/NewsList';
import OperationsPanel from './OperationsPanel';

const Dashboard = () => {
  const { news, fetchNews, addNews, updateNews, removeNews } = useNewsContext();
  const [operations, setOperations] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    severity: '',
    page: 1,
    limit: 20
  });
  const [loading, setLoading] = useState(true);
  
  const socket = useSocket();
  
  // Fetch operations/bot logs
  useEffect(() => {
    const fetchOperations = async () => {
      try {
        const response = await api.get('/bots/logs');
        setOperations(response.data);
      } catch (error) {
        console.error('Error fetching operations:', error);
      }
    };
    
    fetchOperations();
    setLoading(false);
  }, []);
  
  // Set up socket listeners
  useEffect(() => {
    if (!socket) return;
    
    socket.on('news:new', (newsItem) => {
      addNews(newsItem);
    });
    
    socket.on('news:update', (updatedNews) => {
      updateNews(updatedNews);
    });
    
    socket.on('news:delete', ({ id }) => {
      removeNews(id);
    });
    
    socket.on('bot:activity', (logData) => {
      setOperations(prev => [logData, ...prev].slice(0, 100));
    });
    
    return () => {
      socket.off('news:new');
      socket.off('news:update');
      socket.off('news:delete');
      socket.off('bot:activity');
    };
  }, [socket, addNews, updateNews, removeNews]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters({
      ...filters,
      ...newFilters,
      page: 1 // Reset to first page on filter change
    });
  };
  
  // Fetch news when filters change
  useEffect(() => {
    fetchNews(filters);
  }, [filters, fetchNews]);
  
  return (
    <div className="dashboard grid grid-cols-12 gap-4">
      <div className="col-span-2">
        <NewsFilter 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />
      </div>
      
      <div className="col-span-7">
        <NewsList 
          loading={loading}
          onPageChange={(page) => setFilters({...filters, page})}
        />
      </div>
      
      <div className="col-span-3">
        <OperationsPanel operations={operations} />
      </div>
    </div>
  );
};

export default Dashboard;