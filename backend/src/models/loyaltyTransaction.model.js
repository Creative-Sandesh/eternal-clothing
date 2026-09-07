import sequelize from "../db/index.js";
import { DataTypes } from "sequelize";

const LoyaltyTransaction = sequelize.define(
  "LoyaltyTransaction",
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

    orderId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "order_id",
    },

    // Positive = credited, negative = spent/reversed.
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("EARNED", "REDEEMED", "ADJUSTMENT"),
      allowNull: false,
    },

    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "loyalty_transactions",
    timestamps: true,
    updatedAt: false,
    underscored: true,
  }
);

export default LoyaltyTransaction;
