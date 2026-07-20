import mongoose from "mongoose";

export async function connectDatabase() {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI;
  if (!mongoUrl) throw new Error("MONGO_URL is missing from the environment variables");
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing from the environment variables");
  mongoose.connection.on("error", (error) => console.error("MongoDB error:", error.message));
  await mongoose.connect(mongoUrl);
  console.log("Database connected successfully");
}
