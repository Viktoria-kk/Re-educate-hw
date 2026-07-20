import User from "../models/user.model.js";
export async function getLeaderboard() {
  const users = await User.find()
    .sort({ totalScore: -1, correctAnswers: -1, createdAt: 1 })
    .limit(20)
    .select("username totalScore correctAnswers answeredQuestionsCount")
    .lean();
  return users.map(({ answeredQuestionsCount, ...user }) => ({
    ...user,
    answeredQuestions: answeredQuestionsCount,
  }));
}
