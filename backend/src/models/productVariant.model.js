import {
    DataTypes
} from "sequelize";
import sequelize from "../db/index.js"

const ProductVariant = sequelize.define(
    "ProductVariant",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        productId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "product_id",
        },

        size: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },

        colorName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: "color_name",
        },

        colorHex: {
            type: DataTypes.STRING(7),
            allowNull: false,
            field: "color_hex",
        },

        sku: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },

        stockQuantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: "stock_quantity",
        },

        priceOverride: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            field: "price_override",
        },
    },
    {
        tableName: "product_variants",
        timestamps: false,
        underscored: true,
    }
);

export default  ProductVariant;