import mongoose from "mongoose";

const answerHistorySchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    questionIndex: { type: Number, required: true },
    selectedAnswerIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    earnedPoints: { type: Number, required: true },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    totalScore: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    answeredQuestionsCount: { type: Number, default: 0 },
    answerHistory: { type: [answerHistorySchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.virtual("answeredQuestions").get(function () {
  return this.answeredQuestionsCount;
});
export default mongoose.model("User", userSchema);
