import User from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getCurrentProfile = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User profile retrieved successfully"));
});

const updateCurrentProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phoneNumber } = req.body;

  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updates = {};
  if (firstName !== undefined) updates.firstName = firstName;
  if (lastName !== undefined) updates.lastName = lastName;
  if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;

  await user.update(updates);

  // Retrieve updated user excluding password
  const updatedUser = await User.findByPk(req.user.id, {
    attributes: { exclude: ["passwordHash"] }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }

  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect old password");
  }

  // Set plain text new password, model beforeSave hook hashes it.
  user.passwordHash = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCustomers = asyncHandler(async (req, res) => {
  const customers = await User.findAll({
    where: { role: "CUSTOMER" },
    attributes: { exclude: ["passwordHash"] }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, customers, "Customers fetched successfully"));
});

const getCustomerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const customer = await User.findOne({
    where: { id, role: "CUSTOMER" },
    attributes: { exclude: ["passwordHash"] }
  });

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, customer, "Customer details fetched successfully"));
});

export {
  getCurrentProfile,
  updateCurrentProfile,
  changePassword,
  getCustomers,
  getCustomerById
};
