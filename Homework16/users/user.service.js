const userModel = require("./user.model");
const blogModel = require("../blogs/blog.model");

exports.getAllUsers = async (query) => {
  const users = await userModel.find().populate("blogs", "title content");

  return users;
};

exports.getUserById = async (id) => {
  const user = await userModel.findById(id).populate("blogs", "title content");

  if (!user) {
    return null;
  }

  return user;
};

exports.deleteUserById = async (id) => {
  const deletedUser = await userModel.findByIdAndDelete(id);

  if (!deletedUser) {
    return null;
  }

  await blogModel.deleteMany({
    author: deletedUser._id,
  });

  return deletedUser;
};

exports.updateUserById = async (id, body) => {
  const updatedUser = await userModel.findByIdAndUpdate(
    id,
    {
      ...body,
      $inc: { __v: 1 },
    },
    {
      new: true,
    },
  );

  if (!updatedUser) {
    return null;
  }

  return updatedUser;
};
