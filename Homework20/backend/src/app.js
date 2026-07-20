import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import answerRoutes from "./routes/answer.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { notFound } from "./middlewares/not-found.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

app.get("/", (req, res) =>
  res.redirect(process.env.CLIENT_URL || "http://localhost:3000"),
);
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.use(notFound);
app.use(errorHandler);
export default app;
