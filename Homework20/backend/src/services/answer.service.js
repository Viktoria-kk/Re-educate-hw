import User from "../models/user.model.js";
import Quiz from "../models/quiz.model.js";
import { getLeaderboard } from "./leaderboard.service.js";

export async function submitAnswer(payload, io) {
  const quiz = await Quiz.findById(payload.quizId);
  if (!quiz) {
    const error = new Error("Quiz not found");
    error.status = 404;
    throw error;
  }
  const question = quiz.questions[payload.questionIndex];
  if (!question) {
    const error = new Error("Invalid question index");
    error.status = 400;
    throw error;
  }
  if (payload.selectedAnswerIndex >= question.options.length) {
    const error = new Error("Invalid answer index");
    error.status = 400;
    throw error;
  }
  const isCorrect = payload.selectedAnswerIndex === question.correctAnswerIndex;
  const earnedPoints = isCorrect ? question.points : 0;
  const answer = {
    quizId: quiz._id,
    questionIndex: payload.questionIndex,
    selectedAnswerIndex: payload.selectedAnswerIndex,
    isCorrect,
    earnedPoints,
    answeredAt: new Date(),
  };
  const user = await User.findOneAndUpdate(
    {
      _id: payload.userId,
      answerHistory: {
        $not: {
          $elemMatch: {
            quizId: quiz._id,
            questionIndex: payload.questionIndex,
          },
        },
      },
    },
    {
      $push: { answerHistory: answer },
      $inc: {
        answeredQuestionsCount: 1,
        correctAnswers: isCorrect ? 1 : 0,
        totalScore: earnedPoints,
      },
    },
    { new: true },
  );
  if (!user) {
    if (!(await User.exists({ _id: payload.userId }))) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    const error = new Error("You have already answered this question");
    error.status = 409;
    throw error;
  }
  const leaderboard = await getLeaderboard();
  io.emit("leaderboard:update", leaderboard);
  return {
    isCorrect,
    earnedPoints,
    correctAnswerIndex: question.correctAnswerIndex,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      totalScore: user.totalScore,
      correctAnswers: user.correctAnswers,
      answeredQuestions: user.answeredQuestionsCount,
    },
  };
}
