import { Queue } from 'bullmq';
import redis from '../utils/redis';

export const eventQueue = new Queue('event-processing', {
  connection: redis,
});