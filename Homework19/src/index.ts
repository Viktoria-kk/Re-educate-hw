import "dotenv/config";
import express from "express";
import { connectToDb } from "./config/db.config.js";
import { productRouter } from "./routes/product.routes.js";

const app = express();

app.use(express.json());
app.use("/products", productRouter);

connectToDb().then(() => {
  app.listen(4000, () => {
    console.log("server running on http://localhost:4000");
  });
});
