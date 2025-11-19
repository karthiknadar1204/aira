import express from 'express';
import { z } from 'zod';
import { ingestEvent } from '../services/eventService.js';
import { getCachedEventCount } from '../services/cacheService.js';
import { db } from '../config/db.js';
import { events } from '../config/schema.js';
import { and, eq, gte, lte, count } from 'drizzle-orm';
import redis from '../utils/redis.js';

const router = express.Router();

const eventSchema = z.object({
  userId: z.string().min(1),
  eventType: z.string().min(1),
  payload: z.any().optional(),
});

router.post('/', async (req, res) => {
  try {
    const body = eventSchema.parse(req.body);
    await ingestEvent(body.userId, body.eventType, body.payload);
    res.status(202).json({ message: 'Event queued for processing' });
  } catch (err) {
    res.status(400).json({ error: err.message })    ;
  }
});

router.get('/users/:userId/events/count', async (req, res) => {
  const { userId } = req.params;

  const cached = await getCachedEventCount(userId);
  if (cached !== null) {
    return res.json({ userId, count: cached, source: 'cache' });
  }

  const result = await db
    .select({ count: count() })
    .from(events)
    .where(eq(events.userId, userId));

  const eventCount = result[0]?.count || 0;
  
  await redis.setex(`user:${userId}:event_count`, 300, eventCount.toString());
  
  res.json({ userId, count: eventCount, source: 'db' });
});

router.get('/users/:userId/events', async (req, res) => {
  const { userId } = req.params;
  const { type, start, end } = req.query;

  const conditions = [eq(events.userId, userId)];
  
  if (type) conditions.push(eq(events.eventType, type));
  if (start) conditions.push(gte(events.createdAt, new Date(start)));
  if (end) conditions.push(lte(events.createdAt, new Date(end)));

  const result = await db
    .select()
    .from(events)
    .where(and(...conditions))
    .orderBy({ createdAt: 'desc' })
    .limit(100);
  
  res.json(result);
});

export default router;