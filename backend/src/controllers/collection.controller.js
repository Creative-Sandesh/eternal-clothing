import { fn, col } from "sequelize";
import Collection from "../models/collection.model.js";
import Product from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { slugify } from "../utils/slugify.js";

const getCollections = asyncHandler(async (req, res) => {
  const collections = await Collection.findAll({ order: [["name", "ASC"]] });

  const counts = await Product.findAll({
    attributes: ["collectionId", [fn("COUNT", col("id")), "count"]],
    group: ["collectionId"],
    raw: true
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.collectionId, Number(c.count)]));

  const withCounts = collections.map((c) => ({
    ...c.toJSON(),
    productCount: countMap[c.id] ?? 0
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, withCounts, "Collections fetched successfully"));
});

const getCollectionBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const collection = await Collection.findOne({ where: { slug } });

  if (!collection) {
    throw new ApiError(404, "Collection not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, collection, "Collection fetched successfully"));
});

const createCollection = asyncHandler(async (req, res) => {
  const { name, description, image_url } = req.body;

  if (!name || name.trim() === "") {
    throw new ApiError(400, "Collection name is required");
  }

  const slug = slugify(name);

  // Check unique slug
  const existingCollection = await Collection.findOne({ where: { slug } });
  if (existingCollection) {
    throw new ApiError(409, "Collection with a similar name already exists");
  }

  const collection = await Collection.create({
    name,
    slug,
    description,
    imageUrl: image_url
  });

  return res
    .status(201)
    .json(new ApiResponse(201, collection, "Collection created successfully"));
});

const updateCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, image_url } = req.body;

  const collection = await Collection.findByPk(id);
  if (!collection) {
    throw new ApiError(404, "Collection not found");
  }

  const updates = {};
  if (name !== undefined) {
    updates.name = name;
    updates.slug = slugify(name);

    // Verify new slug uniqueness
    const existing = await Collection.findOne({ where: { slug: updates.slug } });
    if (existing && existing.id !== id) {
      throw new ApiError(409, "Another collection with a similar name already exists");
    }
  }
  if (description !== undefined) updates.description = description;
  if (image_url !== undefined) updates.imageUrl = image_url;

  await collection.update(updates);

  return res
    .status(200)
    .json(new ApiResponse(200, collection, "Collection updated successfully"));
});

const deleteCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const collection = await Collection.findByPk(id);
  if (!collection) {
    throw new ApiError(404, "Collection not found");
  }

  // A collection is an optional curatorial grouping, not a taxonomy: the
  // Product.collectionId FK is nullable with onDelete: "SET NULL". Deleting a
  // collection simply un-groups its products (unlike a Category, which is
  // required and blocks deletion while products reference it).
  const productCount = await Product.count({ where: { collectionId: id } });

  await collection.destroy();

  const message =
    productCount > 0
      ? `Collection deleted. ${productCount} product${productCount === 1 ? " was" : "s were"} removed from it.`
      : "Collection deleted successfully";

  return res.status(200).json(new ApiResponse(200, { unlinkedProducts: productCount }, message));
});

export {
  getCollections,
  getCollectionBySlug,
  createCollection,
  updateCollection,
  deleteCollection
};
