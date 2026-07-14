import { pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  // Datos del cliente
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientPhone: varchar("client_phone", { length: 64 }).notNull(),
  clientEmail: varchar("client_email", { length: 320 }),
  eventDate: varchar("event_date", { length: 128 }).notNull(),
  // Detalles de la piñata
  style: varchar("style", { length: 128 }).notNull(),
  size: varchar("size", { length: 64 }).notNull(),
  addons: text("addons"),
  details: text("details"),
  budget: varchar("budget", { length: 128 }),
  // Verificación de pago
  mpOperationId: varchar("mp_operation_id", { length: 128 }),
  comprobanteUrl: text("comprobante_url"),
  comprobanteName: varchar("comprobante_name", { length: 255 }),
  // Estado del pedido
  status: varchar("status", { length: 32 }).default("pending").notNull(),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
