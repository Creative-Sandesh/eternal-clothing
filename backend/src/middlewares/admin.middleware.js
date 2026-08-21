import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized - User details not found");
  }

  if (req.user.role !== "ADMIN" && req.user.role !== "STAFF") {
    throw new ApiError(403, "Forbidden - Admin or Staff role required");
  }

  next();
});

export { verifyAdmin };
