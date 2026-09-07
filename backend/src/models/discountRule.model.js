import sequelize from "../db/index.js";
import { DataTypes } from "sequelize";

/**
 * A cart-level discount applied automatically at checkout (no code needed).
 *  trigger: MIN_SUBTOTAL | MIN_ITEMS   → threshold
 *  reward:  FREE_SHIPPING | PERCENT_OFF | FIXED_OFF  → rewardValue (ignored for FREE_SHIPPING)
 */
const DiscountRule = sequelize.define(
  "DiscountRule",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(150), allowNull: false },

    trigger: { type: DataTypes.ENUM("MIN_SUBTOTAL", "MIN_ITEMS"), allowNull: false, defaultValue: "MIN_SUBTOTAL" },
    threshold: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },

    reward: { type: DataTypes.ENUM("FREE_SHIPPING", "PERCENT_OFF", "FIXED_OFF"), allowNull: false, defaultValue: "FREE_SHIPPING" },
    rewardValue: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: "reward_value" },

    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: "is_active" },
    priority: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { tableName: "discount_rules", timestamps: true, underscored: true }
);

export default DiscountRule;
