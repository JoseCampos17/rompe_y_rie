import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientPhone: varchar("clientPhone", { length: 64 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }),
  eventDate: varchar("eventDate", { length: 128 }).notNull(),
  style: varchar("style", { length: 128 }).notNull(),
  size: varchar("size", { length: 64 }).notNull(),
  details: text("details"),
  referenceImage: text("referenceImage"),
  estimatedPrice: int("estimatedPrice").notNull(),
  depositAmount: int("depositAmount").notNull(),
  paymentStatus: varchar("paymentStatus", { length: 64 }).default("pending").notNull(),
  paymentId: varchar("paymentId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;