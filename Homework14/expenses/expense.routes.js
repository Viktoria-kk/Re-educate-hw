import { Router } from "express";
import { validateExpense } from "../middlewares/validateExpense.middleware.js";
import { deleteAuth } from "../middlewares/deleteAuth.middleware.js";
import {
  createExpense,
  deleteExpense,
  getAllExpenses,
} from "./expense.controller.js";

const expenseRouter = Router();

expenseRouter.get("/", getAllExpenses);
expenseRouter.post("/", validateExpense, createExpense);
expenseRouter.delete("/:id", deleteAuth, deleteExpense);

export default expenseRouter;
