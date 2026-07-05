const blogModel = require("./blog.model");
const userModel = require("../users/user.model");

exports.createBlog = async ({ title, content, author }) => {
  const newBlog = await blogModel.create({
    title,
    content,
    author,
  });

  await userModel.findByIdAndUpdate(author, {
    $push: { blogs: newBlog._id },
  });

  const populatedBlog = await blogModel
    .findById(newBlog._id)
    .populate("author", "fullName");

  return populatedBlog;
};

exports.getBlogs = async () => {
  return await blogModel.find().populate("author", "fullName");
};

exports.getBlogById = async (blogId) => {
  const blog = await blogModel.findById(blogId).populate("author", "fullName");

  if (!blog) {
    return "NOT_FOUND";
  }

  return blog;
};

exports.updateBlog = async ({ blogId, userId, title, content }) => {
  const existBlog = await blogModel.findById(blogId);

  if (!existBlog) {
    return "NOT_FOUND";
  }

  if (existBlog.author.toString() !== userId) {
    return "PERMISSION_DENIED";
  }

  const updatedBlog = await blogModel
    .findByIdAndUpdate(
      blogId,
      {
        title,
        content,
      },
      { returnDocument: "after" },
    )
    .populate("author", "fullName");

  return updatedBlog;
};

exports.deleteBlogById = async (blogId, userId) => {
  const existBlog = await blogModel.findById(blogId);

  if (!existBlog) {
    return "NOT_FOUND";
  }

  if (existBlog.author.toString() !== userId) {
    return "PERMISSION_DENIED";
  }

  await blogModel.findByIdAndDelete(blogId);

  await userModel.findByIdAndUpdate(userId, {
    $pull: { blogs: existBlog._id },
  });

  return "OK";
};
