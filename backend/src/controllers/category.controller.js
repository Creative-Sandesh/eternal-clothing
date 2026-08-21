import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { slugify } from "../utils/slugify.js";

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.findAll();
  return res
    .status(200)
    .json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const category = await Category.findOne({ where: { slug } });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category fetched successfully"));
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image_url } = req.body;

  if (!name || name.trim() === "") {
    throw new ApiError(400, "Category name is required");
  }

  const slug = slugify(name);

  // Check unique slug
  const existingCategory = await Category.findOne({ where: { slug } });
  if (existingCategory) {
    throw new ApiError(409, "Category with a similar name already exists");
  }

  const category = await Category.create({
    name,
    slug,
    description,
    imageUrl: image_url
  });

  return res
    .status(201)
    .json(new ApiResponse(201, category, "Category created successfully"));
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, image_url } = req.body;

  const category = await Category.findByPk(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const updates = {};
  if (name !== undefined) {
    updates.name = name;
    updates.slug = slugify(name);

    // Verify new slug uniqueness
    const existing = await Category.findOne({ where: { slug: updates.slug } });
    if (existing && existing.id !== id) {
      throw new ApiError(409, "Another category with a similar name already exists");
    }
  }
  if (description !== undefined) updates.description = description;
  if (image_url !== undefined) updates.imageUrl = image_url;

  await category.update(updates);

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category updated successfully"));
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findByPk(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Check if category has products
  const productCount = await Product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw new ApiError(400, "Cannot delete category containing products. Reassign or delete products first.");
  }

  await category.destroy();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Category deleted successfully"));
});

export {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};
