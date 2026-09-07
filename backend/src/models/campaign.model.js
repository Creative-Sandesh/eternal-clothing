import sequelize from "../db/index.js";
import { DataTypes } from "sequelize";

const Campaign = sequelize.define(
  "Campaign",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    name: { type: DataTypes.STRING(150), allowNull: false },

    type: {
      type: DataTypes.ENUM("EMAIL", "SMS", "PUSH"),
      allowNull: false,
      defaultValue: "EMAIL",
    },

    status: {
      type: DataTypes.ENUM("DRAFT", "SCHEDULED", "SENDING", "COMPLETED", "CANCELLED"),
      allowNull: false,
      defaultValue: "DRAFT",
    },

    subject: { type: DataTypes.STRING(255), allowNull: true },
    body: { type: DataTypes.TEXT, allowNull: true },

    // "ALL" | "CUSTOMERS" | "SUBSCRIBERS"
    audience: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "SUBSCRIBERS" },

    scheduledAt: { type: DataTypes.DATE, allowNull: true, field: "scheduled_at" },
    sentAt: { type: DataTypes.DATE, allowNull: true, field: "sent_at" },

    recipientCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: "recipient_count" },
    openCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: "open_count" },
    clickCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: "click_count" },
  },
  { tableName: "campaigns", timestamps: true, underscored: true }
);

export default Campaign;
