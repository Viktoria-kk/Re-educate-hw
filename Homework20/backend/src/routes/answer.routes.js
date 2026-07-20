import { Router } from "express";
import { answerQuestion } from "../controllers/answer.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { answerSchema } from "../validations/answer.validation.js";
import { isAuth } from "../middlewares/is-auth.middleware.js";
const router = Router();
router.post("/", isAuth, validate(answerSchema), answerQuestion);
export default router;
