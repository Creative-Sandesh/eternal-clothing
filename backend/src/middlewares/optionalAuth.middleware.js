import jwt from "jsonwebtoken";
import User from "../models/users.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Attaches req.user when a valid token is present, but never rejects the
 * request when one isn't. Use on endpoints that support both authenticated
 * and anonymous callers (e.g. guest checkout). A malformed or expired token
 * is treated the same as no token — the caller simply proceeds as a guest.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return next();
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findByPk(decodedToken.id, {
      attributes: { exclude: ["passwordHash", "refreshToken", "resetPasswordToken", "resetPasswordExpires"] },
    });
    if (user) {
      req.user = user;
    }
  } catch {
    // ignore — proceed unauthenticated
  }

  return next();
});

export { optionalAuth };
