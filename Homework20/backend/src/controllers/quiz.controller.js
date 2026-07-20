import Quiz from "../models/quiz.model.js";
const hideAnswers = (quiz) => ({
  ...quiz,
  questions: quiz.questions.map(
    ({ correctAnswerIndex, ...question }) => question,
  ),
});
export async function listQuizzes(req, res, next) {
  try {
    const quizzes = await Quiz.find().lean();
    res.json(quizzes.map(hideAnswers));
  } catch (error) {
    next(error);
  }
}
export async function getQuiz(req, res, next) {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(hideAnswers(quiz));
  } catch (error) {
    next(error);
  }
}
