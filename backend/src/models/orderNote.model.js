import sequelize from "../db/index.js";
import { DataTypes } from "sequelize";

const OrderNote = sequelize.define(
  "OrderNote",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    orderId: { type: DataTypes.UUID, allowNull: false, field: "order_id" },
    authorId: { type: DataTypes.UUID, allowNull: true, field: "author_id" },
    body: { type: DataTypes.TEXT, allowNull: false },
  },
  { tableName: "order_notes", timestamps: true, updatedAt: false, underscored: true }
);

export default OrderNote;
