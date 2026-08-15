import sequelize from "../db/index.js"
import { DataTypes } from "sequelize"
const Coupon = sequelize.define(
    "Coupon",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },

        discountType: {
            type: DataTypes.ENUM(
                "PERCENTAGE",
                "FIXED_AMOUNT"
            ),
            allowNull: false,
            field: "discount_type",
        },

        discountValue: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            field: "discount_value",
        },

        minPurchaseAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            field: "min_purchase_amount",
        },

        validFrom: {
            type: DataTypes.DATE,
            allowNull: false,
            field: "valid_from",
        },

        validUntil: {
            type: DataTypes.DATE,
            allowNull: false,
            field: "valid_until",
        },

        usageLimit: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: "usage_limit",
        },

        timesUsed: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: "times_used",
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: "is_active",
        },
    },
    {
        tableName: "coupons",
        timestamps: false,
        underscored: true,
    }
);

export default Coupon;