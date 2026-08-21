import sequelize from "../db/index.js"
import { DataTypes } from "sequelize"

const Wishlist = sequelize.define(
    "Wishlist",
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
            unique: true,
        },
    },
    {
        tableName: "wishlists",
        timestamps: true,
        underscored: true,
    }
);

export default Wishlist;
