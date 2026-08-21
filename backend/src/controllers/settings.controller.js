import Setting from "../models/settings.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.findAll();

  // Convert to a neat key-value object for easier consumption by frontend
  const settingsMap = {};
  for (const setting of settings) {
    settingsMap[setting.key] = setting.value;
  }

  return res
    .status(200)
    .json(new ApiResponse(200, settingsMap, "Settings fetched successfully"));
});

const getSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;

  const setting = await Setting.findByPk(key);
  if (!setting) {
    throw new ApiError(404, `Setting "${key}" not found`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { key: setting.key, value: setting.value }, "Setting fetched successfully"));
});

const upsertSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (!key || value === undefined) {
    throw new ApiError(400, "Setting key and value are required");
  }

  const [setting, created] = await Setting.upsert({ key, value }, { returning: true });

  return res
    .status(created ? 201 : 200)
    .json(new ApiResponse(created ? 201 : 200, setting, `Setting "${key}" ${created ? "created" : "updated"} successfully`));
});

export { getAllSettings, getSetting, upsertSetting };
