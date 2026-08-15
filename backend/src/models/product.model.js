import sequelize from "../db/index.js"
import { DataTypes } from "sequelize"

const Product = sequelize.define(
    "Product",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        slug: {
            type: DataTypes.STRING(280),
            allowNull: false,
            unique: true,
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        details: {
            type: DataTypes.JSON,
            allowNull: true,
        },

        categoryId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "category_id",
        },

        collectionId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: "collection_id",
        },

        basePrice: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            field: "base_price",
        },

        originalPrice: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            field: "original_price",
        },

        material: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },

        skuPrefix: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: "sku_prefix",
        },

        images: {
            type: DataTypes.JSON,
            allowNull: true,
        },

        status: {
            type: DataTypes.ENUM(
                "DRAFT",
                "PUBLISHED",
                "ARCHIVED"
            ),
            allowNull: false,
            defaultValue: "DRAFT",
        },
    },
    {
        tableName: "products",
        timestamps: true,
        underscored: true,
    }
);

export default Product