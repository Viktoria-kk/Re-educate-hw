const { Router } = require("express");
const UserService = require("./user.service");
const isValidMongoIdMiddleware = require("../middlewares/is-valid-mongo-id.middleware");
const isAuthMiddleware = require("../middlewares/is-auth.middleware");

const userRouter = new Router();

userRouter.get("/", isAuthMiddleware, async (req, res) => {
  const users = await UserService.getAllUsers(req.query);

  res.json(users);
});

userRouter.get(
  "/:id",
  isValidMongoIdMiddleware,
  isAuthMiddleware,
  async (req, res) => {
    const user = await UserService.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    res.json(user);
  },
);

userRouter.delete(
  "/:id",
  isValidMongoIdMiddleware,
  isAuthMiddleware,
  async (req, res) => {
    const deletedUser = await UserService.deleteUserById(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "user not found" });
    }

    res.json({
      message: "user deleted successfully",
      data: deletedUser,
    });
  },
);

userRouter.put(
  "/:id",
  isValidMongoIdMiddleware,
  isAuthMiddleware,
  async (req, res) => {
    const updatedUser = await UserService.updateUserById(
      req.params.id,
      req.body,
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "user not found" });
    }

    res.json({
      message: "user updated successfully",
      data: updatedUser,
    });
  },
);

module.exports = userRouter;
