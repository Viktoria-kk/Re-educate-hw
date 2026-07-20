import { Router } from "express";
import {
  getCurrentUser,
  signIn,
  signUp,
} from "../controllers/auth.controller.js";
import { isAuth } from "../middlewares/is-auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { signInSchema, signUpSchema } from "../validations/auth.validation.js";
const router = Router();
router.post("/sign-up", validate(signUpSchema), signUp);
router.post("/sign-in", validate(signInSchema), signIn);
router.get("/current-user", isAuth, getCurrentUser);
export default router;
