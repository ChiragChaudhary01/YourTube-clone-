import express from "express";
import { createDownload, listDownloads } from "../Controllers/download.js";

const router = express.Router();

router.post("/", createDownload);
router.get("/:userId", listDownloads);

export default router;


