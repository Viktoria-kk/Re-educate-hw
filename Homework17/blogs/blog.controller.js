const { Router } = require("express");
const BlogService = require("./blog.service");
const isAuthMiddleware = require("../middlewares/is-auth.middleware");
const validate = require("../middlewares/validate");
const { createBlogDto } = require("./dto/create-blog.dto");
const isValidMongoIdMiddleware = require("../middlewares/is-valid-mongo-id.middleware");

const blogRouter = Router();

blogRouter.post(
  "/",
  isAuthMiddleware,
  validate(createBlogDto),
  async (req, res) => {
    try {
      const { title, content } = req.body;

      const blog = await BlogService.createBlog({
        title,
        content,
        author: req.userId,
      });

      res.status(201).json({
        message: "blog created successfully",
        blog,
      });
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  },
);

blogRouter.get("/", isAuthMiddleware, async (req, res) => {
  try {
    const blogs = await BlogService.getBlogs();
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
});

blogRouter.get(
  "/:id",
  isAuthMiddleware,
  isValidMongoIdMiddleware,
  async (req, res) => {
    try {
      const blog = await BlogService.getBlogById(req.params.id);

      if (blog === "NOT_FOUND") {
        return res.status(404).json({ message: "blog not found" });
      }

      res.json(blog);
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  },
);

blogRouter.put(
  "/:id",
  isAuthMiddleware,
  validate(createBlogDto),
  isValidMongoIdMiddleware,
  async (req, res) => {
    try {
      const { title, content } = req.body;

      const updatedBlog = await BlogService.updateBlog({
        blogId: req.params.id,
        userId: req.userId,
        title,
        content,
      });

      if (updatedBlog === "NOT_FOUND") {
        return res.status(404).json({ message: "blog not found" });
      }

      if (updatedBlog === "PERMISSION_DENIED") {
        return res.status(403).json({ message: "permission denied" });
      }

      res.json(updatedBlog);
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  },
);

blogRouter.delete(
  "/:id",
  isAuthMiddleware,
  isValidMongoIdMiddleware,
  async (req, res) => {
    try {
      const resp = await BlogService.deleteBlogById(req.params.id, req.userId);

      if (resp === "NOT_FOUND") {
        return res.status(404).json({ message: "blog not found" });
      }

      if (resp === "PERMISSION_DENIED") {
        return res.status(403).json({ message: "permission denied" });
      }

      res.json({ message: "blog deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  },
);

module.exports = blogRouter;
