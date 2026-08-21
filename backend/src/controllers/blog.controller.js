import { Op } from "sequelize";
import BlogPost from "../models/blogpost.model.js";
import User from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { slugify } from "../utils/slugify.js";

const getBlogPosts = asyncHandler(async (req, res) => {
  const posts = await BlogPost.findAll({
    where: {
      publishedAt: {
        [Op.lte]: new Date()
      }
    },
    include: [{ model: User, as: "author", attributes: ["firstName", "lastName"] }],
    order: [["publishedAt", "DESC"]]
  });

  return res
    .status(200)
    .json(new ApiResponse(200, posts, "Blog posts retrieved successfully"));
});

const getBlogPostBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const post = await BlogPost.findOne({
    where: {
      slug,
      publishedAt: {
        [Op.lte]: new Date()
      }
    },
    include: [{ model: User, as: "author", attributes: ["firstName", "lastName"] }]
  });

  if (!post) {
    throw new ApiError(404, "Blog post not found or not published");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, post, "Blog post retrieved successfully"));
});

const createBlogPost = asyncHandler(async (req, res) => {
  const { title, content, publishedAt } = req.body;

  if (!title || !content) {
    throw new ApiError(400, "Title and content are required");
  }

  const slug = slugify(title);

  // Check unique slug
  const existing = await BlogPost.findOne({ where: { slug } });
  if (existing) {
    throw new ApiError(409, "Blog post with a similar title already exists");
  }

  const post = await BlogPost.create({
    title,
    slug,
    content,
    authorId: req.user.id,
    publishedAt: publishedAt ? new Date(publishedAt) : new Date() // default to publish now
  });

  return res
    .status(201)
    .json(new ApiResponse(201, post, "Blog post created successfully"));
});

const updateBlogPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, publishedAt } = req.body;

  const post = await BlogPost.findByPk(id);
  if (!post) {
    throw new ApiError(404, "Blog post not found");
  }

  const updates = {};
  if (title !== undefined) {
    updates.title = title;
    updates.slug = slugify(title);

    const existing = await BlogPost.findOne({ where: { slug: updates.slug } });
    if (existing && existing.id !== id) {
      throw new ApiError(409, "Another blog post with a similar title already exists");
    }
  }
  if (content !== undefined) updates.content = content;
  if (publishedAt !== undefined) {
    updates.publishedAt = publishedAt === null ? null : new Date(publishedAt);
  }

  await post.update(updates);

  return res
    .status(200)
    .json(new ApiResponse(200, post, "Blog post updated successfully"));
});

const deleteBlogPost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await BlogPost.findByPk(id);
  if (!post) {
    throw new ApiError(404, "Blog post not found");
  }

  await post.destroy();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Blog post deleted successfully"));
});

export {
  getBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
};
