import User from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper to generate access and refresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber } = req.body;

  // Validate fields
  if ([firstName, lastName, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "First name, last name, email, and password are required");
  }

  // Check if user already exists
  const existedUser = await User.findOne({ where: { email } });
  if (existedUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Create user - note password is passed to passwordHash so the model's beforeSave hook hashes it.
  const user = await User.create({
    firstName,
    lastName,
    email,
    passwordHash: password,
    phoneNumber,
    role: "CUSTOMER"
  });

  const createdUser = await User.findByPk(user.id, {
    attributes: { exclude: ["passwordHash"] }
  });

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

  // Find user
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Verify password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user.id);

  // Exclude password hash from response
  const loggedInUser = await User.findByPk(user.id, {
    attributes: { exclude: ["passwordHash"] }
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser
};
