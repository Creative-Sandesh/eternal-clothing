import sequelize from "../db/index.js"
import {DataTypes} from "sequelize"

const Address = sequelize.define(
    "Address",
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
        },

        addressLine1: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: "address_line_1",
        },

        addressLine2: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: "address_line_2",
        },

        city: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        state: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        postalCode: {
            type: DataTypes.STRING(20),
            allowNull: false,
            field: "postal_code",
        },

        country: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        isDefaultShipping: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: "is_default_shipping",
        },

        isDefaultBilling: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: "is_default_billing",
        },
    },
    {
        tableName: "addresses",
        timestamps: false,
        underscored: true,
    }
);

export default Address;