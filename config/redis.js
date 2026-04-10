const { createClient } = require('redis');

let redisClient = null;
let isRedisConnected = false;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: false, // Don't auto-reconnect if Redis is unavailable
        connectTimeoutMs: 3000,   // Give up after 3 seconds
      },
    });

    redisClient.on('error', () => {
      // Silently handle — already logged on initial failure
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected');
      isRedisConnected = true;
    });

    redisClient.on('end', () => {
      isRedisConnected = false;
    });

    await redisClient.connect();
  } catch (error) {
    console.warn(`⚠️  Redis unavailable — app running without caching (graceful degradation)`);
    isRedisConnected = false;
    redisClient = null;
  }
};

const getRedisClient = () => redisClient;
const getRedisStatus = () => isRedisConnected;

module.exports = { connectRedis, getRedisClient, getRedisStatus };
