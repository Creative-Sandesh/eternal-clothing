import sequelize from "../db/index.js"
import { DataTypes } from "sequelize"
const Review = sequelize.define(
    "Review",
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

        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "user_id",
        },

        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            },
        },

        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        status: {
            type: DataTypes.ENUM(
                "PENDING",
                "APPROVED",
                "REJECTED"
            ),
            allowNull: false,
            defaultValue: "PENDING",
        },
    },
    {
        tableName: "reviews",
        timestamps: true,
        updatedAt: false,
        underscored: true,
    }
);

export default Review;