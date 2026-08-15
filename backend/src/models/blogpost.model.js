import sequelize from "../db/index.js"
import {DataTypes} from "sequelize"

const BlogPost = sequelize.define(
    "BlogPost",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        slug: {
            type: DataTypes.STRING(280),
            allowNull: false,
            unique: true,
        },

        content: {
            type: DataTypes.TEXT("long"),
            allowNull: false,
        },

        authorId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "author_id",
        },

        publishedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: "published_at",
        },
    },
    {
        tableName: "blog_posts",
        timestamps: true,
        underscored: true,
    }
);

export default  BlogPost;