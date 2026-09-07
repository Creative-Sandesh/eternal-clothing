import path from "path";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const UPLOAD_DIR = path.resolve("public/uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
  },
});

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

export const uploadImages = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) return cb(null, true);
    cb(new ApiError(400, "Only JPEG, PNG, WebP, AVIF or GIF images are allowed"));
  },
}).array("images", 8);
