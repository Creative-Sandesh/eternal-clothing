import { Op, fn, col } from "sequelize";
import User from "../models/users.model.js";
import Order from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const PUBLIC_ATTRS = { exclude: ["passwordHash", "refreshToken", "resetPasswordToken", "resetPasswordExpires"] };

// Attach order count + lifetime spend (from PROCESSING/SHIPPED/DELIVERED orders) to a list of users.
const withOrderStats = async (users) => {
  if (users.length === 0) return [];
  const ids = users.map((u) => u.id);
  const rows = await Order.findAll({
    attributes: [
      "userId",
      [fn("COUNT", col("id")), "orderCount"],
      [fn("COALESCE", fn("SUM", col("total_amount")), 0), "totalSpent"]
    ],
    where: {
      userId: { [Op.in]: ids },
      status: { [Op.in]: ["PROCESSING", "SHIPPED", "DELIVERED"] }
    },
    group: ["userId"],
    raw: true
  });
  const byUser = Object.fromEntries(
    rows.map((r) => [r.userId, { orderCount: Number(r.orderCount), totalSpent: Number(r.totalSpent) }])
  );
  return users.map((u) => ({
    ...u.toJSON(),
    orderCount: byUser[u.id]?.orderCount ?? 0,
    totalSpent: byUser[u.id]?.totalSpent ?? 0
  }));
};

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

  const updatedUser = await User.findByPk(req.user.id, { attributes: PUBLIC_ATTRS });

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
    attributes: PUBLIC_ATTRS,
    order: [["createdAt", "DESC"]]
  });

  return res
    .status(200)
    .json(new ApiResponse(200, await withOrderStats(customers), "Customers fetched successfully"));
});

const getCustomerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const customer = await User.findOne({
    where: { id, role: "CUSTOMER" },
    attributes: PUBLIC_ATTRS
  });

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  const [withStats] = await withOrderStats([customer]);

  return res
    .status(200)
    .json(new ApiResponse(200, withStats, "Customer details fetched successfully"));
});

/*
|--------------------------------------------------------------------------
| Admin: staff / team management (ADMIN and STAFF users)
|--------------------------------------------------------------------------
*/

const getStaffUsers = asyncHandler(async (req, res) => {
  const staff = await User.findAll({
    where: { role: { [Op.in]: ["ADMIN", "STAFF"] } },
    attributes: PUBLIC_ATTRS,
    order: [["role", "ASC"], ["createdAt", "ASC"]]
  });

  return res
    .status(200)
    .json(new ApiResponse(200, staff, "Staff users fetched successfully"));
});

const createStaffUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, role = "STAFF" } = req.body;

  if (!firstName || !lastName || !email || !password) {
    throw new ApiError(400, "firstName, lastName, email and password are required");
  }

  const normalizedRole = String(role).toUpperCase();
  if (!["ADMIN", "STAFF"].includes(normalizedRole)) {
    throw new ApiError(400, "role must be ADMIN or STAFF");
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    passwordHash: password,
    phoneNumber,
    role: normalizedRole
  });

  const created = await User.findByPk(user.id, { attributes: PUBLIC_ATTRS });

  return res
    .status(201)
    .json(new ApiResponse(201, created, "Staff user created successfully"));
});

const updateStaffUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phoneNumber, role } = req.body;

  const user = await User.findByPk(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updates = {};
  if (firstName !== undefined) updates.firstName = firstName;
  if (lastName !== undefined) updates.lastName = lastName;
  if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;

  if (role !== undefined) {
    const normalizedRole = String(role).toUpperCase();
    if (!["ADMIN", "STAFF", "CUSTOMER"].includes(normalizedRole)) {
      throw new ApiError(400, "role must be ADMIN, STAFF or CUSTOMER");
    }
    // Don't allow an admin to demote the last remaining admin.
    if (user.role === "ADMIN" && normalizedRole !== "ADMIN") {
      const adminCount = await User.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        throw new ApiError(400, "Cannot change role of the last remaining admin");
      }
    }
    updates.role = normalizedRole;
  }

  await user.update(updates);

  const updated = await User.findByPk(id, { attributes: PUBLIC_ATTRS });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "User updated successfully"));
});

const deleteStaffUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === req.user.id) {
    throw new ApiError(400, "You cannot delete your own account");
  }

  const user = await User.findByPk(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "ADMIN") {
    const adminCount = await User.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      throw new ApiError(400, "Cannot delete the last remaining admin");
    }
  }

  await user.destroy();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

export {
  getCurrentProfile,
  updateCurrentProfile,
  changePassword,
  getCustomers,
  getCustomerById,
  getStaffUsers,
  createStaffUser,
  updateStaffUser,
  deleteStaffUser
};
