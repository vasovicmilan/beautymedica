import { query } from "express-validator";
import { sanitizeQuery } from "../../utils/sanitize.util.js";
import { handleValidationResult } from "./handleValidationResult.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const validateSearch = ({
  defaultLimit = DEFAULT_LIMIT,
  maxLimit = MAX_LIMIT,
  allowedSortFields = null,
  defaultSort = null,
  defaultOrder = "desc",
} = {}) => {
  const validations = [
    sanitizeQuery,

    query("search")
      .optional()
      .isString().withMessage("search must be a string")
      .bail()
      .trim()
      .isLength({ max: 100 }).withMessage("search too long (max 100 chars)"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: maxLimit })
      .withMessage(`limit must be an integer between 1 and ${maxLimit}`)
      .bail()
      .customSanitizer((value) => {
        const num = parseInt(value, 10);
        return isNaN(num) ? defaultLimit : num;
      }),

    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("page must be an integer >= 1")
      .bail()
      .customSanitizer((value) => {
        const num = parseInt(value, 10);
        return isNaN(num) ? 1 : num;
      }),
  ];

  if (allowedSortFields && allowedSortFields.length) {
    validations.push(
      query("sort")
        .optional()
        .isIn(allowedSortFields)
        .withMessage(`sort must be one of: ${allowedSortFields.join(", ")}`)
        .default(defaultSort)
        .customSanitizer((value) => value || defaultSort),

      query("order")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage("order must be 'asc' or 'desc'")
        .default(defaultOrder)
        .customSanitizer((value) => value || defaultOrder)
    );
  }

  validations.push(handleValidationResult);

  return validations;
};

export function getSearchParams(req, defaultLimit = DEFAULT_LIMIT) {
  const limit = req.query.limit ? parseInt(req.query.limit) : defaultLimit;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const search = req.query.search || "";
  const sort = req.query.sort || null;
  const order = req.query.order || "desc";
  return { limit, page, search, sort, order };
}