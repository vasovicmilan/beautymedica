export function attachUserToRequest(req, res, next) {
  req.user = req.session?.user || null;
  next();
}