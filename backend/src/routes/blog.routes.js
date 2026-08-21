import { Router } from "express";
import { getBlogPosts, getBlogPostBySlug, createBlogPost, updateBlogPost, deleteBlogPost } from "../controllers/blog.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getBlogPosts);
router.route("/:slug").get(getBlogPostBySlug);

// Admin / Staff writer routes
router.use(verifyJWT);
router.use(verifyAdmin);

router.route("/admin").post(createBlogPost);
router.route("/admin/:id")
  .put(updateBlogPost)
  .delete(deleteBlogPost);

export default router;
