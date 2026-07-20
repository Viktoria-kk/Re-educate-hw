import User from "../models/user.model.js";
export async function createUser(req, res, next) {
  try {
    res.status(201).json(await User.create(req.body));
  } catch (error) {
    next(error);
  }
}
export async function listUsers(req, res, next) {
  try {
    res.json(await User.find().select("-answerHistory"));
  } catch (error) {
    next(error);
  }
}
export async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    next(error);
  }
}
export async function updateUser(req, res, next) {
  try {
    if (req.userId !== req.params.id) return res.status(403).json({ message: "You can only update your own profile" });
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    next(error);
  }
}
