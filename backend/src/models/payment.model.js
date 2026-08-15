import sequelize from "../db/index.js"
import { DataTypes } from "sequelize"

const Payment = sequelize.define(
    "Payment",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        orderId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "order_id",
        },

        paymentMethod: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: "payment_method",
        },

        transactionId: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: "transaction_id",
        },

        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },

        status: {
            type: DataTypes.ENUM(
                "PENDING",
                "COMPLETED",
                "FAILED",
                "REFUNDED"
            ),
            allowNull: false,
            defaultValue: "PENDING",
        },
    },
    {
        tableName: "payments",
        timestamps: true,
        updatedAt: false,
        underscored: true,
    }
);

export default Payment;