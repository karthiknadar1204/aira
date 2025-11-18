import { Worker } from 'bullmq';
import { db } from '../config/db.js';
import { userEventStats } from '../config/schema.js';
import redis from '../utils/redis.js';
import { eq } from 'drizzle-orm';

const worker = new Worker('event-processing', async (job) => {
  const { userId } = job.data;

  const countResult = await db
    .select({ count: { $count: '*' } })
    .from(userEventStats)
    .where(eq(userEventStats.userId, userId));

  const total = countResult[0]?.count || 0;

  await db
    .insert(userEventStats)
    .values({ userId, totalEvents: total })
    .onConflictDoUpdate({
      target: userEventStats.userId,
      set: { totalEvents: total, updatedAt: new Date() },
    });

  await redis.setEx(`user:${userId}:event_count`, 300, total.toString());
}, {
  connection: redis,
});

worker.on('completed', (job) => console.log(`Processed event count for user ${job.data.userId}`));
worker.on('failed', (job, err) => console.log(`Job failed:`, err));