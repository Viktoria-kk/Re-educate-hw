import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: [(value) => value.length === 4, "Four options are required"],
    },
    correctAnswerIndex: { type: Number, required: true, min: 0, max: 3 },
    points: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },
    topic: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    questions: {
      type: [questionSchema],
      required: true,
      validate: [
        (value) => value.length >= 5,
        "At least five questions are required",
      ],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Quiz", quizSchema);
