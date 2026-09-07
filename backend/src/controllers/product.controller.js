import { Op, fn, col } from "sequelize";
import sequelize from "../db/index.js";
import Product from "../models/product.model.js";
import ProductVariant from "../models/productVariant.model.js";
import Category from "../models/category.model.js";
import Collection from "../models/collection.model.js";
import Review from "../models/review.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { slugify } from "../utils/slugify.js";

// Compute { avgRating, reviewCount } (APPROVED reviews only) for a set of product ids.
const getRatingMap = async (productIds) => {
  if (productIds.length === 0) return {};
  const rows = await Review.findAll({
    attributes: [
      "productId",
      [fn("AVG", col("rating")), "avgRating"],
      [fn("COUNT", col("id")), "reviewCount"]
    ],
    where: { productId: { [Op.in]: productIds }, status: "APPROVED" },
    group: ["productId"],
    raw: true
  });
  return Object.fromEntries(
    rows.map((r) => [
      r.productId,
      { avgRating: Math.round(Number(r.avgRating) * 10) / 10, reviewCount: Number(r.reviewCount) }
    ])
  );
};

const attachRatings = (products, ratingMap) =>
  products.map((p) => {
    const plain = typeof p.toJSON === "function" ? p.toJSON() : p;
    const r = ratingMap[plain.id] || { avgRating: 0, reviewCount: 0 };
    return { ...plain, avgRating: r.avgRating, reviewCount: r.reviewCount };
  });

const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    collection,
    search,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 10
  } = req.query;

  const whereClause = { status: "PUBLISHED" };
  const includeClause = [
    { model: Category, as: "category", attributes: ["name", "slug"] },
    { model: Collection, as: "collection", attributes: ["name", "slug"] },
    { model: ProductVariant, as: "variants" }
  ];

  // 1. Filter by category slug
  if (category) {
    const cat = await Category.findOne({ where: { slug: category } });
    if (cat) {
      whereClause.categoryId = cat.id;
    } else {
      // If category specified but not found, return empty result
      whereClause.categoryId = null;
    }
  }

  // 2. Filter by collection slug
  if (collection) {
    const col = await Collection.findOne({ where: { slug: collection } });
    if (col) {
      whereClause.collectionId = col.id;
    } else {
      whereClause.collectionId = null;
    }
  }

  // 3. Search by name or description
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }

  // 4. Filter by base price range
  if (minPrice || maxPrice) {
    whereClause.basePrice = {};
    if (minPrice) whereClause.basePrice[Op.gte] = parseFloat(minPrice);
    if (maxPrice) whereClause.basePrice[Op.lte] = parseFloat(maxPrice);
  }

  // 5. Sorting
  let orderClause = [["createdAt", "DESC"]];
  if (sort) {
    switch (sort) {
      case "price_asc":
        orderClause = [["basePrice", "ASC"]];
        break;
      case "price_desc":
        orderClause = [["basePrice", "DESC"]];
        break;
      case "newest":
        orderClause = [["createdAt", "DESC"]];
        break;
      default:
        orderClause = [["createdAt", "DESC"]];
    }
  }

  // 6. Pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const parsedLimit = parseInt(limit);

  const { count, rows: products } = await Product.findAndCountAll({
    where: whereClause,
    include: includeClause,
    order: orderClause,
    limit: parsedLimit,
    offset,
    distinct: true // Required when counting with hasMany associations
  });

  const ratingMap = await getRatingMap(products.map((p) => p.id));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products: attachRatings(products, ratingMap),
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / parsedLimit),
          currentPage: parseInt(page),
          limit: parsedLimit
        }
      },
      "Products fetched successfully"
    )
  );
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const isNumericId = !isNaN(slug) && !isNaN(parseInt(slug));
  const queryCondition = isNumericId
    ? { id: parseInt(slug), status: "PUBLISHED" }
    : { slug, status: "PUBLISHED" };

  const product = await Product.findOne({
    where: queryCondition,
    include: [
      { model: Category, as: "category", attributes: ["name", "slug"] },
      { model: Collection, as: "collection", attributes: ["name", "slug"] },
      { model: ProductVariant, as: "variants" }
    ]
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const ratingMap = await getRatingMap([product.id]);
  const [withRating] = attachRatings([product], ratingMap);

  return res
    .status(200)
    .json(new ApiResponse(200, withRating, "Product fetched successfully"));
});

// Admin: accept image uploads, return their public URLs.
const uploadProductImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "No image files received");
  }
  // Relative paths — the SPA proxies /uploads to the API in dev; set an absolute
  // ASSET_BASE_URL in production if the API and web app are on different hosts.
  const base = (process.env.ASSET_BASE_URL || "").replace(/\/$/, "");
  const urls = req.files.map((f) => `${base}/uploads/${f.filename}`);
  return res.status(201).json(new ApiResponse(201, { urls }, "Images uploaded"));
});

// Admin: fetch a single product by primary key regardless of status (incl. soft-deleted),
// with everything the edit form needs.
const getProductByIdForAdmin = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id, {
    paranoid: false,
    include: [
      { model: Category, as: "category", attributes: ["id", "name", "slug"] },
      { model: Collection, as: "collection", attributes: ["id", "name", "slug"] },
      { model: ProductVariant, as: "variants" }
    ]
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    details,
    categoryId,
    collectionId,
    basePrice,
    originalPrice,
    material,
    skuPrefix,
    images,
    status = "DRAFT",
    variants // Array of variants
  } = req.body;

  // Validations
  if (!name || !categoryId || !basePrice || !material || !skuPrefix) {
    throw new ApiError(400, "Missing required product details");
  }

  // Verify category exists
  const categoryExists = await Category.findByPk(categoryId);
  if (!categoryExists) {
    throw new ApiError(400, "Invalid Category ID");
  }

  // Verify collection exists if provided
  if (collectionId) {
    const colExists = await Collection.findByPk(collectionId);
    if (!colExists) {
      throw new ApiError(400, "Invalid Collection ID");
    }
  }

  const slug = slugify(name);
  const existingProduct = await Product.findOne({ where: { slug } });
  if (existingProduct) {
    throw new ApiError(409, "Product with a similar name already exists");
  }

  // Sequelize Transaction to create Product and its Variants
  const result = await sequelize.transaction(async (t) => {
    const product = await Product.create(
      {
        name,
        slug,
        description,
        details,
        categoryId,
        collectionId,
        basePrice,
        originalPrice,
        material,
        skuPrefix,
        images,
        status
      },
      { transaction: t }
    );

    if (variants && variants.length > 0) {
      const variantsData = variants.map((v) => ({
        ...v,
        productId: product.id
      }));

      await ProductVariant.bulkCreate(variantsData, {
        transaction: t,
        validate: true
      });
    }

    // Return the product with its variants included
    return await Product.findByPk(product.id, {
      include: [{ model: ProductVariant, as: "variants" }],
      transaction: t
    });
  });

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Product and variants created successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    details,
    categoryId,
    collectionId,
    basePrice,
    originalPrice,
    material,
    skuPrefix,
    images,
    status,
    variants,          // optional: full desired variant list ({ id?, size, colorName, colorHex, sku, stockQuantity, priceOverride })
    deleteVariantIds   // optional: explicit ids to remove
  } = req.body;

  const product = await Product.findByPk(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const updates = {};
  if (name !== undefined) {
    updates.name = name;
    updates.slug = slugify(name);

    const existing = await Product.findOne({ where: { slug: updates.slug } });
    if (existing && existing.id !== id) {
      throw new ApiError(409, "Another product with a similar name already exists");
    }
  }

  if (description !== undefined) updates.description = description;
  if (details !== undefined) updates.details = details;
  if (material !== undefined) updates.material = material;
  if (skuPrefix !== undefined) updates.skuPrefix = skuPrefix;
  if (images !== undefined) updates.images = images;
  if (status !== undefined) updates.status = status;
  if (basePrice !== undefined) updates.basePrice = basePrice;
  if (originalPrice !== undefined) updates.originalPrice = originalPrice;

  if (categoryId !== undefined) {
    const catExists = await Category.findByPk(categoryId);
    if (!catExists) throw new ApiError(400, "Invalid Category ID");
    updates.categoryId = categoryId;
  }

  if (collectionId !== undefined) {
    if (collectionId === null) {
      updates.collectionId = null;
    } else {
      const colExists = await Collection.findByPk(collectionId);
      if (!colExists) throw new ApiError(400, "Invalid Collection ID");
      updates.collectionId = collectionId;
    }
  }

  await sequelize.transaction(async (t) => {
    await product.update(updates, { transaction: t });

    // Variant sync — only touched when the caller sends a `variants` array.
    if (Array.isArray(variants)) {
      const existingVariants = await ProductVariant.findAll({
        where: { productId: id },
        transaction: t
      });
      const existingIds = new Set(existingVariants.map((v) => v.id));
      const keepIds = new Set(variants.filter((v) => v.id).map((v) => v.id));

      // Remove variants dropped from the list (or explicitly named in deleteVariantIds).
      const toDelete = [
        ...existingVariants.filter((v) => !keepIds.has(v.id)).map((v) => v.id),
        ...(Array.isArray(deleteVariantIds) ? deleteVariantIds : [])
      ];
      if (toDelete.length > 0) {
        await ProductVariant.destroy({ where: { id: toDelete, productId: id }, transaction: t });
      }

      // Upsert the rest.
      for (const v of variants) {
        if (v.id && existingIds.has(v.id)) {
          await ProductVariant.update(
            {
              size: v.size,
              colorName: v.colorName,
              colorHex: v.colorHex,
              sku: v.sku,
              stockQuantity: v.stockQuantity,
              priceOverride: v.priceOverride ?? null
            },
            { where: { id: v.id, productId: id }, transaction: t }
          );
        } else {
          await ProductVariant.create(
            {
              productId: id,
              size: v.size,
              colorName: v.colorName,
              colorHex: v.colorHex,
              sku: v.sku,
              stockQuantity: v.stockQuantity ?? 0,
              priceOverride: v.priceOverride ?? null
            },
            { transaction: t }
          );
        }
      }
    } else if (Array.isArray(deleteVariantIds) && deleteVariantIds.length > 0) {
      await ProductVariant.destroy({ where: { id: deleteVariantIds, productId: id }, transaction: t });
    }
  });

  // Fetch updated product with variants
  const updatedProduct = await Product.findByPk(id, {
    include: [{ model: ProductVariant, as: "variants" }]
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByPk(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Soft delete (paranoid: true is set on the Product model)
  await product.destroy();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product soft-deleted successfully"));
});

export {
  getProducts,
  getProductBySlug,
  getProductByIdForAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages
};
