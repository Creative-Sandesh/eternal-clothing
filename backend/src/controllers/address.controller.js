import Address from "../models/address.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.findAll({ where: { userId: req.user.id } });
  return res
    .status(200)
    .json(new ApiResponse(200, addresses, "Addresses fetched successfully"));
});

const createAddress = asyncHandler(async (req, res) => {
  const {
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    isDefaultShipping = false,
    isDefaultBilling = false
  } = req.body;

  if (!addressLine1 || !city || !postalCode || !country) {
    throw new ApiError(400, "Missing required address fields");
  }

  // If setting as default shipping, reset others for this user
  if (isDefaultShipping) {
    await Address.update(
      { isDefaultShipping: false },
      { where: { userId: req.user.id, isDefaultShipping: true } }
    );
  }

  // If setting as default billing, reset others for this user
  if (isDefaultBilling) {
    await Address.update(
      { isDefaultBilling: false },
      { where: { userId: req.user.id, isDefaultBilling: true } }
    );
  }

  const address = await Address.create({
    userId: req.user.id,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    isDefaultShipping,
    isDefaultBilling
  });

  return res
    .status(201)
    .json(new ApiResponse(201, address, "Address created successfully"));
});

const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    isDefaultShipping,
    isDefaultBilling
  } = req.body;

  const address = await Address.findOne({ where: { id, userId: req.user.id } });
  if (!address) {
    throw new ApiError(404, "Address not found or unauthorized");
  }

  const updates = {};
  if (addressLine1 !== undefined) updates.addressLine1 = addressLine1;
  if (addressLine2 !== undefined) updates.addressLine2 = addressLine2;
  if (city !== undefined) updates.city = city;
  if (state !== undefined) updates.state = state;
  if (postalCode !== undefined) updates.postalCode = postalCode;
  if (country !== undefined) updates.country = country;

  if (isDefaultShipping === true) {
    await Address.update(
      { isDefaultShipping: false },
      { where: { userId: req.user.id, isDefaultShipping: true } }
    );
    updates.isDefaultShipping = true;
  } else if (isDefaultShipping === false) {
    updates.isDefaultShipping = false;
  }

  if (isDefaultBilling === true) {
    await Address.update(
      { isDefaultBilling: false },
      { where: { userId: req.user.id, isDefaultBilling: true } }
    );
    updates.isDefaultBilling = true;
  } else if (isDefaultBilling === false) {
    updates.isDefaultBilling = false;
  }

  await address.update(updates);

  return res
    .status(200)
    .json(new ApiResponse(200, address, "Address updated successfully"));
});

const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const address = await Address.findOne({ where: { id, userId: req.user.id } });
  if (!address) {
    throw new ApiError(404, "Address not found or unauthorized");
  }

  await address.destroy();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Address deleted successfully"));
});

export {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress
};
