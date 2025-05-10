const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  /**
   * Get all users
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Users
   */
  static async getAll({ page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    
    const result = await db.query(
      `SELECT id, email, role, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    const countResult = await db.query('SELECT COUNT(*) FROM users');
    const total = parseInt(countResult.rows[0].count);
    
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
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object>} - User
   */
  static async getById(id) {
    const result = await db.query(
      `SELECT id, email, role, created_at 
       FROM users 
       WHERE id = $1`,
      [id]
    );
    
    return result.rows[0];
  }
  
  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} - User with password
   */
  static async getByEmail(email) {
    const result = await db.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    
    return result.rows[0];
  }
  
  /**
   * Create user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Created user
   */
  static async create({ email, password, role = 'viewer' }) {
    // Check if user already exists
    const existingUser = await this.getByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const result = await db.query(
      `INSERT INTO users (email, password, role) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, role, created_at`,
      [email, hashedPassword, role]
    );
    
    return result.rows[0];
  }
  
  /**
   * Update user
   * @param {number} id - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} - Updated user
   */
  static async update(id, userData) {
    const { email, password, role } = userData;
    
    // Start building query and parameters
    let query = 'UPDATE users SET';
    const params = [];
    const updates = [];
    
    // Add email update if provided
    if (email) {
      params.push(email);
      updates.push(` email = $${params.length}`);
    }
    
    // Add password update if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      params.push(hashedPassword);
      updates.push(` password = $${params.length}`);
    }
    
    // Add role update if provided
    if (role) {
      params.push(role);
      updates.push(` role = $${params.length}`);
    }
    
    // If no updates, return existing user
    if (updates.length === 0) {
      return this.getById(id);
    }
    
    // Complete query
    query += updates.join(',');
    params.push(id);
    query += ` WHERE id = $${params.length} RETURNING id, email, role, created_at`;
    
    // Execute query
    const result = await db.query(query, params);
    return result.rows[0];
  }
  
  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise<boolean>} - Success status
   */
  static async delete(id) {
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  }
  
  /**
   * Verify password
   * @param {Object} user - User object with hashed password
   * @param {string} password - Plain password to verify
   * @returns {Promise<boolean>} - Is password valid
   */
  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }
}

module.exports = User;