import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { orders } from "../drizzle/schema";
import fs from "fs";
import path from "path";

// Carpeta local para almacenar cotizaciones si la base de datos no está disponible
const SCRATCH_DIR = "/home/shin/.gemini/antigravity-ide/brain/430e61b7-3845-4f97-bff2-90b3374a0cf1/scratch";
const ORDERS_FILE = path.join(SCRATCH_DIR, "orders.json");

function getLocalOrders() {
  try {
    if (!fs.existsSync(SCRATCH_DIR)) {
      fs.mkdirSync(SCRATCH_DIR, { recursive: true });
    }
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to read local orders file:", error);
  }
  return [];
}

function saveLocalOrder(order: any) {
  try {
    const all = getLocalOrders();
    all.push(order);
    if (!fs.existsSync(SCRATCH_DIR)) {
      fs.mkdirSync(SCRATCH_DIR, { recursive: true });
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(all, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save local order:", error);
  }
}

const orderInput = z.object({
  clientName: z.string().min(1),
  clientPhone: z.string().min(1),
  clientEmail: z.string().email().optional().nullable(),
  eventDate: z.string().min(1),
  style: z.string().min(1),
  size: z.string().min(1),
  details: z.string().optional().nullable(),
  referenceImage: z.string().optional().nullable(),
  estimatedPrice: z.number().int(),
  depositAmount: z.number().int(),
  paymentStatus: z.string().default("pending"),
  paymentId: z.string().optional().nullable(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  orders: router({
    create: publicProcedure.input(orderInput).mutation(async ({ input }) => {
      const db = await getDb();
      const newOrder = {
        ...input,
        createdAt: new Date(),
      };

      if (db) {
        try {
          const [result] = await db.insert(orders).values(newOrder as any);
          const insertedId = (result as any).insertId || Math.floor(Math.random() * 100000);
          return {
            success: true,
            id: insertedId,
            orderCode: `RR-${insertedId}`,
            ...newOrder,
          };
        } catch (error) {
          console.error("Database insert order failed, using local fallback:", error);
        }
      }

      // Fallback a almacenamiento local JSON
      const insertedId = Math.floor(Math.random() * 10000) + 1000;
      const orderWithId = {
        id: insertedId,
        orderCode: `RR-${insertedId}`,
        ...newOrder,
      };
      saveLocalOrder(orderWithId);
      return {
        success: true,
        ...orderWithId,
      };
    }),
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (db) {
        try {
          return await db.select().from(orders);
        } catch (error) {
          console.error("Database select orders failed, using local fallback:", error);
        }
      }
      return getLocalOrders();
    }),
  }),
});

export type AppRouter = typeof appRouter;
