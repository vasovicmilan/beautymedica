import pino from "pino";

// ---------- Maskiranje osetljivih podataka ----------
const SENSITIVE_KEYS = new Set([
  "password", "pass", "pwd", "creditCard", "cardNumber", "cvv",
  "token", "accessToken", "resetToken", "secret"
]);

export function maskSensitive(obj, mask = "***") {
  if (!obj || typeof obj !== "object") return obj;
  const out = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    try {
      const val = obj[key];
      if (SENSITIVE_KEYS.has(String(key).toLowerCase())) {
        out[key] = mask;
      } else if (typeof val === "object" && val !== null) {
        out[key] = maskSensitive(val, mask);
      } else {
        out[key] = val;
      }
    } catch (e) {
      out[key] = "[unserializable]";
    }
  }
  return out;
}

// ---------- Pino konfiguracija ----------
const isProd = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

const transport = !isProd && !isTest
  ? pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:dd.mm.yyyy HH:MM:ss",
        ignore: "pid,hostname",
      },
    })
  : undefined;

const logger = pino(
  {
    level: isTest ? "silent" : process.env.LOG_LEVEL || "info",
    serializers: {
      req: (req) => maskSensitive(req),
      res: (res) => res,
      err: (err) => ({
        type: err.name,
        message: err.message,
        stack: isProd ? undefined : err.stack,
      }),
    },
  },
  transport
);

logger.on("error", (err) => console.error("Logger stream error:", err));

export default logger;