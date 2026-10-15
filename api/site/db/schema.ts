import { sqliteTable, integer, text, uniqueIndex, index, primaryKey } from "drizzle-orm/sqlite-core";
export const practiceEvents = sqliteTable("practice_events", {
  seq:integer("seq").primaryKey({autoIncrement:true}),
  userId:text("user_id").notNull(), eventId:text("event_id").notNull(),
  setCode:text("set_code").notNull(), kind:text("kind").notNull(),
  payload:text("payload").notNull(), createdAt:integer("created_at").notNull(),
}, t => [uniqueIndex("practice_event_once").on(t.userId,t.eventId), index("practice_history_lookup").on(t.userId,t.setCode,t.seq)]);
export const voiceStarts = sqliteTable("voice_starts", {
  userId:text("user_id").notNull(), hour:integer("hour").notNull(), count:integer("count").notNull(),
}, t => [primaryKey({columns:[t.userId,t.hour]})]);
