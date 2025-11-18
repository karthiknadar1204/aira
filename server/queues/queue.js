import { Queue } from 'bullmq';
import redis from '../utils/redis.js';

export const eventQueue = new Queue('event-processing', {
  connection: redis,
});