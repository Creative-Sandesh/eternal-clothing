import { Router } from "express";
import { getBlogPosts, getBlogPostBySlug, createBlogPost, updateBlogPost, deleteBlogPost } from "../controllers/blog.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { blogCreateSchema, blogUpdateSchema } from "../validators/content.validators.js";

const router = Router();

// Public routes
router.route("/").get(getBlogPosts);
router.route("/:slug").get(getBlogPostBySlug);

// Admin / Staff writer routes
router.use(verifyJWT);
router.use(verifyAdmin);

router.route("/admin").post(validateBody(blogCreateSchema), createBlogPost);
router.route("/admin/:id")
  .put(validateBody(blogUpdateSchema), updateBlogPost)
  .delete(deleteBlogPost);

export default router;
