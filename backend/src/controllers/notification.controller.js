import Notification from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.findAll({
    where: { userId: req.user.id },
    order: [["createdAt", "DESC"]],
    limit: 100
  });

  const unreadCount = await Notification.count({
    where: { userId: req.user.id, isRead: false }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { unreadCount, notifications }, "Notifications fetched successfully"));
});

const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    where: { id: req.params.id, userId: req.user.id }
  });
  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }
  await notification.update({ isRead: true });
  return res.status(200).json(new ApiResponse(200, notification, "Notification marked as read"));
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.update(
    { isRead: true },
    { where: { userId: req.user.id, isRead: false } }
  );
  return res.status(200).json(new ApiResponse(200, {}, "All notifications marked as read"));
});

const deleteNotification = asyncHandler(async (req, res) => {
  const deleted = await Notification.destroy({
    where: { id: req.params.id, userId: req.user.id }
  });
  if (!deleted) {
    throw new ApiError(404, "Notification not found");
  }
  return res.status(200).json(new ApiResponse(200, {}, "Notification deleted"));
});

export { getMyNotifications, markRead, markAllRead, deleteNotification };
