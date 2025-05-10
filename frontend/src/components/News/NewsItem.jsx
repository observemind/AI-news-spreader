import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useNewsContext } from '../../context/NewsContext';
import api from '../../services/api';
import './News.css';

const NewsItem = ({ news }) => {
  const { user } = useAuthContext();
  const { updateNews, removeNews } = useNewsContext();
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: news.title,
    content: news.content,
    category: news.category,
    severity_score: news.severity_score
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const canEdit = user && (user.role === 'admin' || user.role === 'editor');
  
  const getColorByScore = (score) => {
    if (score >= 8) return '#e74c3c'; // High severity - Red
    if (score >= 5) return '#f39c12'; // Medium severity - Orange
    return '#2ecc71'; // Low severity - Green
  };
  
  const getCategoryClass = (category) => {
    switch (category.toLowerCase()) {
      case 'positive': return 'category-positive';
      case 'negative': return 'category-negative';
      case 'verified': return 'category-verified';
      default: return 'category-default';
    }
  };
  
  const handleEdit = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.put(`/news/${news.id}`, editData);
      updateNews(response.data);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update news');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this news item?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await api.delete(`/news/${news.id}`);
      removeNews(news.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete news');
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: name === 'severity_score' ? parseFloat(value) : value
    });
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div className="news-item">
      {error && <div className="news-error">{error}</div>}
      
      <div className="news-header">
        <div className="news-meta">
          <span className={`news-category ${getCategoryClass(news.category)}`}>
            {news.category}
          </span>
          <span 
            className="news-severity" 
            style={{ backgroundColor: getColorByScore(news.severity_score) }}
          >
            {news.severity_score.toFixed(1)}
          </span>
        </div>
        
        <div className="news-time">
          {formatDate(news.created_at)}
        </div>
      </div>
      
      {isEditing ? (
        <div className="news-edit-form">
          <div className="form-group">
            <label>Title</label>
            <input
              name="title"
              value={editData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Content</label>
            <textarea
              name="content"
              value={editData.content}
              onChange={handleChange}
              rows="5"
              required
            ></textarea>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={editData.category}
                onChange={handleChange}
              >
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
                <option value="verified">Verified</option>
                <option value="unclassified">Unclassified</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Severity (0-10)</label>
              <input
                type="number"
                name="severity_score"
                value={editData.severity_score}
                onChange={handleChange}
                min="0"
                max="10"
                step="0.1"
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          <h3 className="news-title">{news.title}</h3>
          
          <div className={`news-content ${expanded ? 'expanded' : ''}`}>
            <p>{news.content}</p>
          </div>
          
          {news.content.length > 200 && !expanded && (
            <button 
              className="news-expand-button"
              onClick={() => setExpanded(true)}
            >
              Read More
            </button>
          )}
          
          <div className="news-source">Source: {news.source}</div>
        </>
      )}
      
      {canEdit && (
        <div className="news-actions">
          <button 
            className={`news-action-button ${isEditing ? 'save' : 'edit'}`}
            onClick={handleEdit}
            disabled={loading}
          >
            {isEditing ? (loading ? 'Saving...' : 'Save') : 'Edit'}
          </button>
          
          {isEditing && (
            <button 
              className="news-action-button cancel"
              onClick={() => setIsEditing(false)}
              disabled={loading}
            >
              Cancel
            </button>
          )}
          
          <button 
            className="news-action-button delete"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsItem;