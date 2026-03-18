import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  src: text("src").notNull(),
  fileName: text("file_name").notNull().default(""),
  fileSize: integer("file_size").notNull().default(0),
  alt: text("alt").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Photo = typeof photos.$inferSelect;

export const music = pgTable("music", {
  id: serial("id").primaryKey(),
  src: text("src").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Music = typeof music.$inferSelect;
