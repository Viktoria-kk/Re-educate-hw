import express from "express";
import expenseRoutes from "./expenses/expense.routes.js";
import connectDB from "./config/db.config.js";

const port = 4000;
const app = express();

app.use(express.json());

app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});

app.use("/expenses", expenseRoutes);

connectDB().then(() => {
  app.listen(port, () => {
    console.log("server running on http://localhost:4000");
  });
});
