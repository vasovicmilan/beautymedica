import pino from "pino";

const isProd = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

let transport;

if (!isProd && !isTest) {
  transport = pino.transport({
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:dd.mm.yyyy HH:MM:ss",
      ignore: "pid,hostname",
    },
  });
}

const logger = pino(
  {
    level: isTest ? "silent" : process.env.LOG_LEVEL || "info",
  },
  transport
);

// sprečava crash ako logging stream pukne
logger.on("error", (err) => {
  console.error("Logger stream error:", err);
});

export default logger;
