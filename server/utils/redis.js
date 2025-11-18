import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

redis.on('error', (err) => console.error('Redis Client Error:', err));
redis.on('connect', () => console.log('Redis connected successfully'));
redis.on('ready', () => console.log('Redis ready to use'));
redis.on('reconnecting', () => console.log('Redis reconnecting...'));

export default redis;