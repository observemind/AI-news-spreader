const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createServer } = require('http');
const socket = require('./config/socket');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const botRoutes = require('./routes/bots');

// Create Express app
const app = express();
const httpServer = createServer(app);

// Set up WebSocket
socket.init(httpServer);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/bots', botRoutes);

// Error handling
app.use(errorHandler);

module.exports = { app, httpServer };