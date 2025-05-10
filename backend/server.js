const { app, httpServer } = require('./app');
const db = require('./config/database');

const PORT = process.env.PORT || 5000;

// Connect to database
db.connect()
  .then(() => {
    console.log('Database connected successfully');
    
    // Start the server
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('HTTP server closed');
    db.disconnect()
      .then(() => {
        console.log('Database connection closed');
        process.exit(0);
      })
      .catch(err => {
        console.error('Error during shutdown:', err);
        process.exit(1);
      });
  });
});