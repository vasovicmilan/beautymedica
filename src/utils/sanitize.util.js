import sanitizeHtml from "sanitize-html";

const SANITIZE_OPTS = {
  allowedTags: [],
  allowedAttributes: {},
};

function sanitizeString(val) {
  if (!val || typeof val !== "string") return val;
  return sanitizeHtml(val, SANITIZE_OPTS);
}

export function sanitizeBody(req, res, next) {
  const rec = (x) => {
    if (x === null || x === undefined) return x;
    if (typeof x === "string") return sanitizeString(x);
    if (Array.isArray(x)) return x.map(rec);
    if (typeof x === "object") {
      for (const k of Object.keys(x)) {
        x[k] = rec(x[k]);
      }
      return x;
    }
    return x;
  };
  if (req.body && typeof req.body === "object") {
    req.body = rec(req.body);
  }
  next();
}

export function cleanHtml(htmlString) {
  if (!htmlString || typeof htmlString !== "string") return htmlString;
  return sanitizeHtml(htmlString, SANITIZE_OPTS);
}

export function sanitizeQuery(req, res, next) {
  const rec = (x) => {
    if (x === null || x === undefined) return x;
    if (typeof x === "string") return sanitizeString(x);
    if (Array.isArray(x)) return x.map(rec);
    if (typeof x === "object") {
      for (const k of Object.keys(x)) {
        x[k] = rec(x[k]);
      }
      return x;
    }
    return x;
  };
  if (req.query && typeof req.query === "object") {
    req.query = rec(req.query);
  }
  next();
}