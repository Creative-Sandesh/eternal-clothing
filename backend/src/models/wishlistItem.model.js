import sequelize from "../db/index.js"
import { DataTypes } from "sequelize"
const WishlistItem = sequelize.define(
    "WishlistItem",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        wishlistId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "wishlist_id",
        },

        productId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "product_id",
        },

        addedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: "added_at",
        },
    },
    {
        tableName: "wishlist_items",
        timestamps: false,
        underscored: true,
    }
);

export default WishlistItem;