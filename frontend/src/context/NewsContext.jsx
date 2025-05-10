import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../services/api';

const NewsContext = createContext();

export const useNewsContext = () => useContext(NewsContext);

export const NewsProvider = ({ children }) => {
  const [news, setNews] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0
  });
  const [loading, setLoading] = useState(false);
  
  const fetchNews = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/news', { params: filters });
      setNews(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const addNews = useCallback((newsItem) => {
    setNews(prev => [newsItem, ...prev]);
  }, []);
  
  const updateNews = useCallback((updatedNews) => {
    setNews(prev => 
      prev.map(item => item.id === updatedNews.id ? updatedNews : item)
    );
  }, []);
  
  const removeNews = useCallback((newsId) => {
    setNews(prev => prev.filter(item => item.id !== newsId));
  }, []);
  
  return (
    <NewsContext.Provider value={{
      news,
      pagination,
      loading,
      fetchNews,
      addNews,
      updateNews,
      removeNews
    }}>
      {children}
    </NewsContext.Provider>
  );
};