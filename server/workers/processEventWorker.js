import { Worker } from 'bullmq';
import redis from '../utils/redis.js';
import { db } from '../config/db.js';
import { events, userEventStats } from '../config/schema.js';
import { eq, count } from 'drizzle-orm';

console.log('Starting BullMQ worker...');

const worker = new Worker('event-processing', async (job) => {
  const { userId } = job.data;

  console.log(`Worker: Processing job for user ${userId}`);


  const result = await db
    .select({ count: count() })
    .from(events)
    .where(eq(events.userId, userId));

  const total = Number(result[0]?.count || 0);
  console.log(`Worker: Counted ${total} events for ${userId}`);

  await redis.setex(`user:${userId}:event_count`, 300, total.toString());
  console.log(`Worker: Cached user:${userId}:event_count = ${total}`);

  await db
  .insert(userEventStats)
  .values({
    userId,
    totalEvents: total,
    updatedAt: new Date(),
  })
  .onConflictDoUpdate({
    target: [userEventStats.userId],
    set: {
      totalEvents: total,
      updatedAt: new Date(),
    },
  });

  console.log(`Worker: Updated user_event_stats for ${userId}`);
}, {
  connection: redis,
});

worker.on('completed', (job) => {
  console.log(`Job completed for user ${(job.data)?.userId}`);
});

worker.on('failed', (job, err) => {
  console.error(`Job FAILED for user ${(job?.data)?.userId}:`, err);
});

console.log('BullMQ worker is ACTIVE and listening for jobs');