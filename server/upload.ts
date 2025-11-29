import { Request, Response } from "express";
import { storagePut } from "./storage";

export async function handleFileUpload(req: Request, res: Response) {
  try {
    const file = (req as any).file;
    const key = req.body.key;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { url } = await storagePut(key, file.buffer, file.mimetype);

    res.json({ url, key });
  } catch (error: any) {
    console.error("[Upload] Error:", error);
    res.status(500).json({ error: error.message || "Upload failed" });
  }
}
