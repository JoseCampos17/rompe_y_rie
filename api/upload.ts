import { put } from "@vercel/blob";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = { api: { bodyParser: { sizeLimit: "6mb" } } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { fileName, fileBase64, mimeType } = req.body as {
      fileName: string;
      fileBase64: string;
      mimeType: string;
    };

    if (!fileBase64 || !fileName) {
      return res.status(400).json({ error: "Archivo requerido" });
    }

    // If BLOB_READ_WRITE_TOKEN is not set (local dev), return a placeholder
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(200).json({
        url: `data:${mimeType};base64,${fileBase64.split(",").pop()}`,
        local: true,
      });
    }

    const base64Data = fileBase64.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const blob = await put(`comprobantes/${Date.now()}-${fileName}`, buffer, {
      access: "public",
      contentType: mimeType,
    });

    return res.status(200).json({ url: blob.url });
  } catch (err: any) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
