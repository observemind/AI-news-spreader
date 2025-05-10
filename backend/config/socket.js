const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

/**
 * Initialize Socket.io server
 * @param {Object} httpServer - HTTP server to attach Socket.io to
 */
const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      // Allow connection without auth for public clients
      return next();
    }
    
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      return next(new Error('Authentication error'));
    }
  });
  
  // Connection handler
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    // Join rooms based on user role
    if (socket.user) {
      socket.join(`user:${socket.user.id}`);
      
      if (socket.user.role === 'admin') {
        socket.join('admins');
      }
    } else {
      socket.join('public');
    }
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
  
  console.log('Socket.io server initialized');
  return io;
};

module.exports = {
  init,
  get io() {
    if (!io) {
      throw new Error('Socket.io not initialized');
    }
    return io;
  }
};