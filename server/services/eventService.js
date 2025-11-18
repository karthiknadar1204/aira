import { db } from '../config/db';
import { events } from '../config/schema';
import { eventQueue } from '../queues/queue';
import { invalidateUserCache } from './cacheService';

export const ingestEvent = async (userId, eventType, payload) => {
  await db.insert(events).values({
    userId,
    eventType,
    payload,
  });

  await invalidateUserCache(userId);
  await eventQueue.add('update-count', { userId }, { jobId: `count-${userId}` });
};