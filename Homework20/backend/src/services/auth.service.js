import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const publicUser = (user) => ({ _id: user._id, username: user.username, email: user.email, totalScore: user.totalScore, correctAnswers: user.correctAnswers, answeredQuestions: user.answeredQuestionsCount, createdAt: user.createdAt });
const tokenFor = (id) => jwt.sign({ userId: String(id) }, process.env.JWT_SECRET, { expiresIn: "7d" });

export async function signUp({ username, email, password }) {
  let user = await User.findOne({ email }).select("+password");
  if (user?.password) { const error = new Error("A user with this email already exists"); error.status = 409; throw error; }
  const passwordHash = await bcrypt.hash(password, 10);
  if (user) {
    user.username = username;
    user.password = passwordHash;
    await user.save();
  } else {
    user = await User.create({ username, email, password: passwordHash });
  }
  return { accessToken: tokenFor(user._id), user: publicUser(user) };
}
export async function signIn({ email, password }) {
  const user = await User.findOne({ email }).select("+password");
  if (!user?.password || !(await bcrypt.compare(password, user.password))) { const error = new Error("Email or password is incorrect"); error.status = 401; throw error; }
  return { accessToken: tokenFor(user._id), user: publicUser(user) };
}
export async function currentUser(id) { const user = await User.findById(id); return user ? publicUser(user) : null; }
