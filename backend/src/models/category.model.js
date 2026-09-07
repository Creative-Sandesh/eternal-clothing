import sequelize from "../db/index.js"
import { DataTypes } from "sequelize"

const Category = sequelize.define(
    "Category",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },

        slug: {
            type: DataTypes.STRING(180),
            allowNull: false,
            unique: true,
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        imageUrl: {
            type: DataTypes.STRING(500),
            allowNull: true,
            field: "image_url",
        },

        sortOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: "sort_order",
        },
    },
    {
        tableName: "categories",
        timestamps: false,
        underscored: true,
    }
);

export default  Category;