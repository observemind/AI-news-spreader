const db = require('../config/database');

class Bot {
  /**
   * Get all bot logs
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Bot logs
   */
  static async getLogs({ botName, status, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const params = [];
    let query = 'SELECT * FROM bot_logs WHERE 1=1';
    
    // Add bot name filter
    if (botName) {
      params.push(botName);
      query += ` AND bot_name = $${params.length}`;
    }
    
    // Add status filter
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
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
   * Create bot log
   * @param {Object} logData - Log data
   * @returns {Promise<Object>} - Created log
   */
  static async createLog({ bot_name, action, status, details = {} }) {
    const result = await db.query(
      `INSERT INTO bot_logs (bot_name, action, status, details) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [bot_name, action, status, JSON.stringify(details)]
    );
    
    return result.rows[0];
  }
  
  /**
   * Get recent bot activity
   * @param {number} limit - Number of logs to return
   * @returns {Promise<Array>} - Recent bot logs
   */
  static async getRecentActivity(limit = 100) {
    const result = await db.query(
      `SELECT * FROM bot_logs 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );
    
    return result.rows;
  }
  
  /**
   * Get bot statistics
   * @returns {Promise<Object>} - Bot statistics
   */
  static async getStats() {
    const result = await db.query(`
      SELECT 
        bot_name,
        COUNT(*) as total_actions,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_actions,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_actions,
        MAX(created_at) as last_activity
      FROM bot_logs
      GROUP BY bot_name
      ORDER BY total_actions DESC
    `);
    
    return result.rows;
  }
}

module.exports = Bot;