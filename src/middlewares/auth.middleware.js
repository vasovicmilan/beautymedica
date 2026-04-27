export function ensureAuthenticated(req, res, next) {
  if (req.session.isLoggedIn && req.session.user) {
    return next();
  }
  req.session.flash = { type: 'warning', message: 'Morate se prijaviti za pristup ovoj stranici.' };
  req.session.returnTo = req.originalUrl;
  res.redirect('/auth/prijava');
}

export function ensureRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.session.isLoggedIn || !req.session.user) {
      req.session.flash = { type: 'warning', message: 'Morate se prijaviti.' };
      req.session.returnTo = req.originalUrl;
      return res.redirect('/auth/prijava');
    }
    const userRole = req.session.user.role;
    if (allowedRoles.includes(userRole)) {
      return next();
    }
    req.session.flash = { type: 'danger', message: 'Nemate dozvolu za pristup ovoj stranici.' };
    res.status(403).redirect('/');
  };
}