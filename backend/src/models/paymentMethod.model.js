import sequelize from "../db/index.js";
import { DataTypes } from "sequelize";

/**
 * A saved payment instrument. Real card numbers are NEVER stored — only a
 * provider token plus the display metadata (brand + last 4) that a real gateway
 * (Stripe, eSewa, Khalti) returns after tokenisation.
 */
const PaymentMethod = sequelize.define(
  "PaymentMethod",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    userId: { type: DataTypes.UUID, allowNull: false, field: "user_id" },

    // "CARD" | "ESEWA" | "KHALTI" | "COD"
    type: { type: DataTypes.STRING(20), allowNull: false },

    label: { type: DataTypes.STRING(100), allowNull: true },

    brand: { type: DataTypes.STRING(30), allowNull: true },      // Visa / Mastercard / eSewa / Khalti
    last4: { type: DataTypes.STRING(4), allowNull: true },
    expiryMonth: { type: DataTypes.INTEGER, allowNull: true, field: "expiry_month" },
    expiryYear: { type: DataTypes.INTEGER, allowNull: true, field: "expiry_year" },

    // Opaque token from the provider — safe to store.
    providerToken: { type: DataTypes.STRING(255), allowNull: true, field: "provider_token" },

    isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: "is_default" },
  },
  { tableName: "payment_methods", timestamps: true, underscored: true }
);

export default PaymentMethod;
