import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";
import { ensureReferralCode } from "../utils/referral.js";
import Referral from "../models/referral.model.js";

const PUBLIC_ATTRS = { exclude: ["passwordHash", "refreshToken", "resetPasswordToken", "resetPasswordExpires"] };

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict"
};

// Helper to generate access + refresh tokens and persist the refresh token.
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validate: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, referralCode } = req.body;

  // Validate fields
  if ([firstName, lastName, email, password].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "First name, last name, email, and password are required");
  }

  // Check if user already exists
  const existedUser = await User.findOne({ where: { email } });
  if (existedUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Resolve an optional referral code to the referrer.
  let referrer = null;
  if (referralCode) {
    referrer = await User.findOne({ where: { referralCode: String(referralCode).toUpperCase().trim() } });
  }

  // Create user - note password is passed to passwordHash so the model's beforeSave hook hashes it.
  const user = await User.create({
    firstName,
    lastName,
    email,
    passwordHash: password,
    phoneNumber,
    role: "CUSTOMER",
    referredBy: referrer ? referrer.id : null
  });

  // Give every user their own referral code, and record the pending referral.
  await ensureReferralCode(user);
  if (referrer && referrer.id !== user.id) {
    await Referral.create({ referrerId: referrer.id, refereeId: user.id, status: "PENDING" });
  }

  const createdUser = await User.findByPk(user.id, { attributes: PUBLIC_ATTRS });

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user.id);

  const loggedInUser = await User.findByPk(user.id, { attributes: PUBLIC_ATTRS });

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  if (req.user?.id) {
    await User.update({ refreshToken: null }, { where: { id: req.user.id } });
  }

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Exchange a valid refresh token for a fresh access + refresh token pair.
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findByPk(decoded.id);
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is no longer valid");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user.id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed"));
});

// Issue a password-reset token. In production this would be emailed; here we
// return it in the response body outside production so the flow is testable.
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ where: { email } });

  // Always respond 200 so the endpoint can't be used to enumerate accounts.
  const genericResponse = new ApiResponse(
    200,
    {},
    "If an account exists for that email, a reset link has been sent"
  );

  if (!user) {
    return res.status(200).json(genericResponse);
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validate: false });

  const { delivered } = await sendPasswordResetEmail(user.email, rawToken);

  // Only expose the raw token in the response when we could NOT email it and
  // we're not in production — this keeps local dev / tests working.
  const payload =
    !delivered && process.env.NODE_ENV !== "production" ? { resetToken: rawToken } : {};

  return res
    .status(200)
    .json(new ApiResponse(200, payload, genericResponse.message));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    throw new ApiError(400, "token and newPassword are required");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({ where: { resetPasswordToken: hashedToken } });
  if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
    throw new ApiError(400, "Reset token is invalid or has expired");
  }

  user.passwordHash = newPassword; // hashed by beforeSave hook
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  user.refreshToken = null; // force re-login everywhere
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password has been reset successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword
};
