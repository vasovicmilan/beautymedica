import { csrfSync } from "csrf-sync";

export const { csrfSynchronisedProtection, generateToken } = csrfSync({
  getTokenFromRequest: (req) =>
    req.body?.CSRFToken ||
    req.query?.CSRFToken ||
    req.get("x-csrf-token") ||
    req.get("CSRF-Token") ||
    req.get("X-CSRF-Token") 
});

export function csrfWebOnly(req, res, next) {
  const method = req.method?.toUpperCase();
  const needsProtection = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  if (!needsProtection) return next();

  return csrfSynchronisedProtection(req, res, next);
}

export function csrfLocals(req, res, next) {
  const method = req.method?.toUpperCase();
  if (method !== "GET") return next();

  if (!req.session) return next();

  if (!req.session.__csrfInit) {
    req.session.__csrfInit = true;
  }

  res.locals.csrfToken = generateToken(req);

  req.session.save((error) => {
    if (error) return next(error);
    return next();
  });
}
