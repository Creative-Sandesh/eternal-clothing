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

        // Set for guest (not-logged-in) checkouts so the order can still be
        // identified, confirmed and contacted. Null for account orders.
        guestEmail: {
            type: DataTypes.STRING(150),
            allowNull: true,
            field: "guest_email",
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

        subtotalAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
            field: "subtotal_amount",
        },

        taxAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
            field: "tax_amount",
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

        // Loyalty points spent on this order (0 when none). Their cash value is
        // already reflected in totalAmount; kept so a refund can restore them.
        loyaltyPointsUsed: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: "loyalty_points_used",
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
        underscored: true,
    }
);

export default Order;