import express from "express";
import expenseRoutes from "./expenses/expense.routes.js";
import randomFactRoutes from "./randomFact/randomFact.routes.js";
const port = 4000;
const app = express();

app.use(express.json());

app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});

app.use("/expenses", expenseRoutes);
app.use("/", randomFactRoutes);
