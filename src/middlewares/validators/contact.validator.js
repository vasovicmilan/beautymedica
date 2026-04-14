import { body } from "express-validator";
import { sanitizeBody } from "../../utils/sanitize.util.js";
import { handleValidationResult } from "./handleValidationResult.js";

export const validateCreateContact = [
  sanitizeBody,

  body("firstName")
    .exists().withMessage("firstName is required")
    .bail()
    .isString().trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("firstName must be 2-50 characters"),

  body("lastName")
    .optional()
    .isString().trim()
    .isLength({ max: 50 })
    .withMessage("lastName too long"),

  body("email")
    .exists().withMessage("email is required")
    .bail()
    .isEmail().withMessage("email invalid")
    .normalizeEmail({ gmail_remove_dots: false }),

  body("phone")
    .optional()
    .isMobilePhone("any", { strictMode: false })
    .withMessage("phone must be a valid phone number"),

  body("title")
    .exists().withMessage("title is required")
    .bail()
    .isString().trim()
    .isLength({ min: 3, max: 150 })
    .withMessage("title must be 3-150 characters"),

  body("message")
    .exists().withMessage("message is required")
    .bail()
    .isString()
    .isLength({ min: 5, max: 5000 })
    .withMessage("message must be 5-5000 characters"),

  body("acceptance")
    .exists().withMessage("acceptance is required")
    .bail()
    .custom((v) => v === true || v === "true")
    .withMessage("acceptance must be true"),

  body("type")
    .optional()
    .isIn(["contact", "reservation", "question", "complaint"])
    .withMessage("invalid type"),

  handleValidationResult,
];