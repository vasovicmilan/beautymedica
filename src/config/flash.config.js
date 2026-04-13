export function setupFlash(app) {
  app.use((req, res, next) => {
    if (!req.session) return next();

    res.locals.flash = req.session.flash || null;
    delete req.session.flash;

    next();
  });
}
