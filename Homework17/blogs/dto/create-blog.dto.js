const { default: z } = require("zod");

const createBlogDto = z.object({
  title: z.string("title is required"),
  content: z.string("content is required"),
});

module.exports = { createBlogDto };
