import Notification from "../models/notification.model.js";

/**
 * Create an in-app notification for a user. Never throws — a notification
 * failure must not break the action that triggered it.
 * Pass a transaction via `options.transaction` when called inside one.
 */
export const notify = async (userId, { type, title, message, link = null }, options = {}) => {
  if (!userId) return null;
  try {
    return await Notification.create(
      { userId, type, title, message, link },
      options.transaction ? { transaction: options.transaction } : {}
    );
  } catch (err) {
    console.error("notify() failed:", err.message);
    return null;
  }
};
