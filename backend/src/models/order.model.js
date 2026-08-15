import sequelize from "../db/index.js"
import { DataTypes } from "sequelize"

const Order = sequelize.define(
    "Order",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        userId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: "user_id",
        },

        orderNumber: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            field: "order_number",
        },

        status: {
            type: DataTypes.ENUM(
                "PENDING",
                "PROCESSING",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED"
            ),
            allowNull: false,
            defaultValue: "PENDING",
        },

        totalAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            field: "total_amount",
        },

        discountAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
            field: "discount_amount",
        },

        shippingFee: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
            field: "shipping_fee",
        },

        couponId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: "coupon_id",
        },

        shippingAddressId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "shipping_address_id",
        },

        billingAddressId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "billing_address_id",
        },

        trackingNumber: {
            type: DataTypes.STRING(150),
            allowNull: true,
            field: "tracking_number",
        },
    },
    {
        tableName: "orders",
        timestamps: true,
        updatedAt: false,
        underscored: true,
    }
);

export default Order;