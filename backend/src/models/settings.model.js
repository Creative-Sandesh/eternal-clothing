import sequelize from "../db/index.js"
import { DataTypes } from "sequelize"


const Setting = sequelize.define(
    "Setting",
    {
        key: {
            type: DataTypes.STRING(100),
            primaryKey: true,
            allowNull: false,
        },

        value: {
            type: DataTypes.JSON,
            allowNull: false,
        },
    },
    {
        tableName: "settings",
        timestamps: false,
        underscored: true,
    }
);

export default Setting;