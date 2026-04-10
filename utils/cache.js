const { getRedisClient, getRedisStatus } = require('../config/redis');
const crypto = require('crypto');

/**
 * Generate a hash key from query parameters for cache keying
 */
const generateCacheKey = (prefix, params) => {
  const hash = crypto.createHash('md5').update(JSON.stringify(params)).digest('hex');
  return `${prefix}:${hash}`;
};

/**
 * Get cached data by key
 * Returns null if Redis is unavailable or key doesn't exist
 */
const getCache = async (key) => {
  try {
    if (!getRedisStatus()) return null;

    const client = getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn(`⚠️  Cache GET failed for key "${key}": ${error.message}`);
    return null;
  }
};

/**
 * Set data in cache with TTL (time-to-live in seconds)
 */
const setCache = async (key, data, ttl) => {
  try {
    if (!getRedisStatus()) return;

    const client = getRedisClient();
    await client.setEx(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.warn(`⚠️  Cache SET failed for key "${key}": ${error.message}`);
  }
};

/**
 * Invalidate cache by pattern (e.g., "products:*")
 * Uses SCAN to find matching keys and delete them
 */
const invalidateCache = async (pattern) => {
  try {
    if (!getRedisStatus()) return;

    const client = getRedisClient();
    const keys = [];

    // Use SCAN to find keys matching the pattern
    for await (const key of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      keys.push(key);
    }

    if (keys.length > 0) {
      await client.del(keys);
      console.log(`🗑️  Cache invalidated: ${keys.length} keys matching "${pattern}"`);
    }
  } catch (error) {
    console.warn(`⚠️  Cache invalidation failed for pattern "${pattern}": ${error.message}`);
  }
};

module.exports = { generateCacheKey, getCache, setCache, invalidateCache };
