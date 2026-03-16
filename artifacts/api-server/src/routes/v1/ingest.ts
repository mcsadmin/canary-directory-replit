/**
 * Invoice ingestion route (ADR-026)
 * POST /api/v1/ingest — multipart CSV upload
 */

import { Router } from "express";
import multer from "multer";
import { db } from "@workspace/db";
import { ingestCsvFile } from "../../services/ingestionService.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const creditorId = req.body?.creditor_id;
    const file = req.file;

    if (!creditorId) {
      return res.status(400).json({ error: "Bad request", message: "creditor_id is required" });
    }
    if (!file) {
      return res.status(400).json({ error: "Bad request", message: "file is required" });
    }

    const summary = await ingestCsvFile(file.buffer, file.originalname, creditorId, db);

    res.json({
      filename: summary.filename,
      total_rows: summary.total_rows,
      new_invoices: summary.new_invoices,
      pending_invoices: summary.pending_invoices,
      new_nodes: summary.new_nodes,
      new_review_items: summary.new_review_items,
    });
  } catch (err: any) {
    if (err?.message?.includes("not found")) {
      return res.status(404).json({ error: "Not found", message: err.message });
    }
    console.error("POST /ingest error:", err);
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
