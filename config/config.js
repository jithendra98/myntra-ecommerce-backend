const config = {
  development: {
    morganFormat: 'dev',
    showErrorStack: true,
    rateLimitMax: 200,
    authRateLimitMax: 50,
    redisTTL: 60,          // 1 minute
    corsOrigin: '*',
  },
  production: {
    morganFormat: 'combined',
    showErrorStack: false,
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    authRateLimitMax: 20,
    redisTTL: 300,          // 5 minutes
    corsOrigin: process.env.CORS_ORIGIN || '*',
  },
};

const env = process.env.NODE_ENV || 'development';
const currentConfig = config[env] || config.development;

module.exports = {
  env,
  port: parseInt(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  redisUrl: process.env.REDIS_URL,
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 min
  ...currentConfig,
};
