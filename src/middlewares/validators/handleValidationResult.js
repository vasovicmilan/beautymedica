import { validationResult } from "express-validator";

export function handleValidationResult(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const extracted = errors.array().map((err) => ({
    field: err.param,
    msg: err.msg,
  }));

  if (req.xhr || req.path.startsWith("/api")) {
    return res.status(400).json({
      statusCode: 400,
      message: "Validation failed",
      errors: extracted,
    });
  }

  req.session.flash = {
    type: "danger",
    message: "Molimo ispravite greške u formi.",
    errors: extracted,
    oldBody: req.body,
  };
  return res.redirect("back");
}