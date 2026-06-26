import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB Connected successfully");
  } catch (e) {
    console.log("Could not connect to DB", e);
  }
};

export default connectToDB;
