const dotenv = require('dotenv');
dotenv.config(); // Must be at the very top before any routes or middleware load

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const userRoutes = require('./src/routes/userRoutes');

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/menu-items', menuRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static('uploads'));

// Root Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'TastyBites API is running smoothly...',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found - ${req.originalUrl}` });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});