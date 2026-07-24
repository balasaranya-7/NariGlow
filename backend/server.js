const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Establish database connection
connectDB();

const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Body parser for incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Body parser for URL-encoded values

// Serve NariGlow Frontend statically
// This mounts the frontend folder so that assets can be fetched.
app.use(express.static(path.join(__dirname, '../frontend')));

// Log incoming requests in development mode
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Bind API Endpoint Routes
app.use('/api/auth', require('./routes/auth.routes.js'));
app.use('/api/products', require('./routes/products.routes.js'));
app.use('/api/categories', require('./routes/categories.routes.js'));
app.use('/api/cart', require('./routes/cart.routes.js'));
app.use('/api/wishlist', require('./routes/wishlist.routes.js'));
app.use('/api/orders', require('./routes/orders.routes.js'));
app.use('/api/newsletter', require('./routes/newsletter.routes.js'));

// Route for root URL to serve NariGlow.html directly from server
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/NariGlow.html'));
});

// Custom 404 Route handler for API endpoints
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

// Custom Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Express Error handler caught an exception:', err.stack);
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred',
    // Only return stack trace in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`NariGlow Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections globally
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
