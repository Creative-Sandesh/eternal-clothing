import { sequelize } from "./db/index.js";
import * as _models from "./models/relation.js"; // registers all associations
import {
  User,
  Category,
  Collection,
  Product,
  ProductVariant,
  Setting,
  Banner,
  Campaign,
  NewsletterSubscriber,
} from "./models/relation.js";
import { ensureReferralCode } from "./utils/referral.js";

// ─── Seed Data ───────────────────────────────────────────────────────────────

const categoriesData = [
  {
    name: "Tops",
    slug: "tops",
    description: "Shirts, blouses, and lightweight layers.",
    imageUrl:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=800&fit=crop&auto=format",
  },
  {
    name: "Bottoms",
    slug: "bottoms",
    description: "Trousers, denim, and casual pants.",
    imageUrl:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=800&fit=crop&auto=format",
  },
  {
    name: "Outerwear",
    slug: "outerwear",
    description: "Jackets, coats, and blazers.",
    imageUrl:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop&auto=format",
  },
  {
    name: "Knitwear",
    slug: "knitwear",
    description: "Sweaters, cardigans, and knitted pieces.",
    imageUrl:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=800&fit=crop&auto=format",
  },
  {
    name: "Footwear",
    slug: "footwear",
    description: "Boots, shoes, and sandals.",
    imageUrl:
      "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&h=800&fit=crop&auto=format",
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Bags, hats, scarves, and more.",
    imageUrl:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop&auto=format",
  },
];

const collectionsData = [
  {
    name: "Essentials",
    slug: "essentials",
    description:
      "Foundational wardrobe pieces in premium materials. Designed to last seasons, not trends.",
    imageUrl:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=800&fit=crop&auto=format",
  },
  {
    name: "Archive",
    slug: "archive",
    description:
      "Past-season icons at accessible prices. Each piece is a statement in its own right.",
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&auto=format",
  },
  {
    name: "Summer Edit",
    slug: "summer-edit",
    description:
      "Lightweight fabrics and open silhouettes for the warmer months. Refined casualwear.",
    imageUrl:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=800&fit=crop&auto=format",
  },
  {
    name: "Denim",
    slug: "denim",
    description:
      "Japanese selvedge denim, washed in-house. Crafted to age beautifully over years.",
    imageUrl:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=1200&h=800&fit=crop&auto=format",
  },
];

// products: {name, categorySlug, collectionSlug, price, originalPrice, material, skuPrefix, description, details, images, colors, sizes, status}
const productsData = [
  {
    name: "Oversized Cotton Poplin Shirt",
    categorySlug: "tops",
    collectionSlug: "essentials",
    basePrice: 185,
    originalPrice: null,
    material: "100% Egyptian Cotton",
    skuPrefix: "ET-001",
    status: "PUBLISHED",
    description:
      "Cut from premium Egyptian cotton poplin with a deliberately oversized silhouette. The boxy fit and dropped shoulders nod to workwear heritage while remaining effortlessly refined.",
    details: [
      "100% Egyptian cotton poplin",
      "Oversized fit",
      "Dropped shoulders",
      "Mother-of-pearl buttons",
      "Chest patch pocket",
      "Machine wash cold",
    ],
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&h=1067&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1067&fit=crop&auto=format",
    ],
    colors: [
      { name: "Chalk White", hex: "#f5f3ef" },
      { name: "Slate", hex: "#6b7280" },
      { name: "Forest", hex: "#2d4a3e" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Relaxed Wool Trouser",
    categorySlug: "bottoms",
    collectionSlug: "essentials",
    basePrice: 295,
    originalPrice: null,
    material: "65% Wool, 35% Polyester",
    skuPrefix: "ET-002",
    status: "PUBLISHED",
    description:
      "Tailored from a premium Italian wool blend, these relaxed trousers feature a mid-rise with a gently tapered leg. The refined drape speaks to quiet luxury.",
    details: [
      "65% Wool, 35% Polyester",
      "Relaxed fit through hip and thigh",
      "Mid-rise",
      "Two side pockets, two back welt pockets",
      "Dry clean only",
    ],
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1067&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1067&fit=crop&auto=format",
    ],
    colors: [
      { name: "Camel", hex: "#c9a96e" },
      { name: "Charcoal", hex: "#374151" },
      { name: "Ecru", hex: "#f0ebe2" },
    ],
    sizes: ["28", "30", "32", "34", "36", "38"],
  },
  {
    name: "Heavyweight Fleece Hoodie",
    categorySlug: "outerwear",
    collectionSlug: "archive",
    basePrice: 245,
    originalPrice: 310,
    material: "100% Cotton Fleece",
    skuPrefix: "ET-003",
    status: "PUBLISHED",
    description:
      "Our signature heavyweight fleece in a garment-dyed finish that softens and deepens with every wash. The relaxed silhouette and ribbed trims create a foundational piece.",
    details: [
      "420gsm fleece, 100% cotton",
      "Garment dyed",
      "Kangaroo pocket",
      "Ribbed cuffs and hem",
      "Machine wash cold",
    ],
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&h=1067&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=1067&fit=crop&auto=format",
    ],
    colors: [
      { name: "Vintage Black", hex: "#1a1a1a" },
      { name: "Washed Moss", hex: "#4a5e4a" },
      { name: "Bone", hex: "#e8e0d0" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Merino Crewneck Knit",
    categorySlug: "knitwear",
    collectionSlug: "essentials",
    basePrice: 220,
    originalPrice: null,
    material: "100% Extra-Fine Merino Wool",
    skuPrefix: "ET-004",
    status: "PUBLISHED",
    description:
      "Fine-gauge merino in a classic crewneck silhouette. Supremely soft with natural temperature regulation. A wardrobe anchor that works with everything.",
    details: [
      "100% Extra-fine Merino wool",
      "Fine gauge knit",
      "Ribbed collar, cuffs and hem",
      "Machine wash (wool cycle)",
    ],
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1067&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1067&fit=crop&auto=format",
    ],
    colors: [
      { name: "Ivory", hex: "#fffff0" },
      { name: "Stone", hex: "#8c8277" },
      { name: "Midnight", hex: "#0f172a" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Unstructured Linen Blazer",
    categorySlug: "outerwear",
    collectionSlug: "summer-edit",
    basePrice: 485,
    originalPrice: null,
    material: "100% Italian Linen",
    skuPrefix: "ET-005",
    status: "PUBLISHED",
    description:
      "Unstructured and unlined, this Italian linen blazer is designed to move and breathe. The relaxed cut is intentional — structured enough to elevate, relaxed enough to live in.",
    details: [
      "100% Italian linen",
      "Unstructured, unlined construction",
      "Two-button front",
      "Three exterior pockets",
      "Dry clean recommended",
    ],
    images: [
      "https://images.unsplash.com/photo-1594938374182-a56369f9e71a?w=800&h=1067&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=1067&fit=crop&auto=format",
    ],
    colors: [
      { name: "Raw Sand", hex: "#d4c5a9" },
      { name: "Ecru", hex: "#f0ebe2" },
      { name: "Sage", hex: "#8fa68a" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Slim Straight Selvedge Denim",
    categorySlug: "bottoms",
    collectionSlug: "denim",
    basePrice: 320,
    originalPrice: null,
    material: "100% Japanese Selvedge Denim",
    skuPrefix: "ET-006",
    status: "PUBLISHED",
    description:
      "Woven on vintage shuttle looms in Japan, this selvedge denim features a 14oz weight and a slim-straight cut that allows for natural fading. A true slow-fashion investment.",
    details: [
      "14oz Japanese selvedge denim",
      "Slim straight fit",
      "Mid-rise",
      "Copper rivets",
      "Selvedge ID at coin pocket",
      "Machine wash cold, hang dry",
    ],
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=1067&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800&h=1067&fit=crop&auto=format",
    ],
    colors: [
      { name: "Raw Indigo", hex: "#3a4a6b" },
      { name: "One Wash", hex: "#5a6a8b" },
    ],
    sizes: ["28", "29", "30", "31", "32", "33", "34", "36"],
  },
  {
    name: "Garment-Dyed Cargo Pant",
    categorySlug: "bottoms",
    collectionSlug: "archive",
    basePrice: 265,
    originalPrice: 320,
    material: "100% Cotton Twill",
    skuPrefix: "ET-007",
    status: "PUBLISHED",
    description:
      "A workwear-inspired cargo with a relaxed taper and garment-dyed finish. Six pockets, clean seaming, and an adjustable hem — the details elevate the utility.",
    details: [
      "100% Cotton twill",
      "Garment dyed",
      "Six-pocket cargo",
      "Adjustable hem drawstring",
      "Machine wash cold",
    ],
    images: [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&h=1067&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1067&fit=crop&auto=format",
    ],
    colors: [
      { name: "Dust", hex: "#c4b49a" },
      { name: "Slate Grey", hex: "#64748b" },
      { name: "Army", hex: "#4b5320" },
    ],
    sizes: ["28", "30", "32", "34", "36"],
  },
  {
    name: "Cashmere Ribbed Beanie",
    categorySlug: "accessories",
    collectionSlug: "essentials",
    basePrice: 125,
    originalPrice: null,
    material: "100% Grade-A Cashmere",
    skuPrefix: "ET-008",
    status: "PUBLISHED",
    description:
      "A chunky ribbed beanie knitted from pure Grade-A cashmere. Unisex fit with a generous turn-up brim that can be adjusted to suit your preference.",
    details: [
      "100% Grade-A cashmere",
      "Chunky rib knit",
      "Turn-up brim",
      "One size fits most",
      "Hand wash cold",
    ],
    images: [
      "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&h=1067&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1510598155026-a6ec7f7a5c91?w=800&h=1067&fit=crop&auto=format",
    ],
    colors: [
      { name: "Camel", hex: "#c9a96e" },
      { name: "Off White", hex: "#f5f5f0" },
      { name: "Charcoal", hex: "#374151" },
    ],
    sizes: ["One Size"],
  },
  {
    name: "Wide-Leg Linen Trouser",
    categorySlug: "bottoms",
    collectionSlug: "summer-edit",
    basePrice: 225,
    originalPrice: null,
    material: "100% Belgian Linen",
    skuPrefix: "ET-009",
    status: "PUBLISHED",
    description:
      "A wide, fluid leg in washed Belgian linen. The high-rise waist and generous cut allow the fabric to drape naturally — almost sculptural in movement.",
    details: [
      "100% Belgian linen",
      "Washed finish",
      "Wide-leg silhouette",
      "Elasticated back waistband",
      "Two side pockets",
      "Machine wash cold",
    ],
    images: [
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&h=1067&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1594938374182-a56369f9e71a?w=800&h=1067&fit=crop&auto=format",
    ],
    colors: [
      { name: "Ecru", hex: "#f0ebe2" },
      { name: "Terracotta", hex: "#c87941" },
      { name: "Sage", hex: "#8fa68a" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    name: "Leather Chelsea Boot",
    categorySlug: "footwear",
    collectionSlug: "essentials",
    basePrice: 565,
    originalPrice: null,
    material: "Full-Grain Calfskin Leather",
    skuPrefix: "ET-010",
    status: "PUBLISHED",
    description:
      "Handcrafted in Spain from full-grain calfskin leather. A sleek Chelsea silhouette with a block heel and almond toe — the foundation of any serious wardrobe.",
    details: [
      "Full-grain calfskin leather upper",
      "Leather lining",
      "Rubber sole",
      "Block heel (3.5cm)",
      "Elastic side gussets",
      "Made in Spain",
    ],
    images: [
      "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&h=1067&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1067&fit=crop&auto=format",
    ],
    colors: [
      { name: "Jet Black", hex: "#0a0a0a" },
      { name: "Cognac", hex: "#7b4f2e" },
    ],
    sizes: ["EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44"],
  },
  {
    name: "Nylon Packable Jacket",
    categorySlug: "outerwear",
    collectionSlug: "archive",
    basePrice: 340,
    originalPrice: 420,
    material: "100% Ripstop Nylon",
    skuPrefix: "ET-011",
    status: "PUBLISHED",
    description:
      "A lightweight packable jacket in ripstop nylon with a DWR coating. Packs into its own chest pocket. Minimal seaming and a clean silhouette — technical without looking technical.",
    details: [
      "100% Ripstop nylon",
      "DWR water-resistant coating",
      "Packs into chest pocket",
      "Two side pockets",
      "Adjustable hem and cuffs",
    ],
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1067&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=1067&fit=crop&auto=format",
    ],
    colors: [
      { name: "Phantom Black", hex: "#111111" },
      { name: "Olive", hex: "#6b7a4a" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Premium Leather Tote",
    categorySlug: "accessories",
    collectionSlug: "essentials",
    basePrice: 425,
    originalPrice: null,
    material: "Vegetable-Tanned Italian Leather",
    skuPrefix: "ET-012",
    status: "PUBLISHED",
    description:
      "A structured tote cut from vegetable-tanned Italian leather that develops a rich patina over time. Roomy enough for everything, refined enough for anywhere.",
    details: [
      "Vegetable-tanned Italian leather",
      "Cotton canvas lining",
      "Interior zip pocket",
      "Two open pockets",
      "Magnetic snap closure",
      "Made in Italy",
    ],
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1067&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=1067&fit=crop&auto=format",
    ],
    colors: [
      { name: "Natural Tan", hex: "#c49a6c" },
      { name: "Black", hex: "#0a0a0a" },
    ],
    sizes: ["One Size"],
  },
];

const defaultSettings = [
  { key: "store_name", value: "Eternal Clothing" },
  { key: "store_email", value: "hello@eternal.com" },
  { key: "currency", value: "NPR" },
  { key: "shipping_fee_standard", value: 150 },
  { key: "free_shipping_threshold", value: 10000 },
  { key: "tax_rate_percent", value: 0 },
  { key: "loyalty_points_per_dollar", value: 1 },
  { key: "loyalty_points_redemption_rate", value: 0.01 },
  { key: "referral_reward_points", value: 200 },
];

const bannersData = [
  { position: "TOP_BAR", title: "Free shipping on orders over रू10,000", ctaText: "Shop now", ctaLink: "/shop", isActive: true, sortOrder: 0 },
  { position: "HERO", title: "The Winter Edit", content: "New arrivals — curated for the season", ctaText: "Explore", ctaLink: "/collections/essentials", isActive: true, sortOrder: 0 },
  { position: "SALE", title: "Archive Sale", content: "Up to 30% off selected pieces", ctaText: "Shop the sale", ctaLink: "/sale", isActive: true, sortOrder: 0 },
];

const campaignsData = [
  { name: "Welcome series", type: "EMAIL", status: "DRAFT", subject: "Welcome to Eternal", body: "<p>Thanks for joining. Here's 10% off your first order.</p>", audience: "SUBSCRIBERS" },
  { name: "New arrivals announcement", type: "EMAIL", status: "DRAFT", subject: "Just landed: the Winter Edit", body: "<p>Discover the new season.</p>", audience: "CUSTOMERS" },
];

const subscribersData = [
  { email: "amara.osei@example.com", source: "CHECKOUT" },
  { email: "sofia.a@example.com", source: "WEBSITE" },
  { email: "marcus.chen@example.com", source: "SOCIAL" },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

// ─── Seeder ───────────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected.\n");

    // ------------------------------------------------------------------
    // 1. Users
    // ------------------------------------------------------------------
    console.log("👤 Seeding users...");
    const adminExists = await User.findOne({ where: { email: "admin@eternal.com" } });
    if (!adminExists) {
      await User.create({
        firstName: "Admin",
        lastName: "Eternal",
        email: "admin@eternal.com",
        passwordHash: "Admin@123",
        role: "ADMIN",
        phoneNumber: "+1-555-000-0001",
      });
      console.log("   Created admin@eternal.com  (password: Admin@123)");
    } else {
      console.log("   admin@eternal.com already exists — skipping.");
    }

    const customerExists = await User.findOne({ where: { email: "customer@eternal.com" } });
    if (!customerExists) {
      await User.create({
        firstName: "Jane",
        lastName: "Doe",
        email: "customer@eternal.com",
        passwordHash: "Customer@123",
        role: "CUSTOMER",
        phoneNumber: "+1-555-000-0002",
      });
      console.log("   Created customer@eternal.com  (password: Customer@123)");
    } else {
      console.log("   customer@eternal.com already exists — skipping.");
    }

    // Ensure every user has a referral code
    for (const u of await User.findAll()) {
      await ensureReferralCode(u);
    }

    // ------------------------------------------------------------------
    // 2. Categories
    // ------------------------------------------------------------------
    console.log("\n🗂️  Seeding categories...");
    const categoryMap = {}; // slug -> Category instance
    for (const cat of categoriesData) {
      const [instance, created] = await Category.findOrCreate({
        where: { slug: cat.slug },
        defaults: cat,
      });
      categoryMap[cat.slug] = instance;
      console.log(`   ${created ? "Created" : "Exists "} → ${cat.name}`);
    }

    // ------------------------------------------------------------------
    // 3. Collections
    // ------------------------------------------------------------------
    console.log("\n📦 Seeding collections...");
    const collectionMap = {}; // slug -> Collection instance
    for (const col of collectionsData) {
      const [instance, created] = await Collection.findOrCreate({
        where: { slug: col.slug },
        defaults: col,
      });
      collectionMap[col.slug] = instance;
      console.log(`   ${created ? "Created" : "Exists "} → ${col.name}`);
    }

    // ------------------------------------------------------------------
    // 4. Products + Variants  (inside a transaction per product)
    // ------------------------------------------------------------------
    console.log("\n🛍️  Seeding products & variants...");
    for (const p of productsData) {
      const category = categoryMap[p.categorySlug];
      const collection = collectionMap[p.collectionSlug];

      if (!category) {
        console.warn(`   ⚠️  Category "${p.categorySlug}" not found — skipping ${p.name}`);
        continue;
      }

      const slug = slugify(p.name);
      const existingProduct = await Product.findOne({ where: { slug } });

      if (existingProduct) {
        console.log(`   Exists  → ${p.name}`);
        continue;
      }

      await sequelize.transaction(async (t) => {
        const product = await Product.create(
          {
            name: p.name,
            slug,
            description: p.description,
            details: p.details,
            categoryId: category.id,
            collectionId: collection ? collection.id : null,
            basePrice: p.basePrice,
            originalPrice: p.originalPrice,
            material: p.material,
            skuPrefix: p.skuPrefix,
            images: p.images,
            status: p.status,
          },
          { transaction: t }
        );

        // Generate variant for every size × color combination
        const variantsToCreate = [];
        let variantIndex = 1;
        for (const color of p.colors) {
          for (const size of p.sizes) {
            const colorCode = color.name
              .toUpperCase()
              .replace(/\s+/g, "")
              .slice(0, 4);
            const sizeCode = size.replace(/\s+/g, "").toUpperCase().slice(0, 4);
            variantsToCreate.push({
              productId: product.id,
              size,
              colorName: color.name,
              colorHex: color.hex,
              sku: `${p.skuPrefix}-${colorCode}-${sizeCode}-${String(variantIndex).padStart(3, "0")}`,
              stockQuantity: 50,
              priceOverride: null,
            });
            variantIndex++;
          }
        }

        await ProductVariant.bulkCreate(variantsToCreate, {
          transaction: t,
          validate: true,
        });

        console.log(
          `   Created → ${p.name}  (${variantsToCreate.length} variants)`
        );
      });
    }

    // ------------------------------------------------------------------
    // 5. Settings
    // ------------------------------------------------------------------
    console.log("\n⚙️  Seeding settings...");
    for (const s of defaultSettings) {
      await Setting.upsert({ key: s.key, value: s.value });
      console.log(`   Upserted → ${s.key}`);
    }

    // ------------------------------------------------------------------
    // 6. Marketing (banners, campaigns, subscribers)
    // ------------------------------------------------------------------
    console.log("\n📣 Seeding marketing...");
    for (const b of bannersData) {
      const [, created] = await Banner.findOrCreate({ where: { position: b.position, title: b.title }, defaults: b });
      console.log(`   ${created ? "Created" : "Exists "} banner → ${b.title}`);
    }
    for (const c of campaignsData) {
      const [, created] = await Campaign.findOrCreate({ where: { name: c.name }, defaults: c });
      console.log(`   ${created ? "Created" : "Exists "} campaign → ${c.name}`);
    }
    for (const s of subscribersData) {
      const [, created] = await NewsletterSubscriber.findOrCreate({ where: { email: s.email }, defaults: s });
      console.log(`   ${created ? "Created" : "Exists "} subscriber → ${s.email}`);
    }

    // ------------------------------------------------------------------
    console.log("\n🎉 Database seeding completed successfully!\n");
    console.log("─────────────────────────────────────────────────");
    console.log("  Admin login    : admin@eternal.com / Admin@123");
    console.log("  Customer login : customer@eternal.com / Customer@123");
    console.log("─────────────────────────────────────────────────\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  }
};

seed();
