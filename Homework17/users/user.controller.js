const { Router } = require("express");
const UserService = require("./user.service");
const isValidMongoIdMiddleware = require("../middlewares/is-valid-mongo-id.middleware");
const isAuthMiddleware = require("../middlewares/is-auth.middleware");
const upload = require("../middlewares/upload.middleware");

const userRouter = new Router();

userRouter.get("/", isAuthMiddleware, async (req, res) => {
  const users = await UserService.getAllUsers(req.query);

  res.json(users);
});

userRouter.put(
  "/profile-image",
  isAuthMiddleware,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const updatedUser = await UserService.updateProfileImage(
        req.userId,
        req.file,
      );

      if (updatedUser === "NO_FILE") {
        return res.status(400).json({ message: "profile image is required" });
      }

      if (updatedUser === "USER_NOT_FOUND") {
        return res.status(404).json({ message: "user not found" });
      }

      res.json({
        message: "profile image updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  },
);

userRouter.delete("/profile-image", isAuthMiddleware, async (req, res) => {
  try {
    const resp = await UserService.deleteProfileImage(req.userId);

    if (resp === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "user not found" });
    }

    if (resp === "NO_IMAGE") {
      return res.status(400).json({ message: "user has no profile image" });
    }

    res.json({ message: "profile image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
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
