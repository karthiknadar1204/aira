import { pgTable, serial, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  eventType: text('event_type').notNull(),
  payload: jsonb('payload'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userEventStats = pgTable('user_event_stats', {
  id: serial('id').primaryKey(),
  userId: text('user_id').unique().notNull(),
  totalEvents: integer('total_events').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});