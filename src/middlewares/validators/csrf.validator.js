import { body } from "express-validator";

export const csrfTokenPresent = (fieldName = "CSRFToken") => [
  body(fieldName)
    .exists()
    .withMessage("CSRF token is missing")
    .bail()
    .notEmpty()
    .withMessage("CSRF token cannot be empty"),
];

export const csrfTokenValidFormat = (fieldName = "CSRFToken") => [
  body(fieldName)
    .isString()
    .isLength({ min: 20, max: 100 })
    .withMessage("CSRF token has invalid format"),
];