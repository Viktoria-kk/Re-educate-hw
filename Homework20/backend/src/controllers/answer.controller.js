import { submitAnswer } from "../services/answer.service.js";
export async function answerQuestion(req, res, next) {
  try {
    if (req.userId !== req.body.userId) {
      return res.status(403).json({ message: "You can only submit answers for your own account" });
    }
    res.json(await submitAnswer(req.body, req.app.get("io")));
  } catch (error) {
    next(error);
  }
}
