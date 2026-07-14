import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { password } = req.body as { password: string };
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (password === adminPassword) {
    return res.status(200).json({ ok: true, token: adminPassword });
  }
  return res.status(401).json({ ok: false, error: "Contraseña incorrecta" });
}
