import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { orders } from "./_schema.js";
import getDb from "./_db.js";

// In-memory fallback for local dev without a DB
const localOrders: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const db = getDb();

    // ── GET /api/orders ─────────────────────────────────────────────────────────
    if (req.method === "GET") {
      const { id, phone } = req.query as { id?: string; phone?: string };
      if (id && phone) {
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
          return res.status(400).json({ error: "ID inválido" });
        }
        if (db) {
          const [order] = await db
            .select()
            .from(orders)
            .where(eq(orders.id, parsedId))
            .limit(1);
          if (!order) {
            return res.status(404).json({ error: "Pedido no encontrado" });
          }
          if (order.clientPhone !== phone) {
            return res.status(401).json({ error: "Número de teléfono no coincide" });
          }
          return res.status(200).json(order);
        } else {
          // Local fallback
          const order = localOrders.find((o) => o.id === parsedId);
          if (!order) {
            return res.status(404).json({ error: "Pedido no encontrado" });
          }
          if (order.clientPhone !== phone) {
            return res.status(401).json({ error: "Número de teléfono no coincide" });
          }
          return res.status(200).json(order);
        }
      }

      const adminPass = req.headers.authorization?.replace("Bearer ", "");
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
      if (adminPass !== adminPassword) {
        return res.status(401).json({ error: "No autorizado" });
      }
      if (db) {
        const all = await db.select().from(orders).orderBy(orders.createdAt);
        return res.status(200).json(all);
      }
      return res.status(200).json([...localOrders].reverse());
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
        status: "pending_quote",
        estimatedPrice: null,
        depositAmount: null,
      };

      if (db) {
        const [inserted] = await db.insert(orders).values(newOrder as any).returning();
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
      const isAdmin = adminPass === adminPassword;

      if (isAdmin) {
        const { id, status, adminNotes, estimatedPrice, depositAmount } = req.body as {
          id: number;
          status: string;
          adminNotes?: string;
          estimatedPrice?: string;
          depositAmount?: string;
        };

        if (db) {
          const updateFields: any = { status };
          if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;
          if (estimatedPrice !== undefined) updateFields.estimatedPrice = estimatedPrice;
          if (depositAmount !== undefined) updateFields.depositAmount = depositAmount;

          const [updated] = await db
            .update(orders)
            .set(updateFields)
            .where(eq(orders.id, id))
            .returning();
          return res.status(200).json(updated);
        }

        // Local fallback
        const idx = localOrders.findIndex((o) => o.id === id);
        if (idx !== -1) {
          localOrders[idx] = {
            ...localOrders[idx],
            status,
            ...(adminNotes !== undefined && { adminNotes }),
            ...(estimatedPrice !== undefined && { estimatedPrice }),
            ...(depositAmount !== undefined && { depositAmount }),
          };
        }
        return res.status(200).json(localOrders[idx] ?? {});
      } else {
        const { id, clientPhone, mpOperationId, comprobanteUrl, comprobanteName } = req.body as {
          id: number;
          clientPhone: string;
          mpOperationId: string;
          comprobanteUrl: string;
          comprobanteName: string;
        };

        if (!id || !clientPhone) {
          return res.status(401).json({ error: "No autorizado" });
        }

        if (db) {
          const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
          if (!order) {
            return res.status(404).json({ error: "Pedido no encontrado" });
          }
          if (order.clientPhone !== clientPhone) {
            return res.status(401).json({ error: "Número de teléfono no coincide" });
          }

          const [updated] = await db
            .update(orders)
            .set({
              mpOperationId,
              comprobanteUrl,
              comprobanteName,
              status: "pending",
            })
            .where(eq(orders.id, id))
            .returning();
          return res.status(200).json(updated);
        } else {
          // Local fallback
          const idx = localOrders.findIndex((o) => o.id === id);
          if (idx === -1) {
            return res.status(404).json({ error: "Pedido no encontrado" });
          }
          if (localOrders[idx].clientPhone !== clientPhone) {
            return res.status(401).json({ error: "Número de teléfono no coincide" });
          }
          localOrders[idx] = {
            ...localOrders[idx],
            mpOperationId,
            comprobanteUrl,
            comprobanteName,
            status: "pending",
          };
          return res.status(200).json(localOrders[idx]);
        }
      }
    }

    return res.status(405).json({ error: "Método no permitido" });
  } catch (err: any) {
    console.error("API error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
