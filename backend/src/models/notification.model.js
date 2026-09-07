import sequelize from "../db/index.js";
import { DataTypes } from "sequelize";

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
    },

    // e.g. ORDER_PLACED, ORDER_SHIPPED, ORDER_DELIVERED, ORDER_CANCELLED,
    //      ORDER_REFUNDED, REVIEW_APPROVED, REVIEW_REJECTED, LOYALTY_EARNED
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    // Optional in-app link, e.g. "/account/orders/<id>"
    link: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_read",
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
    updatedAt: false,
    underscored: true,
  }
);

export default Notification;
