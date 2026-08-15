import { Col } from "sequelize/lib/utils";
import sequelize from "../db/index.js"
import { DataTypes } from "sequelize"

const Collection = sequelize.define(
    "Collection",
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
    },
    {
        tableName: "collections",
        timestamps: false,
        underscored: true,
    }
);

export default Collection;