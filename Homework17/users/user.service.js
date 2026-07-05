const userModel = require("./user.model");
const blogModel = require("../blogs/blog.model");
const { uploadFile, deleteFile } = require("../lib/cloudinary.lib");

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

exports.updateProfileImage = async (userId, file) => {
  if (!file) {
    return "NO_FILE";
  }

  const user = await userModel.findById(userId);

  if (!user) {
    return "USER_NOT_FOUND";
  }

  if (user.imagePublicId) {
    await deleteFile(user.imagePublicId);
  }

  const resp = await uploadFile(file.buffer);

  const updatedUser = await userModel.findByIdAndUpdate(
    userId,
    {
      imageUrl: resp.url,
      imagePublicId: resp.publicId,
    },
    {
      new: true,
    },
  );

  return updatedUser;
};

exports.deleteProfileImage = async (userId) => {
  const user = await userModel.findById(userId);

  if (!user) {
    return "USER_NOT_FOUND";
  }

  if (!user.imagePublicId) {
    return "NO_IMAGE";
  }

  await deleteFile(user.imagePublicId);

  await userModel.findByIdAndUpdate(userId, {
    imageUrl: null,
    imagePublicId: null,
  });

  return "OK";
};
