const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

/**
 * Request logging middleware
 * - Development: colored console output
 * - Production: combined format written to logs/access.log
 */
const setupLogger = (app) => {
  if (config.env === 'production') {
    // Ensure logs directory exists
    const logDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Write logs to file in production
    const accessLogStream = fs.createWriteStream(
      path.join(logDir, 'access.log'),
      { flags: 'a' }
    );

    app.use(morgan(config.morganFormat, { stream: accessLogStream }));
  }

  // Always log to console
  app.use(morgan(config.morganFormat));
};

module.exports = setupLogger;
