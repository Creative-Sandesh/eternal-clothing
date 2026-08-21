import User from "./users.model.js";
import Address from "./address.model.js";

import Category from "./category.model.js";
import Collection from "./collection.model.js";
import Product from "./product.model.js";
import ProductVariant from "./productVariant.model.js";

import Order from "./order.model.js";
import OrderItem from "./orderItem.model.js";

import Payment from "./payment.model.js";
import Coupon from "./coupon.model.js";

import Review from "./review.model.js";

import Wishlist from "./wishlist.model.js";
import WishlistItem from "./wishlistItem.model.js";

import Setting from "./settings.model.js";
import BlogPost from "./blogpost.model.js";

/*
|--------------------------------------------------------------------------
| USER RELATIONSHIPS
|--------------------------------------------------------------------------
*/

User.hasMany(Address, {
    foreignKey: "userId",
    as: "addresses",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Address.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});


/*
|--------------------------------------------------------------------------
| CATEGORY / COLLECTION / PRODUCT
|--------------------------------------------------------------------------
*/

Category.hasMany(Product, {
    foreignKey: "categoryId",
    as: "products",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
});

Product.belongsTo(Category, {
    foreignKey: "categoryId",
    as: "category",
});


Collection.hasMany(Product, {
    foreignKey: "collectionId",
    as: "products",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
});

Product.belongsTo(Collection, {
    foreignKey: "collectionId",
    as: "collection",
});


Product.hasMany(ProductVariant, {
    foreignKey: "productId",
    as: "variants",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

ProductVariant.belongsTo(Product, {
    foreignKey: "productId",
    as: "product",
});


/*
|--------------------------------------------------------------------------
| ORDERS
|--------------------------------------------------------------------------
*/

User.hasMany(Order, {
    foreignKey: "userId",
    as: "orders",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
});

Order.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});


Order.hasMany(OrderItem, {
    foreignKey: "orderId",
    as: "items",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

OrderItem.belongsTo(Order, {
    foreignKey: "orderId",
    as: "order",
});


ProductVariant.hasMany(OrderItem, {
    foreignKey: "productVariantId",
    as: "orderItems",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
});

OrderItem.belongsTo(ProductVariant, {
    foreignKey: "productVariantId",
    as: "productVariant",
});


/*
|--------------------------------------------------------------------------
| COUPONS
|--------------------------------------------------------------------------
*/

Coupon.hasMany(Order, {
    foreignKey: "couponId",
    as: "orders",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
});

Order.belongsTo(Coupon, {
    foreignKey: "couponId",
    as: "coupon",
});


/*
|--------------------------------------------------------------------------
| ORDER ADDRESSES
|--------------------------------------------------------------------------
*/

Address.hasMany(Order, {
    foreignKey: "shippingAddressId",
    as: "shippingOrders",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
});

Order.belongsTo(Address, {
    foreignKey: "shippingAddressId",
    as: "shippingAddress",
});


Address.hasMany(Order, {
    foreignKey: "billingAddressId",
    as: "billingOrders",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
});

Order.belongsTo(Address, {
    foreignKey: "billingAddressId",
    as: "billingAddress",
});


/*
|--------------------------------------------------------------------------
| PAYMENTS
|--------------------------------------------------------------------------
*/

Order.hasMany(Payment, {
    foreignKey: "orderId",
    as: "payments",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Payment.belongsTo(Order, {
    foreignKey: "orderId",
    as: "order",
});


/*
|--------------------------------------------------------------------------
| REVIEWS
|--------------------------------------------------------------------------
*/

Product.hasMany(Review, {
    foreignKey: "productId",
    as: "reviews",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Review.belongsTo(Product, {
    foreignKey: "productId",
    as: "product",
});


User.hasMany(Review, {
    foreignKey: "userId",
    as: "reviews",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Review.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});


/*
|--------------------------------------------------------------------------
| WISHLISTS
|--------------------------------------------------------------------------
*/

User.hasOne(Wishlist, {
    foreignKey: "userId",
    as: "wishlist",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Wishlist.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});


Wishlist.hasMany(WishlistItem, {
    foreignKey: "wishlistId",
    as: "items",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

WishlistItem.belongsTo(Wishlist, {
    foreignKey: "wishlistId",
    as: "wishlist",
});


Product.hasMany(WishlistItem, {
    foreignKey: "productId",
    as: "wishlistItems",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

WishlistItem.belongsTo(Product, {
    foreignKey: "productId",
    as: "product",
});


/*
|--------------------------------------------------------------------------
| BLOG POSTS
|--------------------------------------------------------------------------
*/

User.hasMany(BlogPost, {
    foreignKey: "authorId",
    as: "blogPosts",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
});

BlogPost.belongsTo(User, {
    foreignKey: "authorId",
    as: "author",
});


/*
|--------------------------------------------------------------------------
| EXPORT MODELS
|--------------------------------------------------------------------------
*/

export {
    User,
    Address,

    Category,
    Collection,
    Product,
    ProductVariant,

    Order,
    OrderItem,

    Payment,
    Coupon,

    Review,

    Wishlist,
    WishlistItem,

    Setting,
    BlogPost,
};