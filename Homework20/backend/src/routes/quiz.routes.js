import { Router } from "express";
import { getQuiz, listQuizzes } from "../controllers/quiz.controller.js";
import { validateObjectId } from "../middlewares/validate-object-id.middleware.js";
const router = Router();
router.get("/", listQuizzes);
router.get("/:id", validateObjectId, getQuiz);
export default router;
