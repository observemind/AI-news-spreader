const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
    { expiresIn: '7d' }
  );
};

/**
 * Login user
 * @route POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Check if user exists
    const user = await User.getByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if password is correct
    const isPasswordValid = await User.verifyPassword(user, password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Return user data and tokens
    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register user
 * @route POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Create user
    const user = await User.create({ email, password, role });
    
    // Generate token
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Return user data and token
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token,
      refreshToken
    });
  } catch (error) {
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ message: error.message });
    }
    next(error);
  }
};

/**
 * Refresh token
 * @route POST /api/auth/refresh
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
    );
    
    // Get user
    const user = await User.getById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    // Generate new tokens
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    // Return new tokens
    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

/**
 * Get current user
 * @route GET /api/auth/me
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.getById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    });
  } catch (error) {
    next(error);
  }
};