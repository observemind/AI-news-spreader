const db = require('../config/database');

class News {
  /**
   * Get all news with filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>} - News items
   */
  static async getAll({ category, severity, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const params = [];
    let query = 'SELECT * FROM news WHERE 1=1';
    
    // Add category filter
    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }
    
    // Add severity filter
    if (severity) {
      const severityMap = {
        low: [0, 3.5],
        medium: [3.5, 7],
        high: [7, 10]
      };
      
      if (severityMap[severity]) {
        params.push(severityMap[severity][0]);
        params.push(severityMap[severity][1]);
        query += ` AND severity_score > $${params.length - 1} AND severity_score <= $${params.length}`;
      }
    }
    
    // Add pagination
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit));
    params.push(parseInt(offset));
    
    // Get total count for pagination
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)').split('ORDER BY')[0];
    const countResult = await db.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);
    
    // Execute main query
    const result = await db.query(query, params);
    
    return {
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  /**
   * Get news by ID
   * @param {number} id - News ID
   * @returns {Promise<Object>} - News item
   */
  static async getById(id) {
    const result = await db.query('SELECT * FROM news WHERE id = $1', [id]);
    return result.rows[0];
  }
  
  /**
   * Create news item
   * @param {Object} newsData - News data
   * @returns {Promise<Object>} - Created news item
   */
  static async create(newsData) {
    const { title, content, source, category, sentiment, severity_score } = newsData;
    
    const result = await db.query(
      `INSERT INTO news (title, content, source, category, sentiment, severity_score) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [title, content, source, category, sentiment || 0, severity_score || 5]
    );
    
    return result.rows[0];
  }
  
  /**
   * Update news item
   * @param {number} id - News ID
   * @param {Object} newsData - Updated news data
   * @returns {Promise<Object>} - Updated news item
   */
  static async update(id, newsData) {
    // Get existing news
    const existingNews = await this.getById(id);
    if (!existingNews) return null;
    
    // Prepare updated data
    const updatedData = {
      ...existingNews,
      ...newsData,
      updated_at: new Date()
    };
    
    const { title, content, source, category, sentiment, severity_score } = updatedData;
    
    const result = await db.query(
      `UPDATE news 
       SET title = $1, content = $2, source = $3, category = $4, 
           sentiment = $5, severity_score = $6, updated_at = NOW() 
       WHERE id = $7 
       RETURNING *`,
      [title, content, source, category, sentiment, severity_score, id]
    );
    
    return result.rows[0];
  }
  
  /**
   * Delete news item
   * @param {number} id - News ID
   * @returns {Promise<boolean>} - Success status
   */
  static async delete(id) {
    const result = await db.query('DELETE FROM news WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  }
  
  /**
   * Get news statistics
   * @returns {Promise<Object>} - Statistics
   */
  static async getStats() {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN category = 'positive' THEN 1 END) as positive_count,
        COUNT(CASE WHEN category = 'negative' THEN 1 END) as negative_count,
        AVG(severity_score) as avg_severity,
        MAX(created_at) as latest_news
      FROM news
    `);
    
    return result.rows[0];
  }
}

module.exports = News;