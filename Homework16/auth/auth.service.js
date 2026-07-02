const userModel = require("../users/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.signUp = async ({ fullName, email, password, birthDate }) => {
  const existUser = await userModel.findOne({ email });

  if (existUser) {
    return "ALREADY_EXISTS";
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userModel.create({
    fullName,
    email,
    password: hashedPass,
    birthDate,
    blogs: [],
  });

  return "OK";
};

exports.signIn = async ({ email, password }) => {
  const existUser = await userModel.findOne({ email }).select("+password");

  if (!existUser) {
    return "INVALID_CREDENTIALS";
  }

  const isPassEqual = await bcrypt.compare(password, existUser.password);

  if (!isPassEqual) {
    return "INVALID_CREDENTIALS";
  }

  const payLoad = {
    userId: existUser._id,
  };

  const accessToken = jwt.sign(payLoad, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return accessToken;
};

exports.currentUser = async (userId) => {
  const existsUser = await userModel.findById(userId).populate("blogs");

  return existsUser;
};
