import sequelize from "../db/index.js"
import { DataTypes } from "sequelize"
const OrderItem = sequelize.define(
    "OrderItem",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        orderId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "order_id",
        },

        productVariantId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "product_variant_id",
        },

        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        unitPrice: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            field: "unit_price",
        },
    },
    {
        tableName: "order_items",
        timestamps: false,
        underscored: true,
    }
);
export default OrderItem;