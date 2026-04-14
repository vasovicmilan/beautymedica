import { body } from "express-validator";

export const honeypot = (fieldName, errorMessage = "Spam detected") => [
  body(fieldName)
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === "") return true;

      return false;
    })
    .withMessage(errorMessage),
];
