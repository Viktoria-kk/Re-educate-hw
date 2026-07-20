import { Router } from "express";
import {
  createUser,
  getUser,
  listUsers,
  updateUser,
} from "../controllers/user.controller.js";
import { validateObjectId } from "../middlewares/validate-object-id.middleware.js";
import { isAuth } from "../middlewares/is-auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createUserSchema,
  updateUserSchema,
} from "../validations/user.validation.js";
const router = Router();
router.route("/").get(listUsers);
router
  .route("/:id")
  .get(validateObjectId, getUser)
  .patch(validateObjectId, isAuth, validate(updateUserSchema), updateUser);
export default router;
