import sequelize from "../db/index.js";
import { DataTypes } from "sequelize";

const NewsletterSubscriber = sequelize.define(
  "NewsletterSubscriber",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },

    // "CHECKOUT" | "WEBSITE" | "SOCIAL" | "IMPORT" | "ADMIN"
    source: { type: DataTypes.STRING(30), allowNull: false, defaultValue: "WEBSITE" },

    status: {
      type: DataTypes.ENUM("ACTIVE", "UNSUBSCRIBED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  { tableName: "newsletter_subscribers", timestamps: true, underscored: true }
);

export default NewsletterSubscriber;
