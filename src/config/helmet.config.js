import helmet from "helmet";

/*
------------------------------------------------
HELPERS
------------------------------------------------
*/

function isLocalHost(hostname) {
  if (!hostname) return true;

  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("172.")
  );
}

function isHTTPS(req) {
  return req.secure || req.headers["x-forwarded-proto"] === "https";
}

/*
------------------------------------------------
COMMON SECURITY OPTIONS
------------------------------------------------
*/

function commonSecurity() {
  return {
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-site" },

    referrerPolicy: {
      policy: "no-referrer",
    },

    frameguard: {
      action: "sameorigin",
    },

    hidePoweredBy: true,
    noSniff: true,
  };
}

/*
------------------------------------------------
WEB HELMET
------------------------------------------------
*/

export function setupHelmetWeb(app) {
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith("/api")) return next();

    const hostname = req.hostname;
    const https = isHTTPS(req);
    const local = isLocalHost(hostname);

    const MAPS = [
      "https://www.google.com",
      "https://maps.google.com",
      "https://www.google.com/maps",
    ];

    return helmet({
      ...commonSecurity(),

      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],

          scriptSrc: [
            "'self'",
            "https://cdn.jsdelivr.net",
            "https://static.cloudflareinsights.com"
          ],

          styleSrc: [
            "'self'",
            "https://fonts.googleapis.com",
            "https://cdn.jsdelivr.net",
          ],

          fontSrc: [
            "'self'",
            "https://fonts.gstatic.com",
            "data:",
          ],

          imgSrc: [
            "'self'",
            "data:",
            "blob:",
          ],

          mediaSrc: [
            "'self'",
            "blob:",
          ],

          connectSrc: [
            "'self'",
          ],

          baseUri: ["'self'"],

          frameSrc: [
            "'self'",
            ...MAPS,
          ],

          childSrc: [
            "'self'",
            ...MAPS,
          ],

          objectSrc: ["'none'"],

          frameAncestors: ["'self'"],

          formAction: ["'self'"],
        },
      },
      hsts: !local && https
        ? {
          maxAge: 31536000,
          includeSubDomains: true,
        }
        : false,
    })(req, res, next);
  });
}
