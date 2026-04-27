import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { httpLogger } from "./config/morgan.config.js";

import routes from "./routes/index.routes.js";


import { setupMethodOverride } from "./config/method.override.config.js";
import { setupHelmetWeb } from "./config/helmet.config.js";
import { setupStatic } from "./config/static.config.js";
import { setupSession } from "./config/session.config.js";
import { setupFlash } from "./config/flash.config.js";
import { setupSanitize } from "./config/sanitize.config.js";
import { setupLocals } from "./config/locals.config.js";
import { setupViewEngine } from "./config/view.engine.config.js";
import logger from "./config/logger.config.js";

import { csrfLocals, csrfWebOnly } from "./config/csrf.config.js";
import { globalErrorHandler, notFoundHandler } from "./utils/error.util.js";

import { fileURLToPath } from 'url';
import path from 'path';
import "./models/category.model.js";
import "./models/tag.model.js";
import "./models/user.model.js";
import "./models/role.model.js";
import "./models/post.model.js";
import "./models/service.model.js";
import "./models/expert.model.js";
import "./models/employee.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

app.disable("x-powered-by");

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// app.use(globalLimiter);

setupMethodOverride(app);

setupSanitize(app);
setupViewEngine(app);

// setupHelmetWeb(app);

setupStatic(app);

setupSession(app);
setupFlash(app);

app.use(csrfLocals);
app.use(csrfWebOnly);

setupLocals(app);

app.use(httpLogger);

app.use(routes);

app.use(notFoundHandler);

app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;

try {
  await mongoose.connect(process.env.MONGO_URI);
  logger.info("📦 MongoDB connected");

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
  });

} catch (error) {
    console.error(error);
  logger.error("❌ Startup error:", error);
  process.exit(1);
}