import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_PATH = path.join(__dirname, "..", "public");

export const setupStatic = (app) => {
  app.use(
    express.static(PUBLIC_PATH, {
      etag: true,
      lastModified: true,
      maxAge: "7d",
      index: false,
    })
  );
};