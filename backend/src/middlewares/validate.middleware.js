import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

/**
 * Returns an Express middleware that validates `req.body` against a Zod schema.
 * On success the parsed (and coerced) value replaces `req.body`.
 * On failure it throws a 400 ApiError whose `errors` array lists each issue.
 */
export const validateBody = (schema) => (req, _res, next) => {
  try {
    req.body = schema.parse(req.body ?? {});
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.issues.map((i) => ({
        field: i.path.join(".") || "(body)",
        message: i.message,
      }));
      return next(new ApiError(400, "Validation failed", errors));
    }
    return next(err);
  }
};
