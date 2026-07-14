import mongoose from "mongoose";

export const connectToDb = async () => {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error("MONGO_URL is missing from the environment variables");
  }

  await mongoose.connect(mongoUrl);
  console.log("Database connected successfully");
};
