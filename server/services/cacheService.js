import redis from '../utils/redis.js';

export const getCachedEventCount = async (userId) => {
  const cached = await redis.get(`user:${userId}:event_count`);
  return cached ? parseInt(cached) : null;
};

export const invalidateUserCache = async (userId) => {
  await redis.del(`user:${userId}:event_count`);
};