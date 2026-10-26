import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient: Redis | null = null;
let isRedisConnected = false;

try {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 5) {
        console.warn('Redis reconnection failed after 5 retries. Running with memory cache fallback.');
        return null;
      }
      return Math.min(times * 100, 3000);
    },
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    console.log('⚡ Redis connected successfully');
  });

  redisClient.on('error', (err) => {
    isRedisConnected = false;
    console.warn('⚠️ Redis error:', err.message);
  });
} catch (e: any) {
  console.warn('⚠️ Could not initialize Redis client:', e.message);
}

// In-memory fallback cache
const memoryCache = new Map<string, { value: string; expiry: number }>();

export const cache = {
  async get(key: string): Promise<string | null> {
    if (isRedisConnected && redisClient) {
      try {
        return await redisClient.get(key);
      } catch (err) {
        console.warn('Redis GET failed, checking fallback cache', err);
      }
    }
    const item = memoryCache.get(key);
    if (item && item.expiry > Date.now()) {
      return item.value;
    }
    memoryCache.delete(key);
    return null;
  },

  async set(key: string, value: string, ttlSeconds: number = 300): Promise<void> {
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.set(key, value, 'EX', ttlSeconds);
        return;
      } catch (err) {
        console.warn('Redis SET failed, using fallback cache', err);
      }
    }
    memoryCache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  },

  async del(patternOrKey: string): Promise<void> {
    if (isRedisConnected && redisClient) {
      try {
        const keys = await redisClient.keys(patternOrKey);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      } catch (err) {
        console.warn('Redis DEL failed', err);
      }
    }
    // Clear memory fallback
    for (const key of memoryCache.keys()) {
      if (key.includes(patternOrKey.replace('*', ''))) {
        memoryCache.delete(key);
      }
    }
  },

  isConnected(): boolean {
    return isRedisConnected;
  }
};

export default redisClient;
