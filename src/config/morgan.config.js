import morgan from "morgan";
import logger from "./logger.config.js";

export const httpLogger = (req, res, next) => {
  if (process.env.NODE_ENV === "test") return next();

  const stream = {
    write: (message) => {
      try {
        logger.info({ type: "http", msg: message.trim() });
      } catch (err) {
        console.error("HTTP logger error:", err);
      }
    },
  };

  return morgan(
    ":method :url :status :res[content-length] - :response-time ms",
    { stream }
  )(req, res, next);
};
