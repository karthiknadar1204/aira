import { db } from '../config/db.js';
import { events } from '../config/schema.js';
import { eventQueue } from '../queues/queue.js';
import { invalidateUserCache } from './cacheService.js';

export const ingestEvent = async (userId, eventType, payload) => {
  await db.insert(events).values({
    userId,
    eventType,
    payload,
  });

  await invalidateUserCache(userId);
  await eventQueue.add('update-count', { userId }, { jobId: `count-${userId}` });
};