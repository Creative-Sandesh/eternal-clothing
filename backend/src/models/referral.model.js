import sequelize from "../db/index.js";
import { DataTypes } from "sequelize";

const Referral = sequelize.define(
  "Referral",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    referrerId: { type: DataTypes.UUID, allowNull: false, field: "referrer_id" },
    refereeId: { type: DataTypes.UUID, allowNull: false, field: "referee_id" },

    // PENDING until the referee places their first paid order, then COMPLETED.
    status: {
      type: DataTypes.ENUM("PENDING", "COMPLETED"),
      allowNull: false,
      defaultValue: "PENDING",
    },

    rewardPoints: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: "reward_points" },
    completedAt: { type: DataTypes.DATE, allowNull: true, field: "completed_at" },
  },
  {
    tableName: "referrals",
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [{ unique: true, fields: ["referee_id"] }],
  }
);

export default Referral;
