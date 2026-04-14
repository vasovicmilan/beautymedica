import morgan from "morgan";
import logger from "./logger.config.js";

const isTest = process.env.NODE_ENV === "test";

export const httpLogger = (req, res, next) => {
  if (isTest) return next();

  const stream = {
    write: (message) => logger.info({ type: "http", msg: message.trim() }),
  };

  return morgan(":method :url :status :res[content-length] - :response-time ms", { stream })(req, res, next);
};