import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { orders } from "./_schema";
import getDb from "./_db";

// In-memory fallback for local dev without a DB
const localOrders: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  const db = getDb();

  // ── GET /api/orders ─────────────────────────────────────────────────────────
  if (req.method === "GET") {
    const adminPass = req.headers.authorization?.replace("Bearer ", "");
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    if (adminPass !== adminPassword) {
      return res.status(401).json({ error: "No autorizado" });
    }
    if (db) {
      const all = await db.select().from(orders).orderBy(orders.createdAt);
      return res.status(200).json(all);
    }
    return res.status(200).json(localOrders.reverse());
  }

  // ── POST /api/orders ─────────────────────────────────────────────────────────
  if (req.method === "POST") {
    const body = req.body as {
      clientName: string;
      clientPhone: string;
      clientEmail?: string;
      eventDate: string;
      style: string;
      size: string;
      addons?: string;
      details?: string;
      budget?: string;
      mpOperationId?: string;
      comprobanteUrl?: string;
      comprobanteName?: string;
    };

    if (!body.clientName || !body.clientPhone || !body.eventDate) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const newOrder = {
      clientName: body.clientName,
      clientPhone: body.clientPhone,
      clientEmail: body.clientEmail ?? null,
      eventDate: body.eventDate,
      style: body.style,
      size: body.size,
      addons: body.addons ?? null,
      details: body.details ?? null,
      budget: body.budget ?? null,
      mpOperationId: body.mpOperationId ?? null,
      comprobanteUrl: body.comprobanteUrl ?? null,
      comprobanteName: body.comprobanteName ?? null,
      status: "pending",
    };

    if (db) {
      const [inserted] = await db.insert(orders).values(newOrder).returning();
      return res.status(201).json(inserted);
    }

    // Local fallback
    const local = { ...newOrder, id: Date.now(), createdAt: new Date().toISOString() };
    localOrders.push(local);
    return res.status(201).json(local);
  }

  // ── PATCH /api/orders ─────────────────────────────────────────────────────────
  if (req.method === "PATCH") {
    const adminPass = req.headers.authorization?.replace("Bearer ", "");
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    if (adminPass !== adminPassword) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const { id, status, adminNotes } = req.body as {
      id: number;
      status: string;
      adminNotes?: string;
    };

    if (db) {
      const [updated] = await db
        .update(orders)
        .set({ status, adminNotes: adminNotes ?? null })
        .where(eq(orders.id, id))
        .returning();
      return res.status(200).json(updated);
    }

    // Local fallback
    const idx = localOrders.findIndex((o) => o.id === id);
    if (idx !== -1) localOrders[idx] = { ...localOrders[idx], status, adminNotes };
    return res.status(200).json(localOrders[idx] ?? {});
  }

  return res.status(405).json({ error: "Método no permitido" });
}
