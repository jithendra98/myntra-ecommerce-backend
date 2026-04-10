const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');

// Load env vars FIRST
dotenv.config();

const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const config = require('./config/config');
const setupLogger = require('./middleware/logger');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// ─── Security Middleware ─────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(generalLimiter);

// ─── Body Parsing ────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ─────────────────────────────────────────────────────
setupLogger(app);

// ─── Health Check ────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Myntra E-commerce API is running',
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

// ─── Mount Routes ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Global Error Handler ────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────
const PORT = config.port;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis (non-blocking — app works without it)
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running in ${config.env} mode on port ${PORT}`);
      console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
      console.log(`❤️  Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

module.exports = app;
