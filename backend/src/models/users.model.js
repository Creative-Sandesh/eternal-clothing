import sequelize from "../db/index.js"
import { DataTypes } from "sequelize"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

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

    refreshToken: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: "refresh_token",
    },

    resetPasswordToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "reset_password_token",
    },

    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "reset_password_expires",
    },

    // Referral programme
    referralCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
        field: "referral_code",
    },

    referredBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "referred_by",
    },
},
    {
        tableName: "users",
        timestamps: true,
        underscored: true,
    }

)

// Password hashing hook before save
User.beforeSave(async (user) => {
    if (user.changed('passwordHash')) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
    }
});

// Instance method to check password correctness
User.prototype.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.passwordHash);
};

// Instance method to generate Access Token
User.prototype.generateAccessToken = function() {
    return jwt.sign(
        {
            id: this.id,
            email: this.email,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

// Instance method to generate Refresh Token
User.prototype.generateRefreshToken = function() {
    return jwt.sign(
        {
            id: this.id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export default User;