import sequelize from "../db/index.js"
import { DataTypes } from "sequelize"

const User = sequelize.define("User", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true

    },
    firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "first_name"

    },
    lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "last_name"
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },

    passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "password_hash",
    },

    role: {
        type: DataTypes.ENUM(
            "CUSTOMER",
            "STAFF",
            "ADMIN"
        ),
        allowNull: false,
        defaultValue: "CUSTOMER",
    },
    phoneNumber: {
        type: DataTypes.STRING(30),
        allowNull: true,
        field: "phone_number",
    },

    loyaltyPointsBalance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "loyalty_points_balance",
    },
},
    {
        tableName: "users",
        timestamps: true,
        underscored: true,
    }

)

export default User;