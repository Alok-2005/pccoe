// File: server/src/config/redis.ts
import { createClient } from 'redis';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';
dotenv.config();
let redisClient: ReturnType<typeof createClient> | null = null;

export const connectRedis = async () => {
  try {
    const REDIS_URL = process.env.REDIS_URL ;
    
    redisClient = createClient({
      url: REDIS_URL
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis connected successfully');
    });

    await redisClient.connect();
    
  } catch (error) {
    logger.error('Redis connection failed:', error);
    logger.warn('⚠️  Running without Redis cache');
  }
};

export const getRedisClient = () => redisClient;

export const cacheGet = async (key: string): Promise<string | null> => {
  if (!redisClient || !redisClient.isOpen) return null;
  try {
    const result = await redisClient.get(key);

    // Convert Buffer to string if necessary
    if (result instanceof Buffer) {
      return result.toString();
    }

    return result as string | null; // already a string or null
  } catch (error) {
    logger.error('Redis get error:', error);
    return null;
  }
};


export const cacheSet = async (
  key: string, 
  value: string, 
  expirySeconds: number = 300
): Promise<void> => {
  if (!redisClient || !redisClient.isOpen) return;
  try {
    await redisClient.setEx(key, expirySeconds, value);
  } catch (error) {
    logger.error('Redis set error:', error);
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  if (!redisClient || !redisClient.isOpen) return;
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error('Redis delete error:', error);
  }
};