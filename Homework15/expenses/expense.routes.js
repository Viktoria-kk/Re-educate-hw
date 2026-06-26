import { Router } from "express";
import { validateExpense } from "../middlewares/validateExpense.middleware.js";
import { deleteAuth } from "../middlewares/deleteAuth.middleware.js";
import {
  createExpense,
  deleteExpense,
  getAllExpenses,
  getExpenseById,
  getTopExpenses,
  updateExpense,
} from "./expense.controller.js";
import { validateObjectId } from "../middlewares/isValidMongoId.middleware.js";

const expenseRouter = Router();

expenseRouter.get("/", getAllExpenses);
expenseRouter.get("/top-5", getTopExpenses);
expenseRouter.get("/:id", validateObjectId, getExpenseById);
expenseRouter.post("/", validateExpense, createExpense);
expenseRouter.put("/:id", validateObjectId, updateExpense);
expenseRouter.delete("/:id", validateObjectId, deleteAuth, deleteExpense);

export default expenseRouter;
