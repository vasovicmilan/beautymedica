export function setupLocals(app) {
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith("/api")) return next();

    res.locals.isAuthenticated = Boolean(req.session?.user);
    // res.locals.user = req.session?.user || null;
    res.locals.role = req.session?.user?.role || "guest";
    res.locals.path = req.path;
    next();
  });
}
