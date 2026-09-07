import sequelize from "../db/index.js";
import { DataTypes } from "sequelize";

const Banner = sequelize.define(
  "Banner",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    // "TOP_BAR" | "HERO" | "CATEGORY" | "SALE" | "FOOTER"
    position: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "TOP_BAR" },

    title: { type: DataTypes.STRING(200), allowNull: false },
    content: { type: DataTypes.STRING(300), allowNull: true },
    ctaText: { type: DataTypes.STRING(60), allowNull: true, field: "cta_text" },
    ctaLink: { type: DataTypes.STRING(255), allowNull: true, field: "cta_link" },
    imageUrl: { type: DataTypes.STRING(500), allowNull: true, field: "image_url" },

    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: "is_active" },

    startDate: { type: DataTypes.DATEONLY, allowNull: true, field: "start_date" },
    endDate: { type: DataTypes.DATEONLY, allowNull: true, field: "end_date" },

    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: "sort_order" },
  },
  { tableName: "banners", timestamps: true, underscored: true }
);

export default Banner;
