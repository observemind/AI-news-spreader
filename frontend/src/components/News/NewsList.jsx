import React from 'react';
import { useNewsContext } from '../../context/NewsContext';
import NewsItem from './NewsItem';
import './News.css';

const NewsList = ({ loading, onPageChange }) => {
  const { news, pagination } = useNewsContext();
  
  if (loading) {
    return (
      <div className="news-loading">
        <div className="spinner"></div>
        <p>Loading news articles...</p>
      </div>
    );
  }
  
  if (news.length === 0) {
    return (
      <div className="news-empty">
        <p>No news articles found matching your criteria.</p>
      </div>
    );
  }
  
  return (
    <div className="news-list-container">
      <h2>News Feed</h2>
      
      <div className="news-list">
        {news.map(item => (
          <NewsItem key={item.id} news={item} />
        ))}
      </div>
      
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="pagination-button"
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.page} of {pagination.pages}
          </span>
          
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsList;